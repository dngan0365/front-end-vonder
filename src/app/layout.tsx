import { Be_Vietnam_Pro, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html>
        <body className={`${beVietnamPro.className} ${roboto.className}`}>
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}