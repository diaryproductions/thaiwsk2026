import React from 'react';
import { ManagedSiteImage, ImageSectionPlacement } from '../config/defaultContent';
import { SmartImage } from './SmartImage';

interface DynamicSectionImagesProps {
  items?: ManagedSiteImage[];
  section: ImageSectionPlacement;
  excludeIds?: string[];
  className?: string;
}

export const DynamicSectionImages: React.FC<DynamicSectionImagesProps> = ({
  items,
  section,
  excludeIds = [],
  className = '',
}) => {
  const filtered = (items || [])
    .filter(
      (img) =>
        img.section === section &&
        img.isVisible !== false &&
        Boolean(img.url && img.url.trim()) &&
        !excludeIds.includes(img.id)
    )
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (filtered.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {filtered.map((item) => {
        const justifyClass =
          item.alignment === 'left'
            ? 'justify-start'
            : item.alignment === 'right'
            ? 'justify-end'
            : 'justify-center';

        const spacingPx = Number.isFinite(item.spacing) ? Math.max(0, Math.min(item.spacing, 64)) : 12;

        return (
          <div
            key={item.id}
            style={{ marginTop: `${spacingPx}px`, marginBottom: `${spacingPx}px` }}
            className={`w-full flex ${justifyClass}`}
          >
            <figure
              style={{
                width: item.width && item.width.trim() ? item.width : '100%',
                maxWidth: '100%',
              }}
              className="max-w-full rounded-2xl overflow-hidden border border-[#D6AF55]/35 bg-white shadow-sm"
            >
              <div
                style={{
                  height: item.height && item.height.trim() && item.height !== 'auto' ? item.height : undefined,
                  maxWidth: '100%',
                }}
                className="w-full overflow-hidden bg-[#FAF8FD]"
              >
                <SmartImage
                  src={item.url}
                  alt={item.title || 'ภาพประกอบกิจกรรม THAI WSK 2026'}
                  fallbackType="general"
                  className={`w-full h-full max-w-full ${
                    item.objectFit === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                  containerClassName="w-full h-full"
                />
              </div>
              {(item.caption || item.title) && (
                <figcaption className="px-4 py-2.5 text-xs font-['Sarabun'] text-slate-600 bg-[#FAF8FD]/80 border-t border-slate-100 text-center">
                  {item.caption || item.title}
                </figcaption>
              )}
            </figure>
          </div>
        );
      })}
    </div>
  );
};
