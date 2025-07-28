import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "blue" | "white" | "gray";
}

export function LoadingSpinner({ size = "md", className, color = "blue" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClasses = {
    blue: "border-blue-600 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-400 border-t-transparent"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6 shadow-lg animate-pulse", className)}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = "Carregando...", className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <LoadingSpinner size="xl" />
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-700 font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingButton({ 
  children, 
  isLoading, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  isLoading?: boolean;
  children: React.ReactNode; 
}) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={cn(
        props.className,
        isLoading && "cursor-not-allowed opacity-70"
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" color="white" />
          <span>Processando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
