import { Loader2 } from "lucide-react";

export default function Spinner({ size = 24, className = "" }) {
  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={`animate-spin text-blue-500 ${className}`}
        size={size}
        strokeWidth={2.5}
      />
    </div>
  );
}
