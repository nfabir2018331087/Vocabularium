export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
      <div className="text-5xl">📡</div>
      <h1 className="text-xl font-bold text-text">You're offline</h1>
      <p className="text-text-secondary max-w-xs">
        This page hasn't been saved for offline use yet. Reconnect and try again.
      </p>
    </div>
  );
}
