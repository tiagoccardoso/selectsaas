"use client";

import Link from "next/link";
import { SaasProduct } from "@/lib/saas-data";

interface SaasCardProps {
  product: SaasProduct;
}

export default function SaasCard({ product }: SaasCardProps) {
  const isAvailable = product.status === "available";

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
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${
            isAvailable
              ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
              : "text-amber-400 border-amber-400/40 bg-amber-400/10"
          }`}
        >
          {isAvailable ? "Disponível" : "Em breve"}
        </span>
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
      {isAvailable && product.externalLink ? (
        <a
          href={product.externalLink}
          target="_blank"
          rel="noopener noreferrer"
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
          Acessar agora →
        </a>
      ) : (
        <div
          className="block text-center py-3 px-4 rounded-lg border font-medium text-sm text-on-surface-variant/50 border-surface-highest cursor-default"
        >
          Em desenvolvimento
        </div>
      )}
    </div>
  );
}
