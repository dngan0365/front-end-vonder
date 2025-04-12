import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { getMessages } from "next-intl/server";

type GenerateMetadataProps = {
  params: { locale: string }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
          {children}
    </AuthProvider>
  );
}