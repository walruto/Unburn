export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-sm">
      <div className="w-10 h-10 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
      <p className="text-on-surface-variant font-body-md">Loading...</p>
    </div>
  );
}
