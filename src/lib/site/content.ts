export interface CoverImageData {
  src: string;
  alt: string;
}

const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

export function formatTaiwanDate(date: Date) {
  return dateFormatter.format(date);
}

export function getCoverImage(
  cover: string | undefined,
  coverAlt: string | undefined,
  fallbackTitle: string,
  fallbackLabel: string
): CoverImageData | undefined {
  if (!cover) {
    return undefined;
  }

  return {
    src: cover,
    alt: coverAlt?.trim() || `${fallbackTitle} ${fallbackLabel}`
  };
}
