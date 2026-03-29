import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import logoImg from "../assets/logo/logo.png";
import "./Login.css";

/* ── Helpers ───────────────────────────────────────── */
function validateLogin(email, password) {
  const errors = {};

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  /* Email required */
  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (trimmedEmail.length > 254) {
    /* Email max length */
    errors.email = "Email is too long.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    /* Email format validation */
    errors.email = "Please enter a valid email address.";
  }

  /* Password required */
  if (!trimmedPassword) {
    errors.password = "Password is required.";
  } else if (trimmedPassword.length < 8) {
    /* Password minimum length */
    errors.password = "Password must be at least 8 characters.";
  } else if (trimmedPassword.length > 128) {
    /* Password max length (security protection) */
    errors.password = "Password is too long.";
  }

  return errors;
}


/* ── Component ─────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    // Run validation using new email
    const errs = validateLogin(value, password);

    setErrors((prev) => ({
      ...prev,
      email: errs.email,
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);

    // Run validation using new password
    const errs = validateLogin(email, value);

    setErrors((prev) => ({
      ...prev,
      password: errs.password,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Prevent double submit */
    if (loading) return;

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    /* Run validation */
    const errs = validateLogin(cleanEmail, cleanPassword);

    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        const user = data.user || {};
        localStorage.setItem("techties_session", JSON.stringify({
          email: user.email || data.email,
          name: user.name || data.name,
          role: user.role,
          loggedInAt: Date.now(),
        }));
        navigate(user.role === 'pm' ? '/admin' : '/dashboard');
      } else {
        setErrors({
          form: data.message || "Invalid email or password.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        form: "Unable to login. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      {/* Left — Branding */}
      <div className="login-branding">
        <div className="login-branding__inner">
          <Link to="/" className="login-branding__logo">
            <img
              src={logoImg}
              alt="TechTies Logo"
              className="login-branding__logo-img"
            />
          </Link>

          <h1 className="login-branding__tagline">
            Connect. Collaborate.
            <br />
            Grow Together.
          </h1>

          <div className="login-branding__benefits">
            <div className="login-branding__benefit">
              <span className="login-branding__benefit-icon">✓</span>
              <span>
                Network smarter with tech professionals who share your interests
              </span>
            </div>
            <div className="login-branding__benefit">
              <span className="login-branding__benefit-icon">✓</span>
              <span>
                AI-powered matching finds your ideal connections instantly
              </span>
            </div>
            <div className="login-branding__benefit">
              <span className="login-branding__benefit-icon">✓</span>
              <span>Free forever plan with unlimited messaging and events</span>
            </div>
          </div>
        </div>

        <div className="login-branding__footer">
          <p>
            Built by <strong>Heartware</strong> team ♥
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="login-form-panel">
        <div className="login-card">
          <h2 className="login-card__title">Welcome back</h2>
          <p className="login-card__subtitle">
            Log in to your TechTies account
          </p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className="login-form__error" role="alert">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {errors.form}
              </div>
            )}

            <Input
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <div className="login-form__row">
              <div className="login-form__checkbox">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="login-form__forgot">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          {/* Sign up link */}
          <p className="login-signup">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
