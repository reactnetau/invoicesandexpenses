"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

interface UserStatus {
  subscription_status: string;
  email: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  if (!user) return <main className="max-w-2xl mx-auto px-4 py-12">Loading…</main>;

  const isPro = user.subscription_status === "active";

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
            {isPro ? (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Pro (Paid)</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">Free</span>
            )}
          </div>
        </div>
      </div>
      <button
        disabled={isPro}
        onClick={() => setModalOpen(true)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isPro
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        Delete Account
      </button>
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
