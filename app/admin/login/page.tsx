import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            MN Fashion House
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            Admin Login
          </h1>

          <p className="mt-2 text-neutral-500">
            Sign in to manage your store.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}