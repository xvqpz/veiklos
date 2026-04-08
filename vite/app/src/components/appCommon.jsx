import { useState } from "react";
import "../components/employee.css";

export function AppSelect({
  value,
  onChange,
  options,
  getLabel,
  getValue = (o) => String(o.id),
  placeholder = "Pasirinkite",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const selected =
    options.find((o) => String(o.id) === String(value)) || null;

  const handleSelect = (newValue) => {
    if (onChange) onChange(newValue);
    setOpen(false);
  };

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((o) => !o);
  };

  return (
    <div className={`app-select${disabled ? " is-disabled" : ""}`}>
      <button
        type="button"
        className="field-select app-select-trigger"
        onClick={toggleOpen}
        disabled={disabled}
      >
        <span className="app-select-label">
          {selected ? getLabel(selected) : placeholder}
        </span>
        <span className="app-select-chevron">▾</span>
      </button>

      {open && !disabled && (
        <div className="app-select-dropdown">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.id}
              className="app-select-option"
              onClick={() => handleSelect(getValue(opt))}
            >
              {getLabel(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


