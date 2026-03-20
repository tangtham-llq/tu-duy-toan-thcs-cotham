/**
 * Normalizes a Vietnamese string by converting to lowercase, removing diacritics,
 * and cleaning up whitespace. This is crucial for keyword matching when
 * users might omit accents.
 *
 * @param input The raw string, potentially with diacritics. Defaults to an empty string.
 * @returns A clean, normalized string suitable for keyword searching.
 */
export function normalizeVN(input = ""): string {
  if (!input) return "";
  
  // Convert to lowercase, then decompose combined characters (e.g., 'ă' -> 'a' + accent)
  const s = input
    .toLowerCase()
    .normalize("NFD")
    // Remove diacritics (accent marks) using a Unicode range
    .replace(/[\u0300-\u036f]/g, "");
    
  // Replace multiple whitespace characters with a single space and trim
  return s.replace(/\s+/g, " ").trim();
}
