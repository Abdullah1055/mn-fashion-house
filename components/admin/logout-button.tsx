import { LogOut } from "lucide-react";

import { logout } from "@/app/admin/actions/logout";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </form>
  );
}