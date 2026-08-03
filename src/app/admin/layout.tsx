import { redirect } from "next/navigation";
import { getSessionUser, isAdminEmail } from "@/lib/auth0";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/auth/login?returnTo=/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin</h1>
          <span className="text-sm text-gray-500">{user.email}</span>
        </div>
      </header>
      <div className="p-6">{children}</div>
    </div>
  );
}
