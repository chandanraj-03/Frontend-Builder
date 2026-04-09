import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authcontext.jsx";
import { authAPI } from "../../services/api.js";
import "./login.css";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/between");

      } else if (mode === "signup") {
        if (password !== confirm) { setError("Passwords do not match."); setLoading(false); return; }
        await signup(name, email, password);
        navigate("/between");

      } else if (mode === "reset") {
        await authAPI.forgotPassword(email);
        setSuccess("Reset link sent! Check your inbox.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <video className="background-video" autoPlay loop muted playsInline>
        <source src="/Automated_Video_Generation.mp4" type="video/mp4" />
      </video>
      <div className="overlay"></div>

      <Link to="/" style={{ textDecoration: "none" }}>
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
          <span className="logo-text">Frontend AI Builder</span>
        </div>
      </Link>

      <div className="text-container">
        <h1>Build your frontend with AI</h1>
        <p>
          👉Frontend AI Builder is a platform that allows you to create beautiful interfaces using
          artificial intelligence.<br />
          👉No need to write code, just describe your idea and we generate the frontend.<br />
          👉50+ Ready-Made Templates — don't need to describe logical terms.<br />
          👉Instead of one giant prompt, the work is split across 6 specialized agents — each focusing
          on one concern (requirements → pages → plan → code → docs).<br /><br /><hr />
        </p>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">
          {mode === "login" && "Login"}
          {mode === "signup" && "Create Account"}
          {mode === "reset" && "Reset Password"}
        </h2>

        {error && <p style={{ color: "#ef4444", marginBottom: 8, fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: "#22c55e", marginBottom: 8, fontSize: 14 }}>{success}</p>}

        <form className="auth-form" onSubmit={handleAuth}>
          {mode === "signup" && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" value={name}
                onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {mode !== "reset" && (
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}

          {mode === "signup" && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm your password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required />
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Please wait..." : (
              <>
                {mode === "login" && "Login"}
                {mode === "signup" && "Sign Up"}
                {mode === "reset" && "Send Reset Link"}
              </>
            )}
          </button>
        </form>

        {mode === "login" && (
          <>
            <p className="link-text"><button onClick={() => setMode("reset")}>Forgot Password?</button></p>
            <p className="link-text">Don't have an account?<button onClick={() => setMode("signup")}>Sign Up</button></p>
          </>
        )}
        {mode === "signup" && (
          <p className="link-text">Already have an account?<button onClick={() => setMode("login")}>Login</button></p>
        )}
        {mode === "reset" && (
          <p className="link-text">Remember your password?<button onClick={() => setMode("login")}>Back to Login</button></p>
        )}
      </div>
    </div>
  );
};

export default Login;