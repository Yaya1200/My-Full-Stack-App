import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Access() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/auth/user`, { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          navigate("/subject");
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const route = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const response = await axios.post(`${apiUrl}${route}`, form, {
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        navigate("/subject");
      } else {
        setError(response.data.error || "Authentication failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Smart Study</h1>
        <p>{authMode === "signup" ? "Create your account" : "Login to your notes"}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              minLength={6}
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="primary-button">
            {authMode === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <button type="button" className="text-button" onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}> 
            {authMode === "signup" ? "Already have an account? Login" : "Create a new account"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default Access;
