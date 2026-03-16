import './Card.css';

export default function Card({
  children,
  icon,
  iconVariant = 'primary',
  title,
  text,
  hoverable = true,
  className = '',
  ...props
}) {
  return (
    <div className={`card ${hoverable ? 'card--hoverable' : ''} ${className}`} {...props}>
      {icon && (
        <div className={`card__icon card__icon--${iconVariant}`} aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <h3 className="card__title">{title}</h3>}
      {text && <p className="card__text">{text}</p>}
      {children}
    </div>
  );
}
