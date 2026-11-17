"use client";

export function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-12">{children}</main>
    </div>
  );
}
