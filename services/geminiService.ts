
// Fix: Replaced invalid file content with a proper implementation of the Gemini service, resolving module errors.
import { GoogleGenAI } from "@google/genai";
import type { GuidanceParams, HintLevel, Grade } from '../types';
import { gradeGuard } from './gradeGuard';
import { TAG_MIN_GRADE } from '../constants';
import { errorLoggingService } from './errorLoggingService';

// Initializes the Google AI client.
// We check for both GEMINI_API_KEY and API_KEY to ensure compatibility across environments.
const getApiKey = () => process.env.GEMINI_API_KEY || process.env.API_KEY || "";

const getAiClient = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Critical: Gemini API Key is missing from environment variables.");
    } else {
        console.log("Gemini API Key found (starts with):", apiKey.substring(0, 4) + "...");
    }
    return new GoogleGenAI({ apiKey });
};

const getFallbackSimilarProblem = (grade: Grade): string => {
    switch (grade) {
        case '6':
            return "Một đội văn nghệ của trường có 60 bạn nam và 72 bạn nữ. Cô phụ trách muốn chia đội thành các nhóm nhỏ sao cho số bạn nam và số bạn nữ ở mỗi nhóm đều bằng nhau. Hỏi có thể chia được nhiều nhất thành bao nhiêu nhóm? Khi đó, mỗi nhóm có bao nhiêu bạn nam và bao nhiêu bạn nữ?";
        case '7':
            return "Một tam giác ABC có số đo ba góc lần lượt tỉ lệ với 3, 5, 7. Tính số đo mỗi góc của tam giác đó.";
        case '8':
            return "Giải phương trình sau: \\(3x(x - 2) - x^2 + 4 = 0\\)";
        case '9':
        default:
            return "Giải hệ phương trình: \\[\\begin{cases} 5x + 2y = 1 \\\\ 3x - 4y = -15 \\end{cases}\\]";
    }
};

/**
 * Classifies a math problem into relevant topics using the Gemini API.
 * This function takes the problem as text and optional images, sends them to the model,
 * and parses the comma-separated tags from the response. It includes a strong prompt
 * and a programmatic safety net to prevent misclassification.
 *
 * @param problem The text of the math problem.
 * @param images An array of base64 encoded image strings.
 * @param imageMimeTypes An array of MIME types corresponding to the images.
 * @returns A promise that resolves to an array of topic tags as strings.
 */
export const classifyProblem = async (problem: string, images: string[], imageMimeTypes: string[]): Promise<string[]> => {
    try {
        const model = 'gemini-3-flash-preview';
        
        const validTopics = Object.keys(TAG_MIN_GRADE).join(', ');

        console.log("Classifying problem with model:", model);

        const prompt = `Bạn là một chuyên gia phân loại bài toán cho học sinh THCS Việt Nam (lớp 6–9).
Nhiệm vụ của bạn là phân tích đề bài (văn bản và hình ảnh) và chọn ra các chủ đề toán học phù hợp nhất từ danh sách cho trước.

DANH SÁCH CHỦ ĐỀ HỢP LỆ:
${validTopics}

QUY TẮC PHÂN LOẠI:
1.  **Kiểm tra tính hợp lệ:** Nếu nội dung (văn bản hoặc hình ảnh) KHÔNG PHẢI là một bài toán, KHÔNG PHẢI là một câu hỏi về kiến thức toán học, hoặc là một hình ảnh phong cảnh/đời thường không liên quan đến toán, hãy trả về DUY NHẤT từ: "non_math".
2.  **Chọn từ danh sách:** Nếu là toán, chỉ được sử dụng các chủ đề có trong danh sách trên.
3.  **Ràng buộc Chủ đề Cốt lõi:**
    - Nếu đề bài chứa "hệ phương trình", "giải hệ", hoặc yêu cầu tìm hai số từ hai mối quan hệ, BẮT BUỘC phải có chủ đề "hệ phương trình".
    - Nếu đề bài chứa "phương trình bậc hai" hoặc "x^2", BẮT BUỘC phải có chủ đề "phương trình bậc hai & Vi-ét".
    - Nếu đề bài chứa "sin", "cos", "tan", "tỉ số lượng giác", BẮT BUỘC phải có chủ đề "tỉ số lượng giác & hệ thức lượng".
4.  **Ngữ cảnh chương trình:** Luôn phân loại dựa trên chương trình Toán THCS Việt Nam.
5.  **Định dạng đầu ra:** Trả về một danh sách các chủ đề, cách nhau bởi dấu phẩy. Nếu không phải toán, trả về "non_math". Không thêm giải thích.

ĐỀ BÀI:
"${problem || '(Không có văn bản, chỉ có hình ảnh)'}"

CHỦ ĐỀ:`;

        const textPart = { text: prompt };

        const imageParts = images.map((img, index) => ({
            inlineData: {
                mimeType: imageMimeTypes[index],
                data: img,
            },
        }));
        
        const contents = { parts: [textPart, ...imageParts] };

        const ai = getAiClient();
        const response = await ai.models.generateContent({ model, contents });
        
        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error("AI returned no candidates. The content might have been blocked by safety filters.");
        }

        const rawText = response.text;
        console.log("Gemini classification raw response:", rawText);
        let resultText = rawText ? rawText.trim() : "";

        // Programmatic Safety Net: Corrects misclassifications even if the model fails to follow instructions.
        const hasGeometricKeywords = /góc|tam giác|vuông|cạnh huyền|sin|cos|tan|đường tròn|hình học/i.test(problem);
        if ( (resultText.includes("tỉ số lượng giác") || resultText.includes("hệ thức lượng")) && !hasGeometricKeywords) {
            console.warn("Safety Net Triggered: Replacing incorrect trigonometry tags.");
            resultText = resultText.replace(/tỉ số lượng giác|hệ thức lượng/gi, "tỉ lệ và bài toán có lời văn");
        }

        if (!resultText) {
            console.warn("Gemini classification returned empty result.");
            return ["bài toán có lời văn"]; // Default tag if classification fails
        }

        const tags = resultText.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
        // Ensure there's always at least one tag for word problems.
        if (tags.length === 0) {
           return ["bài toán có lời văn"];
        }
        return tags;

    } catch (error) {
        console.error("Error in classifyProblem:", error);
        errorLoggingService.logError(error, 'api', {}, { 
            function: 'classifyProblem',
            problem: problem.substring(0, 500) // Truncate for log
        });
        // Return a default safe tag on error to prevent the application flow from breaking.
        return ["bài toán có lời văn"];
    }
};


/**
 * Constructs a detailed, structured prompt for generating pedagogical guidance.
 * It tailors the AI's persona and instructions based on the selected hint level,
 * ensuring the response is pedagogically appropriate.
 *
 * @param grade The student's current grade.
 * @param style The hint level ('light', 'step', 'outline').
 * @param problemText The text of the math problem.
 * @param studentResponse The student's answer or work.
 * @param isStuck A flag indicating if the student needs more help.
 * @returns A comprehensive prompt string for the Gemini API.
 */
const buildGuidancePrompt = (grade: Grade, style: HintLevel, problemText: string, studentResponse: string, isStuck: boolean): string => {
    let commonRules = `
- Luôn trả lời bằng tiếng Việt, với giọng văn thân thiện, động viên của một giáo viên tên là Cô Thắm (xưng hô "cô - em").
- Câu trả lời phải ngắn gọn, tập trung vào trọng tâm, định dạng bằng Markdown.
- **BẮT BUỘC** dùng LaTeX cho công thức toán: \\(công thức inline\\) và \\[công thức block\\].
- **KHÔNG BAO GIỜ** dùng các ký hiệu suy ra \\(\\Rightarrow\\) hoặc tương đương \\(\\Leftrightarrow\\) (theo chuẩn chương trình mới GDPT 2018). Hãy dùng các từ nối như "nên", "ta có", "suy ra", "do đó", "khi đó", "tương đương với" để trình bày lời giải.
- **KHÔNG BAO GIỜ** đưa ra đáp án cuối cùng hoặc giải hết bài toán. Mục tiêu là dẫn dắt để học sinh tự làm.
- **QUY ĐỊNH KIẾN THỨC (GDPT 2018):**
  - **THCS (Lớp 6-9):** **TUYỆT ĐỐI KHÔNG** dùng các khái niệm của THPT như "tính đơn điệu", "đạo hàm", "cực trị", "tiệm cận".
  - Thay vào đó, hãy dùng các thuật ngữ: "đồng biến" (hàm số tăng), "nghịch biến" (hàm số giảm) khi xét tính chất của hàm số bậc nhất \\(y = ax + b\\) hoặc hàm số bậc hai \\(y = ax^2\\).
- **QUY CHUẨN TRÌNH BÀY (Vietnamese Math Style):**
  1. **Chứng minh hình học:** Luôn dùng cấu trúc "Xét \\(\\Delta...\\) và \\(\\Delta...\\) có:", liệt kê các yếu tố, sau đó kết luận "Vậy \\(\\Delta... \\sim \\Delta...\\) (g-g/c-g-c/c-c-c)". Nếu có tỉ số, ghi rõ "Dãy tỉ số đồng dạng:".
  2. **Giải bài toán bằng cách lập phương trình:** Phải có đủ các bước: "Gọi ẩn (kèm đơn vị và điều kiện)", "Biểu diễn các đại lượng chưa biết theo ẩn", "Lập phương trình", "Giải phương trình", "Đối chiếu điều kiện và Kết luận".
  3. **Hàm số:** Khi tìm giao điểm, dùng câu dẫn "Phương trình hoành độ giao điểm của (d) và (d') là:".
- **QUAN TRỌNG (Intent Detection):** Nếu câu hỏi của học sinh là một yêu cầu định nghĩa hoặc công thức (ví dụ: "công thức tính diện tích hình chữ nhật là gì?"), HÃY CUNG CẤP TRỰC TIẾP câu trả lời/công thức đó. Sau khi trả lời, hãy hỏi xem em có muốn xem một ví dụ áp dụng không. ĐỪNG bắt đầu một cuộc hội thoại Socratic cho những câu hỏi kiến thức trực tiếp.
- Ưu tiên dùng các thuật ngữ đơn giản, dễ hiểu ("số bút", "số vở" thay cho "x", "y" ở lớp 6-7).`;

    const gradeNum = parseInt(grade, 10);
    if (gradeNum <= 7) {
        commonRules += `
- **QUAN TRỌNG (LỚP 6-7):** Với dạng toán "tìm hai số" (như tìm số bút, số vở từ một tổng tiền), **TUYỆT ĐỐI KHÔNG** dùng phương pháp đại số (đặt ẩn a, b, x, y và lập phương trình). Thay vào đó, hãy hướng dẫn học sinh dùng các phương pháp số học như:
  1.  **Lập bảng thử chọn (Trial and Error):** Hướng dẫn thử một giá trị và kiểm tra xem có thỏa mãn điều kiện còn lại không.
  2.  **Dựa vào tính chất chia hết / bội số:** Ví dụ: "Tổng tiền bút phải là một số chia hết cho 15, vậy số bút có thể là bao nhiêu?".
  3.  **Suy luận logic đơn giản.**`;
    }

    const promptsByStyle: Record<HintLevel, string> = {
        light: `
Bạn là một trợ lý Socratic. Chỉ khơi gợi để học sinh tự nghĩ.
- **Cấu trúc:** Đặt 2-3 câu hỏi gợi mở ngắn gọn (dưới 18 từ/câu), đi từ "Đề cho gì?" -> "Hỏi gì?" -> "Mối liên hệ là gì?".
- **Kết thúc** bằng MỘT câu hỏi duy nhất để học sinh trả lời.
- **Cấm:** Không nêu công thức, không gợi ý phép tính cụ thể.`,
        step: `
Bạn là một trợ lý dạy kèm. Hãy hướng dẫn theo từng bước RÕ RÀNG.
- **Cấu trúc:** Luôn bắt đầu bằng "Bước 1...", "Bước 2...". Mỗi bước gồm: [Tên bước]: [Việc học sinh cần làm].
- **Yêu cầu:** Mỗi bước chỉ yêu cầu MỘT hành động cụ thể.
- **Kiểm tra:** Sau mỗi bước, thêm một dòng "✓ Em kiểm tra lại xem..." để học sinh tự soát lỗi.`,
        outline: `
Bạn là một giáo viên chấm bài. Hãy cung cấp DÀN Ý trình bày bài giải.
- **Cấu trúc:** Trình bày rõ 4 mục: 1) Tóm tắt; 2) Lập luận/Đặt lời giải; 3) Các bước tính toán (có thể là bảng); 4) Kết luận.
- **Yêu cầu:** Bỏ trống phần đáp số bằng dấu "..." để học sinh tự điền vào.`
    };
    
    let studentContext = "";
    if (studentResponse) {
        studentContext = `PHẢN HỒI CỦA HỌC SINH:\n${studentResponse}`;
    } else if (isStuck) {
        studentContext = `PHẢN HỒI CỦA HỌC SINH:\n(Học sinh đang gặp khó khăn và cần gợi ý thêm)`;
    }

    return `BÀI TOÁN:\n${problemText}

${studentContext}

CHẾ ĐỘ GỢI Ý: ${style.toUpperCase()}

QUY TẮC CHUNG:
${commonRules}

YÊU CẦU THEO CHẾ ĐỘ:
${promptsByStyle[style]}

Bây giờ, hãy trả lời đúng theo vai trò và chế độ đã chọn.`;
};


/**
 * Generates pedagogical guidance for a math problem using the Gemini API.
 * This function constructs a detailed prompt based on the student's grade, the problem,
 * their current work, the desired mode of interaction, and feedback.
 *
 * @param params An object containing all necessary context for generating guidance.
 * @returns A promise that resolves to a string with the AI-generated guidance.
 */
export const getGuidance = async (params: GuidanceParams): Promise<string> => {
    let userPrompt: string;
    
    if (params.mode === 'check') {
        userPrompt = `Chào cô, em đang học lớp ${params.grade}.
**Đề bài:**
${params.problem}

**Bài làm của em:**
${params.studentStep}

**Yêu cầu:**
Cô hãy kiểm tra xem lời giải của em đã đúng chưa.
- Nếu đúng, cô hãy khen ngợi và xác nhận kết quả.
- Nếu sai, cô đừng chỉ ra lỗi sai trực tiếp, mà hãy đặt một câu hỏi gợi mở để em tự nhận ra lỗi sai của mình.`;
    } else if (params.mode === 'similar') {
         userPrompt = `Chào cô, em đang học lớp ${params.grade}.
**Đề bài gốc:**
${params.problem}

**Chủ đề:** ${params.tags.join(', ')}

**Yêu cầu:**
Em đã hiểu cách làm bài này rồi. Cô hãy cho em một bài toán tương tự (không cần quá khó) để em luyện tập thêm nhé.

**QUY TẮC TRẢ VỀ:**
1.  Chỉ trả về DUY NHẤT nội dung đề bài toán, không thêm lời chào, giải thích, hay định dạng Markdown.
2.  **BẮT BUỘC** dùng LaTeX cho mọi công thức toán. Dùng \\( ... \\) cho công thức inline và \\[ ... \\] cho công thức block.`;
    } else { // mode === 'guide'
        const isStuck = params.feedback === 'needs_more' || params.feedback === 'too_hard';
        userPrompt = buildGuidancePrompt(params.grade, params.level, params.problem, params.studentStep, isStuck);
    }
    
    const ai = getAiClient();
    const systemInstruction = `Bạn là một giáo viên dạy toán THCS Việt Nam giàu kinh nghiệm, thân thiện và giỏi chuyên môn tên là Cô Thắm.
    Mục tiêu của bạn là giúp học sinh tự suy nghĩ, hiểu sâu bản chất vấn đề và xây dựng sự tự tin.
    Bạn luôn tuân thủ phong cách trình bày chuẩn mực của giáo khoa Việt Nam (ví dụ: các bước giải bài toán bằng cách lập phương trình, cách trình bày chứng minh hình học).
    Luôn tuân thủ nghiêm ngặt các quy tắc và vai trò được giao trong prompt của người dùng.`;

    const model = 'gemini-3-flash-preview';

    const textPart = { text: userPrompt };

    console.log("Generating guidance with model:", model, "Mode:", params.mode);

    const problemImageParts = params.image.map((img, index) => ({
        inlineData: {
            mimeType: params.imageMimeType[index],
            data: img,
        },
    }));
    
    const studentImageParts = [];
    if (params.studentImages && params.studentImages.length > 0) {
      studentImageParts.push({ text: "\n\n(Ảnh bài làm/phản hồi của học sinh)" });
      studentImageParts.push(...params.studentImages.map((img, index) => ({
        inlineData: {
          mimeType: params.studentImageMimeTypes[index],
          data: img,
        },
      })));
    }

    const allParts = [textPart, ...problemImageParts, ...studentImageParts];

    try {
        const ai = getAiClient();
        
        // Convert history to Gemini format, excluding images to keep payload small
        const history = (params.history || [])
            .filter(msg => msg.content && !msg.content.includes("Cô thấy đây không phải là một bài toán")) // Filter out rejection messages
            .slice(-10) // Only last 10 messages for performance
            .map(msg => ({
                role: msg.role === 'user' ? 'user' as const : 'model' as const,
                parts: [{ text: msg.content }]
            }));

        const chat = ai.chats.create({
            model,
            config: { systemInstruction },
            history: history.length > 0 ? history : undefined
        });

        const response = await chat.sendMessage({ message: allParts });

        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error("AI returned no candidates for guidance. The content might have been blocked by safety filters.");
        }

        const resultText = response.text;
        console.log("Gemini guidance raw response length:", resultText?.length || 0);
        
        if (params.mode === 'similar') {
            const trimmedResult = resultText ? resultText.trim() : '';
            if (trimmedResult.length > 10) { // Simple validation
                return trimmedResult;
            }
            console.warn("getGuidance (similar) returned empty/short response. Using fallback.");
            return getFallbackSimilarProblem(params.grade);
        }

        const grade = parseInt(params.grade, 10);
        return gradeGuard(resultText, grade);
    } catch (error) {
        console.error("Error in getGuidance from Gemini API:", error);
        errorLoggingService.logError(error, 'api', {}, { 
            function: 'getGuidance',
            params: {
                grade: params.grade,
                mode: params.mode,
                level: params.level,
                problem: params.problem.substring(0, 500),
                studentStep: params.studentStep?.substring(0, 500)
            }
        });
        if (params.mode === 'similar') {
            console.warn("Using fallback similar problem due to API error.");
            return getFallbackSimilarProblem(params.grade);
        }
        throw error;
    }
};
