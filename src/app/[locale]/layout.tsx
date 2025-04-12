import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { Be_Vietnam_Pro, Roboto } from "next/font/google";

// Font Family
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

export async function generateMetadata(
  props: GenerateMetadataProps
): Promise<{ title: string }> {
  const messages = await getMessages({locale: props.params.locale});
  const title = messages?.HomePage?.title || 'Vietnam Tours';
  return {
    title
  };
}

// Language
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  
  // Validate the locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  setRequestLocale(locale);

  return (
    <>
    <html className={`${beVietnamPro.className} ${roboto.className}`} lang={locale} >
      <body>
        <AuthRedirect />
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
    </>
  );
}