import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <span className="relative inline-flex size-4.5 items-center">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer size-[18px] cursor-pointer appearance-none rounded-[5px] border border-input bg-background transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          className
        )}
        {...props}
      />
      <Check className="pointer-events-none absolute left-[3px] top-[2px] size-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100" />
    </span>
  )
);
Checkbox.displayName = "Checkbox";
