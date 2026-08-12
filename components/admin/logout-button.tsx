import { LogOut } from "lucide-react";

import { logout } from "@/app/admin/actions/logout";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex w-full items-center gap-4 rounded-xl bg-white px-5 py-4 text-left text-black transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut
          size={22}
          strokeWidth={2.5}
        />

        <span className="text-xl font-extrabold">
          Logout
        </span>
      </button>
    </form>
  );
}