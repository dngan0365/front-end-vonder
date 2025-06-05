import Navbar from "@/components/navbar/navbar";

export default function NormalUserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>      
      {/* Main Layout */}
      <div className="flex flex-col min-h-[calc(100vh-65px)]">        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}