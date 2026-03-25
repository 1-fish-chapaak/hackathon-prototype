import { ChevronRight, Home } from 'lucide-react';
import type { View } from '../../hooks/useAppState';

interface BreadcrumbItem {
  label: string;
  view?: View;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (view: View) => void;
}

export default function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] mb-4">
      <button
        onClick={() => onNavigate('home')}
        className="text-text-muted hover:text-primary transition-colors cursor-pointer p-1 rounded hover:bg-primary-xlight"
      >
        <Home size={13} />
      </button>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <ChevronRight size={11} className="text-text-muted/50" />
          {item.view && i < items.length - 1 ? (
            <button
              onClick={() => onNavigate(item.view!)}
              className="text-text-muted hover:text-primary transition-colors cursor-pointer font-medium"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-text font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
