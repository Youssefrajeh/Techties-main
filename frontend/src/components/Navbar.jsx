import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Button from "./Button";
import logoImg from "../assets/logo/logo.png";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={closeDrawer}>
            <img src={logoImg} alt="TechTies Logo" className="navbar__logo-img" />
          </Link>

          {/* Desktop links */}
          <div className="navbar__links">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="navbar__link">
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="navbar__actions">
            <Button variant="ghost" size="sm" to="/login">
              Log in
            </Button>
            <Button variant="primary" size="sm" to="/register">
              Sign up
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`navbar__hamburger ${drawerOpen ? "navbar__hamburger--open" : ""}`}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Portal: render backdrop + drawer directly on body so they're above everything */}
      {createPortal(
        <>
          <div
            className={`navbar__backdrop ${drawerOpen ? "navbar__backdrop--open" : ""}`}
            onClick={closeDrawer}
          />
          <div
            className={`navbar__drawer ${drawerOpen ? "navbar__drawer--open" : ""}`}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="navbar__link"
                onClick={closeDrawer}
              >
                {link.label}
              </a>
            ))}
            <div className="navbar__drawer-actions">
              <Button variant="outline" fullWidth to="/login" onClick={closeDrawer}>
                Log in
              </Button>
              <Button
                variant="primary"
                fullWidth
                to="/register"
                onClick={closeDrawer}
              >
                Sign up
              </Button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

