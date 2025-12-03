interface ReadingTimeConfig {
  wordsPerMinute?: number;
  mathTimePerExpression?: number;
  imageTimePerImage?: number;
  desmosTimePerGraph?: number;
}
//TODO: use it as payload cms hook on server
/**
 * Calculate reading time for markdown document with LaTeX math and graphs
 *
 * based on research:
 * - average reading (for math): 180 wpm
 * - math: ~8s per expression (half that for inline)
 * - images ~12s per image
 * - graphs ~12s per graph
 *
 *  @returns {string} Estimated reading time as a rounded string, e.g., "3 min read".
 */
export function getReadingTime(
  markdown: string,
  config?: ReadingTimeConfig,
): string {
  const wordsPerMinute = config?.wordsPerMinute ?? 180;
  const mathTimePerExpression = config?.mathTimePerExpression ?? 8;
  const imageTimePerImage = config?.imageTimePerImage ?? 12;
  const desmosTimePerGraph = config?.desmosTimePerGraph ?? 12;

  let content = markdown;
  let totalSeconds = 0;

  const patterns = [
    {
      // Desmos embeds: ::desmos{...}
      regex: /::desmos\{[^}]+\}/g,
      time: desmosTimePerGraph,
    },
    {
      // images: ![alt](url)
      regex: /!\[([^\]]*)\]\(([^)]+)\)/g,
      time: imageTimePerImage,
    },
    // display math: $$...$$
    {
      regex: /\$\$[\s\S]*?\$\$/g,
      time: mathTimePerExpression,
    },
    // inline math: $...$
    {
      regex: /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g,
      time: mathTimePerExpression * 0.5,
    },
  ];

  // process each pattern
  for (const { regex, time } of patterns) {
    const matches = content.match(regex);
    if (matches) {
      totalSeconds += matches.length * time;
      content = content.replace(regex, "");
    }
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
