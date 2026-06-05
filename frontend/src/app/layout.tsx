import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HeroCollab | Smart Project & Task Collaboration System",
  description: "Manage projects, assign tasks, and track team workloads seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.className} h-full bg-slate-950 text-slate-100 antialiased`}>
        <AuthProvider>
          {children}
          <Toaster theme="dark" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
