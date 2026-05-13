import type { Metadata } from "next";
import "./globals.css";
import { Inter, Lora } from "next/font/google";
import { cn } from "@/lib/utils";
import { ProfileProviderWrapper } from "@/components/profile-provider-wrapper";

const loraHeading = Lora({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Shotsu",
  description: "Local-first photography portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans", inter.variable, loraHeading.variable)}>
      <body className="min-h-full flex flex-col">
        <ProfileProviderWrapper>
          {children}
        </ProfileProviderWrapper>
      </body>
    </html>
  );
}
