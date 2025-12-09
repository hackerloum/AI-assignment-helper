import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "AI Assignment Helper - Your AI-Powered Academic Assistant",
  description: "Stop struggling with research, citations, and grammar. Get instant AI help for all your assignments—trusted by 10,000+ Tanzanian college students.",
  keywords: "AI assignment helper, Tanzania, college students, academic writing, research assistant, APA citations, grammar checker, plagiarism checker",
  openGraph: {
    title: "AI Assignment Helper - Your AI-Powered Academic Assistant",
    description: "Get instant AI help for all your assignments—from research to citations to presentations.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

