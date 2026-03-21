export default function LoadingSpinner({ fullScreen }) {
  const spinner = (
    <div className="flex items-center justify-center gap-2">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-sm text-on-surface-variant">Đang tải...</span>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center">{spinner}</div>;
  }
  return <div className="py-12 flex items-center justify-center">{spinner}</div>;
}
