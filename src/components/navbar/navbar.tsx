"use client"

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";

const Navbar = ({locale}: {locale: string}) => {
  // Change to NavbarLinks namespace for translations
  const t = useTranslations("NavbarLinks"); 
  const pathName = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
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
        <Link href={`/${locale}/`} className="hover:text-gray-400">{t("home")}</Link>
        <Link href={`/${locale}/`} className="hover:text-gray-400">{t("about")}</Link>
        <Link href={`/${locale}/`} className="hover:text-gray-400">{t("contact")}</Link>
        {isAuthenticated ? (
          <Link href={`/${locale}/profile`} className="hover:text-gray-400">
            {user?.name || t("profile")}
          </Link>
        ) : (
          <Link href={`/${locale}/auth/login`} className="hover:text-gray-400">{t("login")}</Link>
        )}
      </nav>
        <select value={locale} onChange={handleLanguageChange} aria-label="Language Selector">
            <option value="en">English</option>
            <option value="vi">Viet Nam</option>
        </select>
    </div>
  );
}

export default Navbar;