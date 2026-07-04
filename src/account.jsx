import React from "react";
import { useNavigate } from "react-router-dom";

function Access() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/subject");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Smart Study</h1>

        <p>Login to your notes</p>

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
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button type="submit" className="primary-button">
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}

export default Access;