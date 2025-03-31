import Navbar from "@/components/navbar/navbar";

export default function UserLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div>
      <Navbar locale={params.locale} />
      <main>
        {children}
      </main>
    </div>
  );
}