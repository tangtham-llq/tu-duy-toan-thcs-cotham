/**
 * Normalizes a string containing LaTeX by cleaning up common formatting issues from AI responses.
 * @param s The string to normalize.
 * @returns The normalized string.
 */
export const normalizeLatex = (s: string = ""): string => {
  if (!s) return "";
  let result = s;
  // Remove ```...``` code blocks if the AI accidentally uses them for math.
  result = result.replace(/```(?:latex|math)?\s*([\s\S]*?)```/gi, (_, g) => g.trim());
  // Coalesce 3 or more dollar signs into $$, as AI sometimes outputs $$$...$$$
  result = result.replace(/\${3,}/g, "$$");
  // Fix overly escaped delimiters
  result = result.replace(/\\\\\(/g, "\\(").replace(/\\\\\)/g, "\\)")
                 .replace(/\\\\\[/g, "\\[").replace(/\\\\\]/g, "\\]");
  return result;
}

/**
 * Escapes special HTML characters to prevent XSS.
 * @param html The string to escape.
 * @returns The escaped string.
 */
const escapeHTML = (html: string = ""): string => {
  if (!html) return "";
  return html.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[m] as string));
};

declare global {
  interface Window {
    katex?: {
      renderToString(latex: string, options: any): string;
    };
  }
}

/**
 * Renders a string containing LaTeX into a safe HTML string.
 * It manually parses for LaTeX delimiters, renders the math parts using KaTeX,
 * and escapes the non-math parts to prevent XSS.
 * @param text The raw text from the AI, possibly containing LaTeX.
 * @returns An HTML string with rendered mathematics.
 */
export const renderMathHTML = (text: string = ""): string => {
  if (!text) return "";
  if (typeof window.katex === 'undefined') {
    return escapeHTML(text).replace(/\n/g, '<br />');
  }

  const src = normalizeLatex(text);
  let lastIndex = 0;
  let out = "";

  const re = /(\$\$[\s\S]*?\$\$)|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)/g;
  let match;

  while ((match = re.exec(src)) !== null) {
    // Append the plain text part that comes before the math expression
    if (match.index > lastIndex) {
      const plainText = src.slice(lastIndex, match.index);
      out += escapeHTML(plainText).replace(/\n/g, '<br />');
    }

    // Process and render the math part
    const tok = match[0];
    const isBlock = tok.startsWith("$$") || tok.startsWith("\\[");
    const mathBody = tok.slice(2, -2).trim();
    
    try {
      const renderedMath = window.katex.renderToString(mathBody, {
        displayMode: isBlock,
        throwOnError: false,
        strict: "ignore"
      });
      
      out += renderedMath;

    } catch (e) {
      console.error("KaTeX rendering error:", e);
      out += escapeHTML(tok);
    }
    
    lastIndex = re.lastIndex;
  }

  // Append any remaining plain text after the last math expression
  if (lastIndex < src.length) {
    const remainingText = src.slice(lastIndex);
    out += escapeHTML(remainingText).replace(/\n/g, '<br />');
  }

  return out;
};