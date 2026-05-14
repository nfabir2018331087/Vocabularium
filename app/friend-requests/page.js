"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { getFriendData, acceptFriendRequest, rejectFriendRequest } from "../actions/friends";
import Toast from "../components/Toast";

function Avatar({ user }) {
  const initials = (user.name || user.email || "?").slice(0, 2).toUpperCase();
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4 -mx-4 -mt-6 pb-8">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="h-7 w-44 bg-white/20 rounded-lg" />
        <div className="h-4 w-32 bg-white/10 rounded mt-2" />
      </div>
      <div className="px-4 flex flex-col gap-2 mt-1">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-alt rounded-xl skeleton" />)}
      </div>
    </div>
  );
}

export default function FriendRequestsPage() {
  const { user, loading: authLoading, isGuest } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/profile");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    getFriendData().then((data) => {
      setRequests(data.requests || []);
      setLoading(false);
    });
  }, [user]);

  function showToast(msg, type = "success") {
    setToast({ message: msg, type });
  }

  async function handleAccept(id) {
    setActionId(id);
    setActionType("accept");
    await acceptFriendRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setActionId(null);
    setActionType(null);
    showToast("Friend request accepted!");
  }

  async function handleReject(id) {
    setActionId(id);
    setActionType("reject");
    await rejectFriendRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setActionId(null);
    setActionType(null);
  }

  if (authLoading || loading) return <LoadingState />;

  return (
    <div className="flex flex-col gap-4 -mx-4 -mt-6 pb-8">
      {/* Hero */}
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl relative">
        <div className="flex items-center gap-3">
          <Link
            href="/friends"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Friend Requests</h1>
            <p className="text-sm text-white/75 mt-0.5">
              {requests.length} pending request{requests.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-4 flex flex-col gap-2 mt-1">
        {requests.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">No pending friend requests.</p>
            <Link href="/friends" className="text-primary font-medium text-sm">Back to Friends</Link>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-border bg-surface-alt p-4">
              <div className="flex items-center gap-3">
                <Avatar user={req.sender} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{req.sender.name || req.sender.email}</p>
                  <p className="text-xs text-text-secondary truncate">{req.sender.email}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {new Date(req.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={actionId === req.id}
                  className="px-4 py-1.5 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:text-text hover:border-text-secondary transition-colors disabled:opacity-50"
                >
                  {actionId === req.id && actionType === "reject" ? "Declining..." : "Decline"}
                </button>
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={actionId === req.id}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {actionId === req.id && actionType === "accept" ? "Accepting..." : "Accept"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
