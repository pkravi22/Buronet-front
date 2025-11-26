// File: components/BottomRightAlert.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface BottomRightAlertProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number; // Time in milliseconds before auto-closing (default: 5000)
  onClose?: () => void; // Optional callback when the alert is closed
}

const iconMap = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
};

const colorMap = {
  success: {
    bg: 'bg-green-100 border-green-400',
    text: 'text-green-700',
    icon: 'text-green-500',
  },
  error: {
    bg: 'bg-red-100 border-red-400',
    text: 'text-red-700',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-yellow-100 border-yellow-400',
    text: 'text-yellow-700',
    icon: 'text-yellow-500',
  },
};

export const AlertModal: React.FC<BottomRightAlertProps> = ({
  message,
  type = 'success',
  duration = 5000,
  onClose = () => {},
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const colors = colorMap[type];

  // Auto-close functionality
  useEffect(() => {
    if (!isVisible) {
      onClose(); 
      return;
    }
    
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // Cleanup function to clear the timer
    return () => clearTimeout(timer);
  }, [duration, isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    // FIXING ELEMENT TO BOTTOM-RIGHT: 
    <div
      className={`
        fixed ${colors.bg} border-l-4 p-4 rounded-md shadow-lg 
        bottom-4 right-4 z-50 
        max-w-xs transition-all duration-500 ease-in-out
        transform animate-slide-in-right // Requires custom Tailwind animation (see below)
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${colors.icon} mt-0.5`}>
          {iconMap[type]}
        </div>
        <div className="ml-3 text-sm font-medium">
          <p className={colors.text}>{message}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className={`ml-auto -mx-1.5 -my-1.5 ${colors.text} p-1.5 rounded-md hover:bg-opacity-50 inline-flex h-8 w-8`}
          aria-label="Close"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};