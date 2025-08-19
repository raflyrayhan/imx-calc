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
      <head>
        {/* Force light color scheme for form controls/scrollbars */}
        <meta name="color-scheme" content="light" />
        {/* Remove any persisted dark mode before hydration (prevents flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.classList.remove('dark');localStorage.removeItem('theme');}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white text-slate-900`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
