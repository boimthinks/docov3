/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { LucideIcon } from './LucideIcon';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger',
  icon,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: icon || 'AlertTriangle',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          textColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: icon || 'AlertTriangle',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          textColor: 'text-amber-600',
          buttonColor: 'bg-amber-600 hover:bg-amber-700',
        };
      case 'info':
        return {
          icon: icon || 'Info',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          textColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'success':
        return {
          icon: icon || 'CheckCircle',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          textColor: 'text-emerald-600',
          buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
        };
      default:
        return {
          icon: icon || 'AlertTriangle',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          textColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
    }
  };

  const { icon: modalIcon, bgColor, borderColor, textColor, buttonColor } = getIconAndColors();

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 border border-slate-150 shadow-2xl space-y-4">
        <div className={`w-12 h-12 ${bgColor} ${borderColor} rounded-full flex items-center justify-center mx-auto`}>
          <LucideIcon name={modalIcon} className={textColor} size={24} />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-xs font-bold text-white ${buttonColor} py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-current/10`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Simple Alert Modal (for replacing alert() calls)
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  icon,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: icon || 'AlertTriangle',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          textColor: 'text-red-600',
        };
      case 'warning':
        return {
          icon: icon || 'AlertTriangle',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          textColor: 'text-amber-600',
        };
      case 'info':
        return {
          icon: icon || 'Info',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          textColor: 'text-blue-600',
        };
      case 'success':
        return {
          icon: icon || 'CheckCircle',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          textColor: 'text-emerald-600',
        };
      default:
        return {
          icon: icon || 'Info',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          textColor: 'text-blue-600',
        };
    }
  };

  const { icon: modalIcon, bgColor, borderColor, textColor } = getIconAndColors();

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 border border-slate-150 shadow-2xl space-y-4">
        <div className={`w-12 h-12 ${bgColor} ${borderColor} rounded-full flex items-center justify-center mx-auto`}>
          <LucideIcon name={modalIcon} className={textColor} size={24} />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-blue-500/10"
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
