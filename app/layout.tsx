import { Inter } from "next/font/google";
import ActiveStatus from "@/components/active-status";
import AuthProvider from "@/providers/auth-provider";
import ToasterProvider from "@/providers/toaster-provider";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ringmaster Messaging",
  description: "A fully featured messaging app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToasterProvider />
          <ActiveStatus />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
