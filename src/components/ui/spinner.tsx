import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={cn(
        "rounded-full border-white/20 border-t-emerald-500 animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0f0f0f]/80 backdrop-blur-sm z-50">
      <Spinner size="lg" />
    </div>
  );
}

export { Spinner, FullPageSpinner };
