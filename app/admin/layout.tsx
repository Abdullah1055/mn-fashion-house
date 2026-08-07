import { ReactNode } from "react";

import { requireSession } from "@/lib/auth/session";

import { Sidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: Props) {
  await requireSession();

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}