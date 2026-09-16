import { requireAdminSession } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Incomplete Neon profiles are redirected to /admin/account/setup.
  await requireAdminSession();
  return <AdminShell>{children}</AdminShell>;
}
