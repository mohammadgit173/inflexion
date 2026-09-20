// Intentionally a server component: this is a plain anchor with CSS-only
// hover/focus brackets, so there is no reason to ship it to the client.
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost";

const base =
  "group relative inline-flex items-center justify-center gap-2 px-5 py-3 " +
  "mono text-[0.6875rem] uppercase tracking-[0.14em] " +
  "transition-colors duration-200 select-none";

const variants: Record<Variant, string> = {
  // Inverted block — reads as the primary action in both themes.
  solid:
    "bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-white",
  // Border held at --border-interactive so it clears 3:1 against the page.
  outline:
    "border border-[var(--border-interactive)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent-text)]",
  ghost: "text-[var(--text-muted)] hover:text-[var(--text)]",
};

/**
 * Corner brackets that appear on hover/focus — the technical-drawing accent.
 * Purely decorative, so they stay out of the accessibility tree.
 */
function Corners() {
  const corner =
    "pointer-events-none absolute h-2 w-2 border-[var(--accent)] opacity-0 " +
    "transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100";

  return (
    <span aria-hidden="true">
      <span className={`${corner} -left-1 -top-1 border-l border-t`} />
      <span className={`${corner} -right-1 -top-1 border-r border-t`} />
      <span className={`${corner} -bottom-1 -left-1 border-b border-l`} />
      <span className={`${corner} -bottom-1 -right-1 border-b border-r`} />
    </span>
  );
}

type BracketLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: Variant;
};

export function BracketLink({
  children,
  variant = "outline",
  className = "",
  ...props
}: BracketLinkProps) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      <Corners />
      {children}
    </a>
  );
}

export { base as buttonBase, variants as buttonVariants, Corners };
