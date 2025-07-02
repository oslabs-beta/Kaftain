import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ isOpen, title, message, onClose }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md mx-4 backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5 text-white/70" />
        </button>
        
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/20">
            <AlertCircle className="h-6 w-6 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-white/80">{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 