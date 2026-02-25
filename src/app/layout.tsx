import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KYCGate",
  description: "KYC, KYB & AML Compliance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
