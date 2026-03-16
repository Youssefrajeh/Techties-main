import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import logoImg from "../assets/logo/logo.png";
import "./Register.css";

function validate(name, email, password, confirmPassword) {
  const errors = {};

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedConfirm = confirmPassword.trim();

  /* NAME VALIDATION */

  if (!trimmedName) {
    errors.name = "Full name is required.";
  } else if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (trimmedName.length > 50) {
    errors.name = "Name is too long.";
  } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    errors.name = "Name contains invalid characters.";
  }

  /* EMAIL VALIDATION */

  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (trimmedEmail.length > 254) {
    errors.email = "Email is too long.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  /* PASSWORD VALIDATION */

  if (!trimmedPassword) {
    errors.password = "Password is required.";
  } else if (trimmedPassword.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(trimmedPassword)) {
    errors.password = "Password must include an uppercase letter.";
  } else if (!/[a-z]/.test(trimmedPassword)) {
    errors.password = "Password must include a lowercase letter.";
  } else if (!/[0-9]/.test(trimmedPassword)) {
    errors.password = "Password must include a number.";
  } else if (!/[!@#$%^&*]/.test(trimmedPassword)) {
    errors.password = "Password must include a special character.";
  }

  /* CONFIRM PASSWORD */

  if (!trimmedConfirm) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (trimmedPassword !== trimmedConfirm) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function passwordRules(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
}

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState(passwordRules(""));
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);

  const handleNameChange = (e) => {
    const value = e.target.value;

    setName(value);

    const errs = validate(value, email, password, confirmPassword);

    setErrors((prev) => ({
      ...prev,
      name: errs.name,
    }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    const errs = validate(name, value, password, confirmPassword);

    setErrors((prev) => ({
      ...prev,
      email: errs.email,
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);

    // Show rules once user starts typing
    setShowPasswordRules(value.length > 0);

    // Update password checklist
    setPasswordChecks(passwordRules(value));

    const errs = validate(name, email, value, confirmPassword);

    setErrors((prev) => ({
      ...prev,
      password: errs.password,
    }));
  };


  const handleConfirmChange = (e) => {
    const value = e.target.value;

    setConfirmPassword(value);

    if (value.length === 0) {
      setPasswordMatch(null);
      return;
    }

    if (password === value) {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = validate(name, email, password, confirmPassword);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
  
    setLoading(true);
  
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });
  
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: await res.text() };
  
      if (res.ok) {
        localStorage.setItem("token", data.token);
  
        localStorage.setItem(
          "techties_session",
          JSON.stringify({
            email: data.user.email,
            name: data.user.name,
            token: data.token,
            isNewUser: true,
            loggedInAt: Date.now(),
          })
        );
  
        navigate("/profile/setup");
      } else {
        setErrors({ form: data.message || data.msg || "Registration failed." });
      }
    } catch (err) {
      console.error(err);
      setErrors({ form: "Network error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left — Branding */}
      <div className="register-branding">
        <div className="register-branding__inner">
          <Link to="/" className="register-branding__logo">
            <img
              src={logoImg}
              alt="TechTies Logo"
              className="register-branding__logo-img"
            />
          </Link>

          <h1 className="register-branding__tagline">
            Join the Network.
            <br />
            Shape Your Career.
          </h1>

          <div className="register-branding__benefits">
            <div className="register-branding__benefit">
              <span className="register-branding__benefit-icon">🚀</span>
              <span>Build your professional profile in minutes</span>
            </div>
            <div className="register-branding__benefit">
              <span className="register-branding__benefit-icon">🤝</span>
              <span>Connect with developers, designers & tech leaders</span>
            </div>
            <div className="register-branding__benefit">
              <span className="register-branding__benefit-icon">💡</span>
              <span>Get matched based on your skills and interests</span>
            </div>
          </div>
        </div>

        <div className="register-branding__footer">
          <p>
            Built by <strong>Heartware</strong> team ♥
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="register-form-panel">
        <div className="register-card">
          <h2 className="register-card__title">Create your account</h2>
          <p className="register-card__subtitle">
            Start building meaningful tech connections
          </p>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className="register-form__error" role="alert">
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
              id="register-name"
              label="Full Name"
              placeholder="Alex Johnson"
              value={name}
              onChange={handleNameChange}
              error={errors.name}
              required
              autoComplete="name"
            />

            <Input
              id="register-email"
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
              id="register-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <div
              className={`password-rules ${showPasswordRules ? "visible" : ""}`}
            >
              <p>Password must contain:</p>

              <ul>
                <li className={passwordChecks.length ? "valid" : ""}>
                  At least 8 characters
                </li>

                <li className={passwordChecks.uppercase ? "valid" : ""}>
                  One uppercase letter
                </li>

                <li className={passwordChecks.lowercase ? "valid" : ""}>
                  One lowercase letter
                </li>

                <li className={passwordChecks.number ? "valid" : ""}>
                  One number
                </li>

                <li className={passwordChecks.special ? "valid" : ""}>
                  One special character
                </li>
              </ul>
            </div>

            <Input
              id="register-confirm"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={handleConfirmChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
            {passwordMatch === true && (
              <div className="password-match success">✔ Passwords match</div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="register-signup">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
