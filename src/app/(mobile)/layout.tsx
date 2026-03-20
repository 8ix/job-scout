import { MobileHeader } from "@/components/mobile/MobileHeader";

export const dynamic = "force-dynamic";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-8">{children}</main>
    </div>
  );
}
