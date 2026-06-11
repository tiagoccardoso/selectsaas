"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { SaasProduct } from "@/lib/saas-data";

interface SaasCardProps {
  product: SaasProduct;
}

export default function SaasCard({ product }: SaasCardProps) {
  const isComingSoon = product.status === "coming_soon";
  const ctaClassName = "block text-center py-3 px-4 rounded-lg border font-medium text-sm transition-all";
  const ctaStyle = {
    borderColor: `${product.color}40`,
    color: product.color,
  };

  function handleMouseEnter(e: MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.style.backgroundColor = `${product.color}15`;
  }

  function handleMouseLeave(e: MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.style.backgroundColor = "transparent";
  }

  return (
    <div className="group relative bg-surface-low border border-surface-high rounded-xl p-6 card-hover flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
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

        {isComingSoon && (
          <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Em breve
          </span>
        )}
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
      {isComingSoon ? (
        <span
          className="block cursor-not-allowed rounded-lg border border-surface-highest px-4 py-3 text-center text-sm font-medium text-on-surface-variant opacity-70"
          aria-disabled="true"
        >
          Em breve
        </span>
      ) : product.externalUrl ? (
        <a
          href={product.externalUrl}
          className={ctaClassName}
          style={ctaStyle}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Acessar solução
        </a>
      ) : (
        <Link
          href={`/saas/${product.slug}`}
          className={ctaClassName}
          style={ctaStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Conhecer solução
        </Link>
      )}
    </div>
  );
}
