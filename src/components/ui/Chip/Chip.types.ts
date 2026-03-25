export type ChipSize = 'small' | 'medium' | 'large';

export const chipBaseStyles = `
  inline-flex items-center gap-2 px-4 py-2 rounded-full
  bg-surface-container-highest text-on-surface
  transition-colors duration-200 font-body
`;

export const chipSizes: Record<ChipSize, string> = {
  small: 'px-3 py-1 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-5 py-2.5 text-lg',
};
