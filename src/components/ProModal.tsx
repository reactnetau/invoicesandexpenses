"use client";

import React from "react";

interface ProModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProModal({ open, onClose }: ProModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-white/60 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.2)] relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[rgba(96,165,250,0.18)] via-transparent to-[rgba(34,197,94,0.18)]" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-10 w-10 rounded-2xl bg-white/85 text-slate-400 hover:text-slate-700 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <p className="theme-kicker mb-4 relative z-10">Pro subscription</p>
        <h2 className="text-3xl font-bold mb-3 text-slate-900 relative z-10">Understand your money. No stress.</h2>
        <p className="mb-6 text-sm text-slate-600 relative z-10">Unlock the full experience with a simple monthly plan built for freelancers and contractors who want calm, clear finance tools.</p>
        <ul className="mb-7 grid gap-3 text-slate-700 text-sm relative z-10">
          <li className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">Unlimited invoices and clients</li>
          <li className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">Expense tracking with more room to grow</li>
          <li className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">Export to PDF and CSV</li>
          <li className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">Priority support and early feature access</li>
        </ul>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              const event = new CustomEvent("pro-upgrade");
              window.dispatchEvent(event);
            }}
            className="theme-button-primary w-full text-base"
          >
            Subscribe to Pro
          </button>
          <button
            onClick={onClose}
            className="theme-button-secondary w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
