import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { AuthRedirect } from "@/components/auth/AuthRedirect";

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
      <AuthRedirect />
      <html lang={locale}>
        <body>
          <NextIntlClientProvider>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </>
  );
}