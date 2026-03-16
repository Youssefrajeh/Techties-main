import { useState, useRef, useEffect } from "react";
import "./SkillsInput.css";

const SUGGESTED_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "React",
  "Angular",
  "Vue.js",
  "Next.js",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "Spring Boot",
  "ASP.NET",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "CI/CD",
  "GraphQL",
  "REST API",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Figma",
  "UI/UX Design",
  "Agile",
  "Scrum",
  "DevOps",
  "Machine Learning",
  "Data Science",
  "TensorFlow",
  "PyTorch",
  "Cybersecurity",
  "Blockchain",
  "Mobile Development",
  "React Native",
  "Flutter",
  "Linux",
  "Networking",
];

export default function SkillsInput({
  skills = [],
  onChange,
  maxSkills = 10,
  error,
}) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const getSkillName = (skill) =>
    typeof skill === "string" ? skill : skill?.name || "";

  const normalizedSkills = skills
    .map(getSkillName)
    .filter(Boolean);

  const selectedNames = normalizedSkills.map((name) => name.toLowerCase());

  const filtered = query.trim()
    ? SUGGESTED_SKILLS.filter(
        (s) =>
          s.toLowerCase().includes(query.toLowerCase()) &&
          !selectedNames.includes(s.toLowerCase())
      )
    : SUGGESTED_SKILLS.filter((s) => !selectedNames.includes(s.toLowerCase()));

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addSkill = (name) => {
    if (normalizedSkills.length >= maxSkills) return;
    if (selectedNames.includes(name.toLowerCase())) return;

    const newSkills = [...normalizedSkills, name];
    onChange(newSkills);
    setQuery("");
    setHighlightIdx(-1);
    inputRef.current?.focus();
  };

  const removeSkill = (index) => {
    const newSkills = normalizedSkills.filter((_, i) => i !== index);
    onChange(newSkills);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && filtered[highlightIdx]) {
        addSkill(filtered[highlightIdx]);
      } else if (
        query.trim() &&
        !selectedNames.includes(query.trim().toLowerCase())
      ) {
        addSkill(query.trim());
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && !query && normalizedSkills.length > 0) {
      removeSkill(normalizedSkills.length - 1);
    }
  };

  return (
    <div className="skills-input" ref={wrapperRef}>
      <label className="skills-input__label">
        Skills
        <span className="skills-input__count">
          {normalizedSkills.length}/{maxSkills}
        </span>
      </label>

      <div
        className="skills-input__box"
        onClick={() => inputRef.current?.focus()}
      >
        {normalizedSkills.map((skill, i) => (
          <span key={`${skill}-${i}`} className="skills-input__tag">
            {skill}
            <button
              type="button"
              className="skills-input__tag-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(i);
              }}
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}

        {normalizedSkills.length < maxSkills && (
          <input
            ref={inputRef}
            type="text"
            className="skills-input__field"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setHighlightIdx(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={normalizedSkills.length === 0 ? "Type a skill…" : ""}
            aria-label="Add skill"
          />
        )}
      </div>

      {showSuggestions &&
        filtered.length > 0 &&
        normalizedSkills.length < maxSkills && (
          <ul className="skills-input__suggestions" role="listbox">
            {filtered.slice(0, 8).map((skill, i) => (
              <li
                key={skill}
                className={`skills-input__suggestion ${i === highlightIdx ? "skills-input__suggestion--active" : ""}`}
                onClick={() => addSkill(skill)}
                role="option"
                aria-selected={i === highlightIdx}
              >
                {skill}
              </li>
            ))}
          </ul>
        )}

      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
}