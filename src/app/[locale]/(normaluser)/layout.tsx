import Navbar from "@/components/navbar/navbar";

export default function NormalUserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        
        <Navbar />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}