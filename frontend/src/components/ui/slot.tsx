import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type SlotProps = {
  children?: ReactNode;
} & Record<string, unknown>;

export function Slot({ children, ...props }: SlotProps) {
  if (Children.count(children) > 1) {
    throw new Error("Slot can only receive a single child element");
  }
  const child = Children.only(children) as ReactElement<Record<string, unknown>>;
  if (!isValidElement(child)) return null;
  const childProps = child.props ?? {};
  return cloneElement(child, {
    ...props,
    ...childProps,
    className: [props.className, childProps.className].filter(Boolean).join(" "),
  });
}
