/**
 * Labeled form control with icon and error message.
 * as = "input" (default) | "select" | "textarea". Extra props go to the control.
 */
export default function FormField({
  label,
  name,
  error,
  hint,
  icon: Icon,
  rightSlot,
  as: Control = "input",
  className = "",
  ...controlProps
}) {
  return (
    <div className={`field ${error ? "field-has-error" : ""} ${className}`}>
      {label && <label htmlFor={name}>{label}</label>}
      <div className={`input-wrap ${Icon ? "has-icon" : ""}`}>
        {Icon && <Icon size={18} className="input-icon" />}
        <Control id={name} name={name} {...controlProps} />
        {rightSlot}
      </div>
      {error ? <p className="field-msg">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

