'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  open: boolean;
}

export function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  open
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    setIsVisible(open);
    
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <AlertCircle className="h-5 w-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800'
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-slide-down">
      <div 
        className={cn(
          "px-4 py-3 rounded-lg shadow-lg border-2 flex items-center gap-3",
          bgColors[type],
          textColors[type]
        )}
      >
        {icons[type]}
        <span className="font-medium">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    type: ToastProps['type'];
    duration?: number;
  }>({
    open: false,
    message: '',
    type: 'success',
    duration: 3000
  });

  const toast = (props: Omit<ToastProps, 'open' | 'onClose'>) => {
    setState({
      open: true,
      message: props.message,
      type: props.type || 'success',
      duration: props.duration
    });
  };

  const dismiss = () => {
    setState(prev => ({ ...prev, open: false }));
  };

  return {
    toast,
    dismiss,
    ...state
  };
} 