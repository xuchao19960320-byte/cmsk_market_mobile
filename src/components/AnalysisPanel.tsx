import type { ReactNode } from 'react';
interface Props {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}
export function AnalysisPanel({ title, description, actions, children, className = '' }: Props) {
  return (
    <section className={`analysis-panel ${className}`}>
      {title && (
        <div className="panel-heading">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
