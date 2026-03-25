import { Card } from '../../ui/Card/Card';
import { Button } from '../../ui/Button/Button';

export interface PricingCardProps {
  title: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  isFeatured?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function PricingCard({
  title,
  price,
  currency,
  period,
  features,
  isFeatured = false,
  onSelect,
  className = '',
}: PricingCardProps) {
  return (
    <Card
      variant={isFeatured ? 'elevated' : 'default'}
      className={`rounded-3xl p-8 ${isFeatured ? 'shadow-xl border-2 border-primary' : ''} ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="font-headline text-headline-lg font-semibold mb-2">
          {title}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-body text-body-lg text-on-surface/60">
            {currency}
          </span>
          <span className="font-headline text-display-lg font-bold">
            {price}
          </span>
          <span className="font-body text-body text-on-surface/60">
            /{period}
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-sm">
              check_circle
            </span>
            <span className="font-body text-body">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={isFeatured ? 'primary' : 'secondary'}
        size="large"
        onClick={onSelect}
        className="w-full"
      >
        Choisir {title}
      </Button>
    </Card>
  );
}
