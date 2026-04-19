const CHINESE_WORDS_PER_MINUTE = 250;

function stripReadableText(source: string) {
  return source
    .replace(/^---[\s\S]*?---/, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getReadingMinutes(source: string) {
  const readableText = stripReadableText(source);
  const readableLength = readableText.replace(/\s/g, '').length;

  return Math.max(1, Math.ceil(readableLength / CHINESE_WORDS_PER_MINUTE));
}

export function formatReadingTime(source: string) {
  return `約 ${getReadingMinutes(source)} 分鐘`;
}
