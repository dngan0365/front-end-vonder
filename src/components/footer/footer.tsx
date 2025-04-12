"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t mt-12 bg-background/80 backdrop-blur">
      <div className="container mx-auto py-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Vonders. {t("rights")}</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link href="/privacy" className="hover:underline">{t("privacy")}</Link>
          <Link href="/terms" className="hover:underline">{t("terms")}</Link>
          <Link href="/contact" className="hover:underline">{t("contact")}</Link>
        </div>
      </div>
    </footer>
  );
}
