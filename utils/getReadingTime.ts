interface ReadingTimeConfig {
  wordsPerMinute?: number;
  mathTimePerExpression?: number;
  imageTimePerImage?: number;
}

/**
 * Calculate reading time for markdown document with LaTeX math
 *
 * based on research:
 * - average reading (for math): 180 wpm
 * - math: ~8s per expression (half that for inline)
 * - imgs ~12s per image
 */
export function getReadingTime(
  markdown: string,
  config?: ReadingTimeConfig,
): string {
  const wordsPerMinute = config?.wordsPerMinute ?? 180;
  const mathTimePerExpression = config?.mathTimePerExpression ?? 8;
  const imageTimePerImage = config?.imageTimePerImage ?? 12;

  let content = markdown;
  let totalSeconds = 0;

  // images: ![alt](url)
  const images = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
  if (images) {
    totalSeconds += images.length * imageTimePerImage;
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
  }

  // display math: $...$
  const displayMath = content.match(/\$\$[\s\S]*?\$\$/g);
  if (displayMath) {
    totalSeconds += displayMath.length * mathTimePerExpression;
    content = content.replace(/\$\$[\s\S]*?\$\$/g, "");
  }

  // inline math: $...$
  const inlineMath = content.match(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g);
  if (inlineMath) {
    totalSeconds += inlineMath.length * (mathTimePerExpression * 0.5);
    content = content.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, "");
  }

  // clean up markdown
  content = content.replace(/<!--[\s\S]*?-->/g, "");
  content = content.replace(/<[^>]+>/g, " ");
  content = content.replace(/[#*_~[\]()]/g, " ");

  // count words
  const words = content
    .split(/\s+/)
    .filter((w) => w.length > 0 && /[a-zA-Z0-9]/.test(w));
  totalSeconds += (words.length / wordsPerMinute) * 60;

  // round up to nearest minute
  const minutes = Math.ceil(totalSeconds / 60);

  return `${minutes} min read`;
}
