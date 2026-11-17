import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(130deg,var(--primary),var(--accent))] text-sm font-semibold text-white",
        className
      )}
      aria-hidden={false}
      role="img"
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} loading="lazy" className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
