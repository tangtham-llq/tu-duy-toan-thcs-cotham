// A dictionary of real-world math terms and their simple explanations.
const MATH_TERMS_DICTIONARY: { keywords: string[]; explanation: string }[] = [
  // Finance & Commerce
  { keywords: ["giảm giá"], explanation: "💬 “Giảm giá” nghĩa là người mua chỉ phải trả ít hơn so với giá gốc một tỉ lệ phần trăm." },
  { keywords: ["khuyến mãi"], explanation: "💬 “Khuyến mãi” nghĩa là người mua trả giá như cũ nhưng nhận được nhiều hàng hơn hoặc có ưu đãi khác đi kèm." },
  { keywords: ["chiết khấu"], explanation: "💬 “Chiết khấu” là mức giảm phần trăm dành cho người mua số lượng lớn hoặc thanh toán sớm." },
  { keywords: ["thuế vat", "thuế giá trị gia tăng", "thuế"], explanation: "💬 “Thuế” là khoản tiền được cộng thêm vào giá bán của sản phẩm, dịch vụ để nộp cho nhà nước, ví dụ như thuế VAT." },
  { keywords: ["phí dịch vụ", "phụ thu"], explanation: "💬 “Phí dịch vụ” hoặc “phụ thu” là khoản tiền phải trả thêm ngoài giá gốc (ví dụ: phí phục vụ, vận chuyển...)." },
  { keywords: ["lãi suất"], explanation: "💬 “Lãi suất” là tỉ lệ phần trăm tiền lãi so với tiền gốc trong một khoảng thời gian nhất định (ví dụ: một tháng, một năm)." },
  { keywords: ["lãi kép"], explanation: "💬 “Lãi kép” là khi tiền lãi của kỳ trước được cộng dồn vào vốn để tính lãi cho kỳ tiếp theo." },
  { keywords: ["lợi nhuận"], explanation: "💬 “Lợi nhuận” là phần tiền thu được sau khi đã trừ đi tất cả chi phí bỏ ra." },
  { keywords: ["tổn thất", "hao hụt"], explanation: "💬 “Tổn thất” hay “hao hụt” là mức giảm về số lượng hoặc giá trị so với ban đầu do hư hỏng, mất mát." },
  { keywords: ["doanh thu"], explanation: "💬 “Doanh thu” là tổng số tiền thu được từ việc bán hàng hoặc cung cấp dịch vụ, chưa trừ chi phí." },
  { keywords: ["chi phí"], explanation: "💬 “Chi phí” là tổng số tiền bỏ ra để thực hiện một việc gì đó, ví dụ như sản xuất hoặc kinh doanh." },
  { keywords: ["tiết kiệm"], explanation: "💬 “Tiết kiệm” là phần tiền còn lại sau khi chi tiêu, hoặc là khoản tiền giảm được khi mua hàng có ưu đãi." },
  
  // Statistics & Measurement
  { keywords: ["trung bình cộng"], explanation: "💬 “Trung bình cộng” của nhiều số là tổng các số đó chia cho số các số hạng." },
  { keywords: ["tỉ lệ"], explanation: "💬 “Tỉ lệ” là sự so sánh về mặt số lượng giữa hai đại lượng cùng loại." },
  { keywords: ["tốc độ trung bình"], explanation: "💬 “Tốc độ trung bình” được tính bằng tổng quãng đường đi được chia cho tổng thời gian để đi hết quãng đường đó." },
  { keywords: ["tần số", "tần suất"], explanation: "💬 “Tần số” hay “tần suất” là số lần một giá trị hoặc sự kiện nào đó xuất hiện trong một cuộc khảo sát." },

  // Geometry & Technical
  { keywords: ["diện tích"], explanation: "💬 “Diện tích” là độ lớn của phần mặt phẳng mà một hình chiếm chỗ." },
  { keywords: ["chu vi"], explanation: "💬 “Chu vi” là tổng độ dài của các đường bao quanh một hình khép kín." },
  { keywords: ["thể tích"], explanation: "💬 “Thể tích” là lượng không gian mà một vật thể chiếm giữ." },
  { keywords: ["pythagoras", "pytago", "pi-ta-go"], explanation: "💬 “Định lý Pythagoras” phát biểu rằng trong một tam giác vuông, bình phương cạnh huyền bằng tổng bình phương của hai cạnh góc vuông (\\(a^2 + b^2 = c^2\\))." },
  { keywords: ["tỉ lệ bản đồ", "tỉ lệ bản vẽ"], explanation: "💬 “Tỉ lệ bản đồ/bản vẽ” cho biết mối quan hệ giữa một độ dài đo trên bản đồ/bản vẽ và độ dài tương ứng trên thực tế." },
  { keywords: ["bán kính"], explanation: "💬 “Bán kính” của đường tròn là khoảng cách từ tâm đến một điểm bất kỳ trên đường tròn đó." },
  { keywords: ["đường kính"], explanation: "💬 “Đường kính” của đường tròn là một đoạn thẳng đi qua tâm và nối hai điểm trên đường tròn, dài gấp đôi bán kính." },
  { keywords: ["tiếp tuyến"], explanation: "💬 “Tiếp tuyến” là một đường thẳng chỉ chạm vào đường tròn tại một điểm duy nhất." },
];

/**
 * Removes diacritics (accents) from a string.
 * @param str The string to process.
 * @returns The string without diacritics.
 */
const removeDiacritics = (str: string): string => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Checks the input text for known real-world math terms and returns a simple explanation if a term is found.
 * This check is case-insensitive and diacritic-insensitive.
 * Only returns the first explanation found.
 * @param text The text to check (e.g., the problem statement).
 * @returns An explanation string or an empty string if no term is found.
 */
export const getTermExplanation = (text: string): string => {
  if (!text) return "";
  const lowerCaseText = text.toLowerCase();
  const normalizedText = removeDiacritics(lowerCaseText);

  for (const term of MATH_TERMS_DICTIONARY) {
    for (const keyword of term.keywords) {
      const normalizedKeyword = removeDiacritics(keyword.toLowerCase());
      if (normalizedText.includes(normalizedKeyword)) {
        return term.explanation;
      }
    }
  }

  // Handle general percentage cases if no specific term was found
  if (normalizedText.includes('%') || normalizedText.includes('phan tram')) {
     if (normalizedText.includes('tang')) {
        return "💬 “Tăng X%” nghĩa là giá trị mới bằng (100 + X)% so với giá trị ban đầu.";
     }
     if (normalizedText.includes('giam') && !normalizedText.includes('giam gia')) { // Avoid duplicating "giảm giá"
        return "💬 “Giảm X%” nghĩa là giá trị mới chỉ còn lại (100 - X)% so với giá trị ban đầu.";
     }
  }

  return "";
};