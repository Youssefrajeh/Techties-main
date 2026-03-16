import { useState } from 'react';
import './Accordion.css';

export default function Accordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="accordion">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`accordion__item ${isOpen ? 'accordion__item--open' : ''}`}>
            <button
              className="accordion__trigger"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${i}`}
              id={`accordion-trigger-${i}`}
            >
              <span>{item.question}</span>
              <svg
                className="accordion__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div
              id={`accordion-panel-${i}`}
              role="region"
              aria-labelledby={`accordion-trigger-${i}`}
              className={`accordion__panel ${isOpen ? 'accordion__panel--open' : ''}`}
            >
              <div className="accordion__content">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
