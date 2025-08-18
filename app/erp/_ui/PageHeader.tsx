"use client";
export function PageHeader({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {aside}
    </header>
  );
}
