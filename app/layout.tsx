// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Breadcrumb";
import HideOnRoutes from "@/components/HideOnRoutes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Engineering Portal",
  description: "Engineering calculators Suite.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        
        <meta name="color-scheme" content="light" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.classList.remove('dark');localStorage.removeItem('theme');}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white text-slate-900`}>
        <>
      <HideOnRoutes>
        <Navbar />
      </HideOnRoutes>
        {children}
        </>
      </body>
    </html>
  );
}
