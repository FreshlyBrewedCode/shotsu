import { cn } from "@/lib/utils";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("min-h-full flex flex-col", "antialiased")}>
      {children}
    </div>
  );
}
