import { requireSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-neutral-500">
          Welcome {session.user.email}
        </p>
      </div>

    </div>
  );
}