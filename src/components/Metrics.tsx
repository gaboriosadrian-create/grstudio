import React from 'react';
import { Metric } from '../types';

interface MetricsProps {
  metrics: Metric[];
}

export default function Metrics({ metrics }: MetricsProps) {
  return (
    <section className="py-8 bg-transparent" aria-label="Indicadores del servicio">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-6 border border-[var(--line)] rounded-3xl bg-[var(--surface)] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <strong className="block text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)] leading-none mb-2">
                {metric.value}
              </strong>
              <span className="block text-[var(--muted)] text-xs sm:text-sm font-bold tracking-wide uppercase">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
