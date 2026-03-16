import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Card from '../components/Card';
import Section from '../components/Section';
import Accordion from '../components/Accordion';
import logoImg from '../assets/logo/logo.png';
import landingPageImg from '../assets/logo/landingpage.png';
import './Landing.css';

/* ── Data ──────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    title: 'Smart Matching',
    text: 'Our algorithm connects you with like-minded tech professionals based on skills, interests, and goals.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    title: 'Real-Time Chat',
    text: 'Instant messaging with rich media support. Share code snippets, links, and files seamlessly.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    title: 'Event Discovery',
    text: 'Find and join local meetups, hackathons, and tech events happening near you.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Verified Profiles',
    text: 'Every profile is verified to keep the community authentic, safe, and professional.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    title: 'Skill Insights',
    text: 'Track your networking progress with detailed analytics and activity dashboards.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    title: 'Global Network',
    text: 'Connect with tech professionals worldwide. Break geographical barriers effortlessly.',
  },
];

const STEPS = [
  {
    number: 1,
    title: 'Create Your Profile',
    text: 'Sign up in seconds and build a profile that showcases your skills and interests.',
  },
  {
    number: 2,
    title: 'Discover Connections',
    text: 'Browse curated matches or search for people with specific expertise and goals.',
  },
  {
    number: 3,
    title: 'Start Collaborating',
    text: 'Chat, share ideas, and build meaningful professional relationships that last.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Is TechTies free to use?',
    answer: 'Yes! TechTies offers a generous free tier that includes profile creation, basic matching, and messaging. We also offer Pro and Team plans for advanced features like priority matching, unlimited events, and analytics.',
  },
  {
    question: 'How does the matching algorithm work?',
    answer: 'Our matching algorithm analyzes your skills, interests, career goals, and activity patterns to suggest the most relevant connections. The more you use TechTies, the smarter your recommendations become.',
  },
  {
    question: 'Is my data safe and private?',
    answer: 'Absolutely. We use industry-standard encryption and never sell your personal data. You have full control over what information is visible on your profile and who can contact you.',
  },
  {
    question: 'Can I use TechTies for hiring or recruiting?',
    answer: 'Yes! Our Team plan includes recruiting tools that let you search for candidates by skill, experience, and location. Many companies use TechTies to find top tech talent.',
  },
  {
    question: 'What makes TechTies different from LinkedIn?',
    answer: 'TechTies is built specifically for the tech community. Our matching is based on technical skills and project interests rather than job titles. Think of it as a networking platform designed by developers, for developers.',
  },
];

/* ── Star SVG ──────────────────────────────────────── */
function Star() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/* ── Component ─────────────────────────────────────── */
export default function Landing() {
  return (
    <>
      <Navbar />

      <main>
      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              Now in public beta
            </div>
            <h1 className="hero__title">
              Build Meaningful <span>Tech Connections</span>
            </h1>
            <p className="hero__subtitle">
              TechTies brings together developers, designers, and tech enthusiasts.
              Network smarter, collaborate faster, and grow your career — all in one place.
            </p>
            <div className="hero__ctas">
              <Button variant="primary" size="lg" to="/register">
                Get Started — It's Free
              </Button>
              <Button variant="secondary" size="lg" href="#features">
                Learn More
              </Button>
            </div>
          </div>

          <div className="hero__mockup">
            <div className="hero__mockup-img">
              <img src={landingPageImg} alt="TechTies Product Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Section
        id="features"
        badge="Features"
        title="Everything you need to network smarter"
        subtitle="Powerful tools designed to help you build genuine professional relationships in the tech industry."
      >
        <div className="features-grid">
          {FEATURES.map((f) => (
            <Card key={f.title} icon={f.icon} title={f.title} text={f.text} />
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section
        id="how-it-works"
        variant="alt"
        badge="How It Works"
        title="Get started in 3 simple steps"
        subtitle="From sign-up to your first meaningful connection — it only takes minutes."
      >
        <div className="steps">
          <div className="steps__connector" aria-hidden="true" />
          {STEPS.map((s) => (
            <div key={s.number} className="step">
              <div className="step__number">{s.number}</div>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>



      {/* FAQ */}
      <Section
        id="faq"
        variant="alt"
        badge="FAQ"
        title="Frequently asked questions"
        subtitle="Got questions? We've got answers. If you can't find what you're looking for, reach out to our support team."
      >
        <div className="faq__wrapper">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </Section>

      {/* CTA Banner */}
      <section style={{ padding: 'var(--space-4) 0 var(--space-20)' }}>
        <div className="container">
          <div className="cta-banner">
            <h2 className="cta-banner__title">Ready to grow your tech network?</h2>
            <p className="cta-banner__text">
              Join TechTies to build meaningful professional connections in the tech community.
            </p>
            <Button
              variant="secondary"
              size="lg"
              to="/register"
              style={{ background: '#fff', color: 'var(--color-primary-700)' }}
            >
              Create Your Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <Link to="/" className="footer__logo">
                <img src={logoImg} alt="TechTies Logo" className="footer__logo-img" />
              </Link>
              <p className="footer__desc">
                Connecting tech professionals worldwide. Build your network, advance your career.
              </p>
            </div>

            <div>
              <h4 className="footer__col-title">Product</h4>
              <div className="footer__col-links">
                <a href="#features" className="footer__col-link">Features</a>
                <a href="#pricing" className="footer__col-link">Pricing</a>
                <a href="#faq" className="footer__col-link">FAQ</a>
                <a href="#" className="footer__col-link">Changelog</a>
              </div>
            </div>

            <div>
              <h4 className="footer__col-title">Company</h4>
              <div className="footer__col-links">
                <a href="#" className="footer__col-link">About</a>
                <a href="#" className="footer__col-link">Blog</a>
                <a href="#" className="footer__col-link">Careers</a>
                <a href="#" className="footer__col-link">Contact</a>
              </div>
            </div>

            <div>
              <h4 className="footer__col-title">Legal</h4>
              <div className="footer__col-links">
                <a href="#" className="footer__col-link">Privacy Policy</a>
                <a href="#" className="footer__col-link">Terms of Service</a>
                <a href="#" className="footer__col-link">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            <span>&copy; {new Date().getFullYear()} TechTies. All rights reserved.</span>
            <div className="footer__socials">
              <a href="#" className="footer__social" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="footer__social" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="footer__social" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </>
  );
}
