import type { ReactNode } from 'react';

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children?: ReactNode;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  children,
  className = '',
}: HeroSectionProps) {
  return (
    <section
      className={`relative h-[400px] rounded-2xl overflow-hidden ${className}`}
    >
      {/* Background image with hover scale */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/50 to-transparent transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <h1 className="font-headline text-display-md font-bold text-on-surface mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-body-lg text-on-surface/80 mb-4">
            {subtitle}
          </p>
        )}
        {children && <div className="flex gap-4">{children}</div>}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 transition-colors duration-300 pointer-events-none" />
      
      {/* Image hover scale effect */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
    </section>
  );
}
