// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Breadcrumb";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Engineering Portal",
  description: "Engineering calculators Suite.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}