import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function optimizeImageUrl(src, width = 900, quality = 72) {
  if (!src || typeof src !== 'string' || !src.startsWith('http')) {
    return src;
  }

  try {
    const url = new URL(src);
    if (!url.hostname.includes('images.unsplash.com')) {
      return src;
    }

    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality));
    return url.toString();
  } catch {
    return src;
  }
}
