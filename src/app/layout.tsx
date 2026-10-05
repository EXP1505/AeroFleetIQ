import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { RecommendationsProvider } from "@/context/recommendations-context";
import { LiveAlertProvider } from "@/context/live-alert-context";
import { DemoProvider } from "@/context/demo-context";
import { DemoOverlay } from "@/components/demo/demo-overlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AeroFleetIQ — Predictive Maintenance & Fleet Availability",
  description: "SIH26249 demo prototype: predictive maintenance and fleet availability for a synthetic air fleet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delayDuration={200}>
          <DemoProvider>
            <LiveAlertProvider>
              <RecommendationsProvider>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex flex-1 flex-col min-w-0">
                    <Topbar />
                    <main className="flex-1 overflow-x-hidden px-6 py-6">{children}</main>
                    <Footer />
                  </div>
                </div>
                <DemoOverlay />
                <Toaster theme="dark" position="top-right" richColors />
              </RecommendationsProvider>
            </LiveAlertProvider>
          </DemoProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
