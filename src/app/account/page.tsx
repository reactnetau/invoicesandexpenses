"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

interface UserStatus {
  subscription_status: string;
  email: string;
  is_founding_member?: boolean;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFoundingModal, setShowFoundingModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {});
  }, []);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/user/delete", { method: "POST" });
    setDeleting(false);
    if (res.ok) {
      router.push("/goodbye");
    } else {
      alert("Failed to delete account.");
    }
  }

  async function handleCancelPro() {
    setCancelling(true);
    const res = await fetch("/api/stripe/cancel", { method: "POST" });
    setCancelling(false);
    if (res.ok) {
      alert("Your subscription will be cancelled at the end of the billing period.");
      router.refresh();
    } else {
      alert("Failed to cancel subscription.");
    }
  }

  if (!user) return <main className="max-w-2xl mx-auto px-4 py-12">Loading…</main>;

  const isPro = user.subscription_status === "active";
  const isFounding = !!user.is_founding_member;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Account</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="mb-4">
          <div className="text-sm text-slate-500 mb-1">Email</div>
          <div className="font-medium text-slate-800">{user.email}</div>
        </div>
        <div>
          <div className="text-sm text-slate-500 mb-1">Membership</div>
          <div className="font-medium text-slate-800">
            {isFounding ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Pro (free)</span>
            ) : isPro ? (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Pro (Paid)</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">Free</span>
            )}
          </div>
        </div>
      </div>
      {/* Cancel Pro button for paid (non-founding) members */}
      {isPro && !isFounding && (
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white mb-4 mr-4 disabled:opacity-60"
          onClick={handleCancelPro}
          disabled={cancelling}
        >
          {cancelling ? 'Cancelling…' : 'Cancel Pro'}
        </button>
      )}

      {/* Delete Account button (disabled for paid Pro users, enabled for founding members and free users) */}
      <button
        disabled={isPro && !isFounding}
        onClick={() => {
          if (isFounding) {
            setShowFoundingModal(true);
          } else {
            setModalOpen(true);
          }
        }}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isPro && !isFounding
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        Delete Account
      </button>

      {/* Founding member warning modal */}
      <ConfirmModal
        open={showFoundingModal}
        title="Delete account?"
        description="You are a founding member. If you delete your account, you will permanently lose your lifetime free Pro membership. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          setShowFoundingModal(false);
          handleDelete();
        }}
        onCancel={() => setShowFoundingModal(false)}
      />
      <ConfirmModal
        open={modalOpen}
        title="Delete account?"
        description="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setModalOpen(false)}
      />
    </main>
  );
}
