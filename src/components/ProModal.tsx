"use client";

import React from "react";

interface ProModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProModal({ open, onClose }: ProModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Upgrade to Pro</h2>
        <ul className="mb-6 space-y-3 text-slate-700 text-base">
          <li>✅ Unlimited invoices and clients</li>
          <li>✅ Remove Invoice Tracker branding</li>
          <li>✅ Priority support</li>
          <li>✅ Export to PDF and CSV</li>
          <li>✅ Expense tracking</li>
          <li>✅ Early access to new features</li>
        </ul>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              // Trigger upgrade flow (handled in Nav)
              const event = new CustomEvent("pro-upgrade");
              window.dispatchEvent(event);
            }}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
          >
            Subscribe to Pro
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
