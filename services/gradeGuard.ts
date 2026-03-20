// Regex to detect inappropriate algebraic language for grades 6 & 7.
// It looks for "gọi ... là [a-z]" (call ... is a), "ẩn [a-z]" (variable a), or the word "phương trình" (equation).
// This is a more robust way to prevent premature introduction of algebraic methods.
const ALGEBRA_REGEX = /gọi\s+[\w\s]+\s+là\s+[a-z]\b|ẩn\s+[a-z]\b|\bphương\s+trình\b/i;
// Regex to detect "implies" (=>) and "equivalent" (<=>) symbols in LaTeX or plain text.
const SYMBOL_REGEX = /\\Rightarrow|\\Leftrightarrow|⇒|⇔|=>|<=>/;


// Regex to detect high school concepts (monotonicity, derivatives) for THCS (grades 6-9).
const HIGH_SCHOOL_REGEX = /tính\s+đơn\s+điệu|đạo\s+hàm|cực\s+trị|tiệm\s+cận/i;


/**
 * A pedagogical guard to ensure AI responses are appropriate for the student's grade level.
 * It prevents the suggestion of algebraic methods (variables, equations) for students in grades 6 and 7,
 * ensures compliance with the new curriculum (GDPT 2018) by avoiding "implies" and "equivalent" symbols for all grades,
 * and blocks high school concepts (monotonicity, derivatives) for THCS.
 *
 * @param text The AI-generated response text.
 * @param grade The student's current grade (as a number, e.g., 6, 7, 8, 9).
 * @returns The original text, or a corrected, pedagogically appropriate message if the original was unsuitable.
 */
export const gradeGuard = (text: string, grade: number): string => {
  if (!text) return ""; // Safety check for undefined/null text

  // New curriculum (GDPT 2018) discourages the use of => and <=> symbols in THCS.
  if (SYMBOL_REGEX.test(text)) {
    return (
      `💡 Cô thấy cách trình bày này có dùng các ký hiệu suy ra (\\(\\Rightarrow\\)) hoặc tương đương (\\(\\Leftrightarrow\\)). 
      
Theo chương trình mới (GDPT 2018), chúng mình nên hạn chế dùng các ký hiệu này và thay bằng các từ nối như "nên", "suy ra", "ta có", "do đó"... để bài làm được mạch lạc và dễ hiểu hơn nhé! Cô sẽ hướng dẫn lại em theo cách trình bày mới này.`
    );
  }

  // Block high school concepts for all THCS grades (6-9)
  if (HIGH_SCHOOL_REGEX.test(text)) {
    return (
      `💡 Cô thấy cách gợi ý này có dùng đến kiến thức "tính đơn điệu" hoặc "đạo hàm" của chương trình THPT (lớp 10-12), điều này chưa phù hợp với chương trình lớp ${grade} của mình.
      
Ở lớp ${grade}, chúng mình hãy tập trung vào các tính chất cơ bản của hàm số như **đồng biến**, **nghịch biến** (đối với hàm số bậc nhất hoặc bậc hai) hoặc các phương pháp giải toán quen thuộc khác nhé. Cô sẽ hướng dẫn lại em theo cách phù hợp hơn!`
    );
  }

  if (grade <= 7) {
    if (ALGEBRA_REGEX.test(text)) {
      return (
        `💡 Cô thấy cách gợi ý này có thể hơi phức tạp so với chương trình lớp ${grade} của mình, vì nó dùng đến cách đặt ẩn số của các lớp trên.
        
Mình thử suy nghĩ theo một hướng khác, đơn giản và quen thuộc hơn nhé! Em hãy thử dùng các phương pháp **số học** như lập bảng thử chọn, hoặc suy luận dựa vào các dữ kiện của bài toán xem sao. Cách này sẽ giúp em rèn luyện tư duy tốt hơn đấy!`
      );
    }
  }

  return text;
};
