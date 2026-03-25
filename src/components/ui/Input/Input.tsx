import type { InputType } from './Input.types';
import { inputBaseStyles, inputTypes } from './Input.types';

export interface InputProps {
  type?: InputType;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Input({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  ariaLabel,
}: InputProps) {
  const typeStyles = inputTypes[type] || inputTypes.text;
  const errorStyles = error ? 'border-tertiary focus:border-tertiary' : '';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="font-body text-label text-on-surface/70 block">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel || label}
        className={`${inputBaseStyles} ${typeStyles} ${errorStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {error && <p className="font-body text-sm text-tertiary">{error}</p>}
    </div>
  );
}
