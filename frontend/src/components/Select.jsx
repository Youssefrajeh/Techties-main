import './Select.css';

export default function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  required = false,
  placeholder = 'Select an option…',
  ...props
}) {
  return (
    <div className="select-group">
      {label && (
        <label htmlFor={id} className="select-group__label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="select-group__wrapper">
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className={`select-group__field ${error ? 'select-group__field--error' : ''} ${!value ? 'select-group__field--placeholder' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="select-group__chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {error && (
        <span id={`${id}-error`} className="select-group__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
