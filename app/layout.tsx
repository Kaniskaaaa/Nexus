import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import ConditionalNavBar from "@/components/ConditionalNavBar";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Nexus - AI-Powered Vendor Compliance",
  description: "Automated vendor onboarding and compliance verification powered by AI agents",
};

export const viewport: Viewport = {
  themeColor: "#0f1f3d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-slate-50">
            <Toaster
              position="top-right"
              toastOptions={{
                className: "font-dm text-sm",
                style: { borderRadius: "12px", padding: "12px 16px" },
                success: {
                  style: {
                    background: "#ecfdf5",
                    color: "#065f46",
                    border: "1px solid #a7f3d0",
                  },
                },
                error: {
                  style: {
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                  },
                },
              }}
            />
            <ConditionalNavBar />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
