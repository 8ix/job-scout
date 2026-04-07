import { Sidebar } from "@/components/nav/Sidebar";
import { getNavCounts } from "@/lib/nav-counts";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navCounts = await getNavCounts();

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row overflow-hidden">
      <Sidebar navCounts={navCounts} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
