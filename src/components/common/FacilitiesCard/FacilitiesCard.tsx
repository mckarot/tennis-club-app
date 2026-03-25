import { Card } from '../../ui/Card/Card';

export interface FacilitiesCardProps {
  title: string;
  description: string;
  icon: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function FacilitiesCard({
  title,
  description,
  icon,
  size = 'small',
  className = '',
}: FacilitiesCardProps) {
  const sizeStyles = {
    small: '',
    medium: 'md:col-span-2 md:row-span-1',
    large: 'md:col-span-2 md:row-span-2',
  };

  return (
    <Card
      variant="default"
      className={`rounded-2xl p-6 ${sizeStyles[size]} ${className}`}
    >
      <div className="flex flex-col h-full">
        <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline text-headline-md font-semibold mb-2">
            {title}
          </h3>
          <p className="font-body text-body text-on-surface/80">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
