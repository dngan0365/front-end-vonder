import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { AuthRefresher } from "@/components/auth/AuthRefresher";
import Navbar from "@/components/navbar/navbar";

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
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider locale={locale}>
      <AuthRefresher />
      {/* Main Layout */}
      <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1">
              {children}
          </div>
      </div>

    </NextIntlClientProvider>
  );
}