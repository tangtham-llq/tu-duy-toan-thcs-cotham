import React, { useEffect } from 'react';
import { XCircle } from './icons';

interface LightboxProps {
  src: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ src, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Add a class to body to prevent scrolling when lightbox is open
    document.body.classList.add('overflow-hidden');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative max-w-full max-h-full"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking on the image itself
      >
        <img 
          src={src} 
          alt="Xem ảnh phóng to" 
          className="block max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white dark:bg-slate-700 rounded-full p-1 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          aria-label="Đóng"
        >
          <XCircle className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};

export default Lightbox;