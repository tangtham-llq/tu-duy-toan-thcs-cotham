
import React, { useState, useEffect } from 'react';
import type { Grade, HintLevel, Mode } from '../types';
import { Upload, CheckCircle, Lightbulb, XCircle, Mail, Zalo, RefreshCw, Users } from './icons';

interface InputPanelProps {
  grade: Grade;
  setGrade: React.Dispatch<React.SetStateAction<Grade>>;
  level: HintLevel;
  setLevel: React.Dispatch<React.SetStateAction<HintLevel>>;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  problem: string;
  setProblem: React.Dispatch<React.SetStateAction<string>>;
  studentStep: string;
  setStudentStep: React.Dispatch<React.SetStateAction<string>>;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  setImageMimeTypes: React.Dispatch<React.SetStateAction<string[]>>;
  imageMimeTypes: string[];
  studentImages: string[];
  setStudentImages: React.Dispatch<React.SetStateAction<string[]>>;
  studentImageMimeTypes: string[];
  setStudentImageMimeTypes: React.Dispatch<React.SetStateAction<string[]>>;
  onAsk: () => void;
  onClear: () => void;
  isLoading: boolean;
  isProblemActive: boolean;
  hasConversation: boolean;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const compressAndEncodeImage = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64Data = dataUrl.split(',')[1];
        resolve({ base64Data, mimeType: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export const InputPanel: React.FC<InputPanelProps> = ({
  grade, setGrade, level, setLevel, mode, setMode,
  problem, setProblem, studentStep, setStudentStep,
  images, setImages, setImageMimeTypes, imageMimeTypes,
  studentImages, setStudentImages, studentImageMimeTypes, setStudentImageMimeTypes,
  onAsk, onClear, isLoading, isProblemActive, hasConversation
}) => {
  const MAX_IMAGES = 3;
  const MAX_STUDENT_IMAGES = 2;
  const PROBLEM_MAX_LENGTH = 5000;
  const STUDENT_STEP_MAX_LENGTH = 2000;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Fix: Explicitly type `file` as `File` to resolve "property 'size' does not exist on type 'unknown'" error.
    const validFiles = Array.from(files).filter((file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            alert(`Ảnh "${file.name}" quá lớn (tối đa 4MB).`);
            return false;
        }
        return true;
    });

    if (images.length + validFiles.length > MAX_IMAGES) {
      alert(`Chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh cho một đề bài.`);
      e.target.value = '';
      return;
    }

    const filePromises = validFiles.map(compressAndEncodeImage);

    Promise.all(filePromises).then(results => {
      setImages(prev => [...prev, ...results.map(r => r.base64Data)]);
      setImageMimeTypes(prev => [...prev, ...results.map(r => r.mimeType)]);
    }).catch(error => console.error("Error processing files:", error));
    
    e.target.value = '';
  };
  
  const handleStudentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Fix: Explicitly type `file` as `File` to resolve "property 'size' does not exist on type 'unknown'" error.
    const validFiles = Array.from(files).filter((file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            alert(`Ảnh "${file.name}" quá lớn (tối đa 4MB).`);
            return false;
        }
        return true;
    });

    if (studentImages.length + validFiles.length > MAX_STUDENT_IMAGES) {
      alert(`Chỉ có thể tải lên tối đa ${MAX_STUDENT_IMAGES} ảnh cho câu trả lời.`);
      e.target.value = '';
      return;
    }
    
    const filePromises = validFiles.map(compressAndEncodeImage);

    Promise.all(filePromises).then(results => {
      setStudentImages(prev => [...prev, ...results.map(r => r.base64Data)]);
      setStudentImageMimeTypes(prev => [...prev, ...results.map(r => r.mimeType)]);
    }).catch(error => console.error("Error processing student files:", error));
    
    e.target.value = '';
  };


  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (isProblemActive) return;
    if (e.clipboardData.files.length > 0) {
      if (images.length >= MAX_IMAGES) {
        alert(`Chỉ có thể dán tối đa ${MAX_IMAGES} ảnh.`);
        e.preventDefault();
        return;
      }
      const file = e.clipboardData.files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert(`Ảnh được dán quá lớn (tối đa 4MB).`);
        e.preventDefault();
        return;
      }
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        compressAndEncodeImage(file)
          .then(result => {
            setImages(prev => [...prev, result.base64Data]);
            setImageMimeTypes(prev => [...prev, result.mimeType]);
          })
          .catch(error => console.error("Error processing pasted file:", error));
      }
    }
  };

  const handleStudentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files.length > 0) {
      if (studentImages.length >= MAX_STUDENT_IMAGES) {
        alert(`Chỉ có thể dán tối đa ${MAX_STUDENT_IMAGES} ảnh cho câu trả lời.`);
        e.preventDefault();
        return;
      }
      const file = e.clipboardData.files[0];
       if (file.size > MAX_FILE_SIZE) {
        alert(`Ảnh được dán quá lớn (tối đa 4MB).`);
        e.preventDefault();
        return;
      }
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        compressAndEncodeImage(file)
          .then(result => {
            setStudentImages(prev => [...prev, result.base64Data]);
            setStudentImageMimeTypes(prev => [...prev, result.mimeType]);
          })
          .catch(error => console.error("Error processing pasted student file:", error));
      }
    }
  };


  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImageMimeTypes(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const removeStudentImage = (indexToRemove: number) => {
    setStudentImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setStudentImageMimeTypes(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  return (
    <section className="panel p-6 flex flex-col h-fit space-y-6">
      <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">Nhập đề & Cấu hình</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade" className="block text-base font-semibold mb-2">Khối lớp</label>
          <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value as Grade)} disabled={isLoading} className="disabled:opacity-60 disabled:cursor-not-allowed">
            <option value="6">Lớp 6</option>
            <option value="7">Lớp 7</option>
            <option value="8">Lớp 8</option>
            <option value="9">Lớp 9</option>
          </select>
        </div>
        <div>
          <label htmlFor="level" className="block text-base font-semibold mb-2">Mức gợi ý</label>
          <select id="level" value={level} onChange={(e) => setLevel(e.target.value as HintLevel)} disabled={isLoading} className="disabled:opacity-60 disabled:cursor-not-allowed">
            <option value="light">Gợi nhẹ (Socratic)</option>
            <option value="step">Hướng dẫn từng bước</option>
            <option value="outline">Dàn ý (ẩn đáp số)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="problem" className="block text-base font-semibold mb-2">Đề toán (nhập tay/dán ảnh)</label>
        <div className="relative">
          <textarea id="problem" value={problem} onChange={(e) => setProblem(e.target.value)} onPaste={handlePaste} disabled={isProblemActive || isLoading} placeholder="Nhập đề bài hoặc dán (Ctrl+V) ảnh đề vào đây..." rows={5} className="min-h-[120px] disabled:opacity-60 disabled:cursor-not-allowed" maxLength={PROBLEM_MAX_LENGTH}></textarea>
        </div>
        <div className="flex justify-between items-center mt-2">
            <label className={`button button-ghost !text-base ${isProblemActive || isLoading ? '!opacity-50 !cursor-not-allowed' : 'cursor-pointer'}`}>
                <Upload className="w-5 h-5" />
                <span>Chọn ảnh</span>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} multiple disabled={isProblemActive || isLoading} />
            </label>
            <div className="text-sm text-[var(--muted)]">
                {problem.length} / {PROBLEM_MAX_LENGTH}
            </div>
        </div>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img src={`data:${imageMimeTypes[index]};base64,${img}`} alt={`Xem trước đề ${index + 1}`} className="w-full h-auto object-cover aspect-square rounded-xl border border-[var(--border)] shadow-sm" />
                <button
                    onClick={() => removeImage(index)}
                    disabled={isProblemActive || isLoading}
                    className="absolute top-1.5 right-1.5 bg-black/50 rounded-full p-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label={`Xoá ảnh ${index + 1}`}
                >
                    <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="studentStep" className="block text-base font-semibold mb-2">Phản hồi/câu trả lời của học sinh</label>
        <div className="relative">
          <textarea id="studentStep" value={studentStep} onChange={(e) => setStudentStep(e.target.value)} onPaste={handleStudentPaste} placeholder="Nhập câu trả lời hoặc dán ảnh bài làm của em vào đây..." rows={5} className="min-h-[120px]" maxLength={STUDENT_STEP_MAX_LENGTH}></textarea>
        </div>
         <div className="flex justify-between items-center mt-2">
            <label className="button button-ghost !text-base cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>Đính kèm ảnh</span>
                <input id="student-image-upload" type="file" accept="image/*" className="hidden" onChange={handleStudentImageChange} multiple />
            </label>
            <div className="text-sm text-[var(--muted)]">
                {studentStep.length} / {STUDENT_STEP_MAX_LENGTH}
            </div>
        </div>
        {studentImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {studentImages.map((img, index) => (
                    <div key={index} className="relative group">
                        <img src={`data:${studentImageMimeTypes[index]};base64,${img}`} alt={`Bài làm của học sinh ${index + 1}`} className="w-full h-auto object-cover aspect-square rounded-xl border border-[var(--border)] shadow-sm" />
                        <button
                            onClick={() => removeStudentImage(index)}
                            className="absolute top-1.5 right-1.5 bg-black/50 rounded-full p-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-opacity opacity-0 group-hover:opacity-100"
                            aria-label={`Xoá ảnh bài làm ${index + 1}`}
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
      
      <div className="border-t border-[var(--border)] pt-6 space-y-4">
        {(isProblemActive || hasConversation) && (
          <div className="text-base text-center p-3 bg-[var(--chip)] rounded-xl border border-[var(--border)]">
            {isProblemActive ? "Bài toán đang được giải quyết. " : "Có thể bắt đầu phiên học mới. "}
            <button onClick={onClear} className="text-[var(--link)] font-bold underline inline-flex items-center gap-1.5 hover:opacity-80">
                <RefreshCw className="w-4 h-4" />
                Bắt đầu lại
            </button>
            {" "}để nhập bài mới.
          </div>
        )}
        <button onClick={onAsk} disabled={isLoading} className="button button-primary w-full !text-lg">
            <Lightbulb className="w-5 h-5"/> Lấy gợi ý
        </button>
      </div>

      <div className="border-t border-[var(--border)] pt-6 text-center">
        <h3 className="text-base font-bold mb-4">Cần tư vấn 1:1 với giáo viên?</h3>
        <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:tththam.thcsllquan@gmail.com?subject=Tư vấn toán THCS&body=Tên em là: %0D%0ALớp: %0D%0A%0D%0ANội dung cần tư vấn:%0D%0A" target="_blank" rel="noopener noreferrer" className="button button-ghost flex-1 !text-lg">
                <Mail className="w-5 h-5" /> Gửi email
            </a>
            <a href="https://zalo.me/0918894498" target="_blank" rel="noopener noreferrer" className="button button-primary flex-1 !text-lg">
                <Zalo className="w-5 h-5" /> Chat Zalo
            </a>
        </div>
      </div>

    </section>
  );
};