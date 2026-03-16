import { useRef } from "react";
import "./PhotoUpload.css";

export default function PhotoUpload({ value, onChange, error }) {
  const inputRef = useRef(null);

  const handleClick = () => inputRef.current?.click();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      onChange("", "Only JPG, JPEG, PNG, or WEBP images are allowed.");
      return;
    }

    // 2 MB limit
    if (file.size > 2 * 1024 * 1024) {
      onChange("", "Photo must be under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result, "");
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange("", "");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="photo-upload">
      <div
        className={`photo-upload__preview ${error ? "photo-upload__preview--error" : ""}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        aria-label="Upload profile photo"
      >
        {value ? (
          <img
            src={value}
            alt="Profile preview"
            className="photo-upload__img"
          />
        ) : (
          <div className="photo-upload__placeholder">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Upload Photo</span>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          className="photo-upload__remove"
          onClick={handleRemove}
        >
          Remove
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="sr-only"
        tabIndex={-1}
      />

      {error && (
        <span className="photo-upload__error" role="alert">
          {error}
        </span>
      )}

      <span className="photo-upload__hint">Optional · Max 2 MB</span>
    </div>
  );
}
