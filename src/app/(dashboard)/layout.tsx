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
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
      <Sidebar navCounts={navCounts} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
