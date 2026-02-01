'use client';

import React from 'react';
import { toast } from 'react-hot-toast';

type ShareLinkModalProps = {
  open: boolean;
  url: string;
  title?: string;
  onClose: () => void;
};

async function copyToClipboard(text: string) {
  if (!text) throw new Error('Nothing to copy');

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older/blocked clipboard APIs
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.left = '-1000px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export default function ShareLinkModal({ open, url, title = 'Share', onClose }: ShareLinkModalProps) {
  if (!open) return null;

  const canCopy = Boolean(url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-[90%] max-w-sm p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>

        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
          />
          <button
            type="button"
            disabled={!canCopy}
            onClick={async () => {
              try {
                await copyToClipboard(url);
                toast.success('Link copied to clipboard');
              } catch (err) {
                toast.error('Unable to copy link');
                console.error('Copy failed:', err);
              }
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Copy
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
