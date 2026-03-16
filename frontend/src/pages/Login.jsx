import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { mockSocialLogin } from "../utils/auth";
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

/* Google icon */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C3.99 3.47 7.7 1 12 1c1.67 0 3.14.59 4.29 1.67l3.22-3.22C17.45.75 14.94 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/* GitHub icon */
function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/* ── Component ─────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

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

  const handleSocialLogin = async (provider) => {
    if (socialLoading || loading) return;

    setSocialLoading(provider);

    try {
      const res = await mockSocialLogin(provider);

      if (res.success) {
        navigate("/dashboard");
      } else {
        setErrors({ form: "Social login failed." });
      }
    } catch {
      setErrors({ form: "Social login failed. Please try again." });
    } finally {
      setSocialLoading(null);
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

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider__line" />
            <span className="login-divider__text">or</span>
            <span className="login-divider__line" />
          </div>

          {/* Social */}
          <div className="login-socials">
            <Button
              variant="social"
              icon={<GoogleIcon />}
              onClick={() => handleSocialLogin("google")}
              loading={socialLoading === "google"}
              disabled={!!socialLoading || loading}
            >
              {socialLoading === "google"
                ? "Connecting…"
                : "Continue with Google"}
            </Button>
            <Button
              variant="social"
              icon={<GitHubIcon />}
              onClick={() => handleSocialLogin("github")}
              loading={socialLoading === "github"}
              disabled={!!socialLoading || loading}
            >
              {socialLoading === "github"
                ? "Connecting…"
                : "Continue with GitHub"}
            </Button>
          </div>

          {/* Sign up link */}
          <p className="login-signup">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
