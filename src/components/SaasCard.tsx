"use client";

import Link from "next/link";
import { SaasProduct } from "@/lib/saas-data";

interface SaasCardProps {
  product: SaasProduct;
}

export default function SaasCard({ product }: SaasCardProps) {
  return (
    <div className="group relative bg-surface-low border border-surface-high rounded-xl p-6 card-hover flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-3xl mb-2 block" role="img" aria-label={product.segment}>
            {product.segmentIcon}
          </span>
          <h3 className="font-sora text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <span className="text-xs text-on-surface-variant bg-surface-highest px-2 py-1 rounded-full mt-1 inline-block">
            {product.segment}
          </span>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
        {product.tagline}
      </p>

      {/* Benefits */}
      <ul className="space-y-2 mb-6 flex-1">
        {product.benefits.slice(0, 3).map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-on-surface-variant">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: product.color }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {benefit}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={`/saas/${product.slug}`}
        className="block text-center py-3 px-4 rounded-lg border font-medium text-sm transition-all"
        style={{
          borderColor: `${product.color}40`,
          color: product.color,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = `${product.color}15`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        }}
      >
        Conhecer solução →
      </Link>
    </div>
  );
}
