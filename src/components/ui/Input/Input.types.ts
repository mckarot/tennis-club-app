export type InputType = 'text' | 'email' | 'password' | 'date' | 'search' | 'number' | 'tel';

export const inputBaseStyles = `
  w-full bg-surface-container-lowest border-b-2 border-surface-container-highest
  text-on-surface px-4 py-3 rounded-t-lg
  focus:outline-none focus:border-primary transition-colors duration-200
  placeholder:text-on-surface/40
`;

export const inputTypes: Record<InputType, string> = {
  text: inputBaseStyles,
  email: inputBaseStyles,
  password: inputBaseStyles,
  date: inputBaseStyles,
  search: `${inputBaseStyles} pl-10`,
  number: inputBaseStyles,
  tel: inputBaseStyles,
};
