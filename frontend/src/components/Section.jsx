import './Section.css';

export default function Section({
  children,
  id,
  badge,
  title,
  subtitle,
  variant = '',
  className = '',
}) {
  return (
    <section id={id} className={`section ${variant ? `section--${variant}` : ''} ${className}`}>
      <div className="container">
        {(badge || title || subtitle) && (
          <div className="section__header">
            {badge && <span className="section__badge">{badge}</span>}
            {title && <h2 className="section__title">{title}</h2>}
            {subtitle && <p className="section__subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
