// components/CategoryCard.tsx
"use client";
import Link from "next/link";

type Props = {
  title: string;
  count?: number;
  description?: string;
  href?: string;                // <- make optional
  className?: string;
};

export default function CategoryCard({
  title,
  count,
  description,
  href,
  className,
}: Props) {
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div
      className={[
        "group block h-full rounded-2xl border border-slate-200 dark:border-slate-800",
        "bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm",
        "p-6 md:p-8 shadow-sm transition-all",
        href ? "hover:shadow-md ring-0 hover:ring-2 hover:ring-blue-500/25" : "opacity-85",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
        className || "",
      ].join(" ")}
      aria-disabled={!href}
    >
      {children}
    </div>
  );

  const Body = (
    <div className="flex h-full flex-col">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        {typeof count === "number" && (
          <p className="mt-2 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            {count} CALCULATIONS
          </p>
        )}
        {description && (
          <p className="mt-4 text-slate-600 dark:text-slate-300 line-clamp-3">
            {description}
          </p>
        )}
      </div>

      <div className="mt-auto pt-6">
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold",
            href
              ? "text-white bg-blue-600 hover:bg-blue-700"
              : "text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-800/60 cursor-not-allowed",
          ].join(" ")}
        >
          {href ? "Explore" : "Coming soon"}
          {href && (
            <svg
              className="size-4 translate-x-0 group-hover:translate-x-0.5 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7.5 4.5a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.59 11H4a1 1 0 1 1 0-2h7.59L7.5 5.9a1 1 0 0 1 0-1.4Z" />
            </svg>
          )}
        </span>
      </div>
    </div>
  );

  // If href is present, wrap with <Link>; otherwise render a disabled block
  return href ? (
    <Link href={href} className="block h-full">
      <Shell>{Body}</Shell>
    </Link>
  ) : (
    <Shell>{Body}</Shell>
  );
}
