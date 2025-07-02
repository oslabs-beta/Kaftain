import React from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative w-full max-w-md mx-4 backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5 text-white/70" />
        </button>
        
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-white/80 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-400 hover:bg-rose-500/30 hover:border-rose-400/60 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 