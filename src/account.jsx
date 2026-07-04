import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Access() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  // Check if user already logged in
  useEffect(() => {
    axios
      .get("/api/auth/user", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          navigate("/subject");
        }
      })
      .catch((err) => {
        console.log("Auth check failed:", err.message);
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const route =
        authMode === "signup"
          ? "/api/auth/signup"
          : "/api/auth/login";

      const response = await axios.post(route, form, { withCredentials: true });

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

        <p>
          {authMode === "signup"
            ? "Create your account"
            : "Login to your notes"}
        </p>

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
              minLength={6}
              autoComplete={
                authMode === "signup"
                  ? "new-password"
                  : "current-password"
              }
            />
          </label>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button type="submit" className="primary-button">
            {authMode === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="text-button"
            onClick={() =>
              setAuthMode(
                authMode === "signup" ? "login" : "signup"
              )
            }
          >
            {authMode === "signup"
              ? "Already have an account? Login"
              : "Create a new account"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default Access;