/**
 * URL resolution and fallback utility for images in THAI WSK 2026
 * Resolves paths safely for both Vite local dev and GitHub Pages production (/thaiwsk2026/)
 */

// Bundled assets that are guaranteed to exist in the production dist output
import emblemFallback from '../assets/images/school_wsk_emblem_1794141246706.jpg';
import bannerFallback from '../assets/images/hero_thai_wsk_banner_1794141245856.jpg';
import aboutFallback from '../assets/images/about_academic_thai_1794141247386.jpg';
import contestFallback from '../assets/images/thai_literature_contest_1794141246113.jpg';
import teacherFallback from '../assets/images/thai_teacher_team_2026.png';

export type FallbackImageType = 'logo' | 'hero' | 'about' | 'contest' | 'teacher' | 'general';

/**
 * Returns a guaranteed valid bundled fallback image URL for a given context
 */
export function getBundledFallback(type: FallbackImageType = 'general'): string {
  switch (type) {
    case 'logo':
      return emblemFallback;
    case 'hero':
      return bannerFallback;
    case 'about':
      return aboutFallback;
    case 'contest':
      return contestFallback;
    case 'teacher':
      return teacherFallback;
    case 'general':
    default:
      return bannerFallback;
  }
}

/**
 * Normalizes any image URL (handles external URLs, legacy /src/assets paths, and public /images paths)
 * Automatically adapts to GitHub Pages subpath (e.g. /thaiwsk2026/)
 */
export function resolveImageUrl(rawUrl?: string, fallbackType: FallbackImageType = 'general'): string {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return getBundledFallback(fallbackType);
  }

  const clean = rawUrl.trim();

  // 1. External URLs, data URIs, or blob URIs: use directly
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    // If it's a Google Drive link, format it for direct image display
    const driveMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    return clean;
  }

  // Determine base URL (e.g. '/thaiwsk2026/' on GitHub Pages or '/' in local dev)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // 2. Legacy /src/assets/images/... paths stored in database or state
  if (clean.includes('src/assets/images/')) {
    const filename = clean.split('src/assets/images/').pop() || '';
    // Map known bundled images directly to their bundled hash URL
    if (filename.includes('school_wsk_emblem')) return emblemFallback;
    if (filename.includes('hero_thai_wsk_banner')) return bannerFallback;
    if (filename.includes('about_academic_thai')) return aboutFallback;
    if (filename.includes('thai_literature_contest')) return contestFallback;
    if (filename.includes('ครูไทยวิเศษ') || filename.includes('thai_teacher')) return teacherFallback;

    // Otherwise resolve to public/images/
    return `${cleanBase}images/${encodeURIComponent(filename)}`;
  }

  // 3. Paths pointing to images/... or /images/...
  if (clean.startsWith('/images/')) {
    return `${cleanBase}${clean.substring(1)}`;
  }
  if (clean.startsWith('images/')) {
    return `${cleanBase}${clean}`;
  }

  // 4. Absolute path that doesn't yet include the repository base
  if (clean.startsWith('/') && !clean.startsWith(cleanBase)) {
    return `${cleanBase}${clean.substring(1)}`;
  }

  return clean;
}
