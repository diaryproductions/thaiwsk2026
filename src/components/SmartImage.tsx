import React, { useState, useEffect } from 'react';
import { resolveImageUrl, getBundledFallback, FallbackImageType } from '../utils/imageUrl';
import { ImageOff, Sparkles } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackType?: FallbackImageType;
  aspectRatioClass?: string;
  containerClassName?: string;
  showCaption?: boolean;
  captionText?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt = 'รูปภาพกิจกรรม สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
  className = '',
  containerClassName = '',
  fallbackType = 'general',
  showCaption = false,
  captionText,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(() => resolveImageUrl(src, fallbackType));

  // Reset when source prop changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setCurrentSrc(resolveImageUrl(src, fallbackType));
  }, [src, fallbackType]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Try switching to guaranteed bundled fallback
      const bundled = getBundledFallback(fallbackType);
      if (currentSrc !== bundled) {
        setCurrentSrc(bundled);
      }
    }
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton / Shimmer background while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/60 via-amber-50/40 to-purple-100/60 animate-pulse flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#D6AF55] animate-spin" />
        </div>
      )}

      {/* Actual Image */}
      <img
        referrerPolicy="no-referrer"
        {...props}
        src={currentSrc}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Graceful Fallback Overlay if both source and fallback failed */}
      {hasError && currentSrc === getBundledFallback(fallbackType) && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#4B267D] to-[#7043A6] flex flex-col items-center justify-center text-white p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-[#D6AF55]/40 flex items-center justify-center mb-2">
            <ImageOff className="w-6 h-6 text-[#D6AF55]" />
          </div>
          <p className="text-xs font-['Prompt'] font-semibold text-white/90">{alt}</p>
          <span className="text-[10px] font-['Sarabun'] text-[#D6AF55] mt-1">
            โรงเรียนกระทุ่มแบน &quot;วิเศษสมุทคุณ&quot;
          </span>
        </div>
      )}

      {/* Optional Caption */}
      {showCaption && captionText && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs font-['Sarabun']">
          {captionText}
        </div>
      )}
    </div>
  );
};
