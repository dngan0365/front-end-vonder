
import React from "react";
import { useTranslations } from "next-intl";

export default function About () {
    const t = useTranslations("About");
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-4 text-lg">This is the about page.</p>
    </div>
  );
}