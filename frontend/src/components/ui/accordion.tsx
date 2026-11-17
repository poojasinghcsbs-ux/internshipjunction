import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  items,
  className,
  defaultOpen = -1,
}: {
  items: { title: ReactNode; content: ReactNode }[];
  className?: string;
  defaultOpen?: number;
}) {
  return (
    <div className={cn("divide-y divide-border rounded-xl border border-border bg-card", className)}>
      {items.map((item, index) => (
        <AccordionItem key={index} title={item.title} defaultOpen={defaultOpen === index}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}

function AccordionItem({
  title,
  children,
  defaultOpen,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const id = useId();
  return (
    <div>
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition-colors hover:bg-muted/60"
        >
          <span>{title}</span>
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        hidden={!open}
        className="px-5 pb-4 text-sm text-muted-foreground animate-fade-in"
      >
        {children}
      </div>
    </div>
  );
}
