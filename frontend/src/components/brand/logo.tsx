import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#032354] shadow-soft ring-1 ring-black/10">
        <img
          src={logoImage}
          alt={showText ? "" : "InternshipJunction"}
          className="size-full object-contain"
          width={264}
          height={320}
        />
      </span>
      {showText && (
        <span className="text-lg font-extrabold tracking-tight">
          Internship<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Junction</span>
        </span>
      )}
    </span>
  );
}
