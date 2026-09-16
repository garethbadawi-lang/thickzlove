import type { Metadata } from "next";
import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-[70vh] items-center bg-ivory px-4 py-16">
      <AdminResetPasswordForm
        token={params.token || ""}
        error={params.error || null}
      />
    </div>
  );
}
