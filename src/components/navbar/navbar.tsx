"use client"

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";



const Navbar = ({locale}: {locale: string}) => {
  const t = useTranslations("Homepage");
  const pathName = usePathname();
  const router = useRouter();
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocale = e.target.value as string;
    window.location.href = `/${selectedLocale}/`;
    const path = pathName.split("/").slice(2).join("/");
    router.push(`/${selectedLocale}/${path}`);
  };
    return (
    <div className="flex justify-between items-center bg-gray-800 text-white p-4">
      <div className="text-lg font-bold">My Website</div>
      <nav className="space-x-4">
        <Link href={`/${locale}/`} className="hover:text-gray-400">Home</Link>
        <Link href={`/${locale}/`} className="hover:text-gray-400">{t('about')}</Link>
        <Link href={`/${locale}/`} className="hover:text-gray-400">Contact</Link>
        <Link href={`/${locale}/`} className="hover:text-gray-400">Log In</Link>
      </nav>
        <select value={locale} onChange={handleLanguageChange} aria-label="Language Selector">
            <option value="en">English</option>
            <option value="vi">Viet Nam</option>
        </select>
    </div>
  );
}

export default Navbar;