import { Be_Vietnam_Pro, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { getMessages } from "next-intl/server";

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

type GenerateMetadataProps = {
  params: { locale: string }
}

export async function generateMetadata(
  props: GenerateMetadataProps
): Promise<{ title: string }> {
  const messages = await getMessages({locale: props.params.locale});
  const title = messages?.HomePage?.title || 'Vietnam Tours';
  return {
    title
  };
}

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