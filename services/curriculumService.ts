
import { TAG_MIN_GRADE, KEYWORDS_TO_TAGS } from '../constants';
import type { ComplianceResult, Grade } from '../types';
import { normalizeVN } from './textUtils';

// A curated list of keywords to quickly identify if a text is a math problem.
// This helps pre-filter user input before making an expensive API call.
const MATH_KEYWORDS_NORMALIZED = [
  'phuong trinh', 'he phuong trinh', 'an', 'giai he', 'bien', 'dang thuc', 'bat phuong trinh',
  'uoc chung', 'boi chung', 'bcnn', 'ucln', 'chia het', 'so tu nhien', 'phan so', 'hon so',
  'tam giac', 'duong tron', 'ban kinh', 'duong kinh', 'chu vi', 'dien tich', 'the tich',
  'pytago', 'pythagoras', 'sin', 'cos', 'tan', 'hinh tru', 'hinh non', 'hinh chop', 'lang tru',
  'tinh', 'tim', 'chung minh', 'so sanh', 'rut gon', 'phan tich', 'lap bang', 've do thi', 'giai bai toan',
  'met', 'cm', 'kg', 'lit', 'gio', 'phut', 'giay', 'do c',
];

const CONCEPT_WORDS_NORMALIZED = [
    "cong thuc", "dinh nghia", "cach tinh", "tinh chat", "phat bieu"
];

// Keywords for real-world problems that might not contain numbers initially.
const REALWORLD_HINTS_NORMALIZED = [
    "bao nhieu", "toi da", "it nhat", "nhieu nhat", "chia deu", "phan chia",
    "gia tien", "so tien", "mua", "ban", "kho hang", "thung nuoc", "voi nuoc",
    "quang duong", "toc do", "thoi gian", "xe", "tau", "ben", "lop hoc", "hoc sinh",
    "goi hang", "goi luong", "goi qua", "ba lo", "ao phao", "vo viet", "gia dinh", "ho gia dinh"
];

/**
 * Checks if a given text is likely a math problem or a request for a math concept.
 * It handles un-accented Vietnamese and recognizes real-world problems without numbers.
 *
 * @param text The user's input string.
 * @returns `true` if the text is likely a math problem or concept, otherwise `false`.
 */
export const isMathProblemOrConcept = (text: string): boolean => {
  const t = normalizeVN(text);
  if (!t) return false;

  const hasNumber = /\d/.test(t);
  const hasSymbols = /[=+\-*/^%()]/.test(t);
  
  const hasMathKeyword = MATH_KEYWORDS_NORMALIZED.some(k => t.includes(k));
  const isConceptRequest = CONCEPT_WORDS_NORMALIZED.some(k => t.includes(k));
  const isRealWorldProblem = REALWORLD_HINTS_NORMALIZED.some(k => t.includes(k));

  // 1. Classic problem: has numbers and/or symbols plus a math keyword.
  if (hasMathKeyword && (hasNumber || hasSymbols)) return true;
  
  // 2. Pure math expression: has numbers and symbols (e.g. "1 + 1")
  if (hasNumber && hasSymbols) return true;

  // 3. Concept/Formula request: "công thức" + "hình chữ nhật"
  if (isConceptRequest && hasMathKeyword) return true;

  // 4. Real-world problem: needs at least a number or a math keyword to be considered math
  // "bao nhiêu kẹo" (hasNumber? no) -> "chia đều kẹo" (hasMathKeyword? no)
  // Let's require a math keyword OR a number for real-world hints to avoid false positives like just "gia đình"
  if (isRealWorldProblem && (hasNumber || hasMathKeyword || hasSymbols)) return true;
  
  // 5. Fallback for strong math keywords like "diện tích hình chữ nhật" or "phương trình"
  // But avoid weak ones like "tìm" or "tính" alone
  const strongMathKeywords = MATH_KEYWORDS_NORMALIZED.filter(k => !['tinh', 'tim', 'met', 'cm', 'kg', 'lit', 'gio', 'phut', 'giay', 'do c'].includes(k));
  if (strongMathKeywords.some(k => t.includes(k))) return true;
  
  return false;
};


export const roughDetectTags = (text: string): string[] => {
  const tags = new Set<string>();
  if (!text) return [];
  
  for (const k of KEYWORDS_TO_TAGS) {
    if (k.re.test(text)) {
      tags.add(k.tag);
    }
  }

  if (tags.size === 0) {
    if (/vòi|bể|lưu\s*lượng|thời\s*gian/gi.test(text)) {
      tags.add("bài toán thực tế tỉ lệ");
    }
  }
  return Array.from(tags);
};

export const checkCompliance = (grade: Grade, tags: string[]): ComplianceResult => {
  const currentGradeNum = parseInt(grade);
  
  const hits: string[] = [];
  const potentialGrades = new Set<number>();

  for (const t of tags) {
    const minGrade = TAG_MIN_GRADE[t];
    if (minGrade && currentGradeNum < minGrade) {
      hits.push(t);
      potentialGrades.add(minGrade);
    }
  }

  if (hits.length) {
    const uniqueGrades = [...potentialGrades]
      .sort((a, b) => a - b)
      .map(String)
      .filter(g => ['6', '7', '8', '9'].includes(g)) as Grade[];
    
    return { 
      ok: false, 
      reason: `${hits.join(", ")}`,
      suggestedGrades: uniqueGrades.length > 0 ? uniqueGrades : undefined
    };
  }
  
  return { ok: true, reason: "" };
};
