"use client";

import { ReactNode } from "react";

export function ContentSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      <div className="lg:max-w-6xl lg:mx-auto">
        <div className="relative flex lg:flex-row gap-4 px-4 pb-4 overflow-x-auto lg:overflow-hidden">
          {children}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[50px] bg-gradient-to-r from-transparent to-white pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
