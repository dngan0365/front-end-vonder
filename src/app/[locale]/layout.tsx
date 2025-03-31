import { Be_Vietnam_Pro, Roboto } from "next/font/google";
import "../globals.css";
// locale
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {setRequestLocale} from 'next-intl/server';
// Components
import Navbar from "@/components/navbar/navbar";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'], // Optional: Add subsets if needed
  weight: ['400', '500', '700'], // Choose weights you need
  display: 'swap', // Improves performance
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body
        className={`${beVietnamPro.className} ${roboto.className}`}>   
          <NextIntlClientProvider>
            <div>
              <Navbar locale ={locale} />
              {children}
            </div>
          </NextIntlClientProvider>
      </body>
    </html>
  );
}
