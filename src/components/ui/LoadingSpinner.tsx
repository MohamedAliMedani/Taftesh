"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-16 w-16" : "h-12 w-12";
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-amber-500 ${sizeClass}`} />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
