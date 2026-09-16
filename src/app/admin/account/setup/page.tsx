import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { AdminAccountSetupForm } from "@/components/admin/AdminAccountSetupForm";

export const metadata: Metadata = {
  title: "Complete your account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAccountSetupPage() {
  const access = await requireAdminSession({ allowIncompleteProfile: true });

  if (access.mode === "legacy" || access.profileComplete) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-[70vh] items-center bg-ivory px-4 py-16">
      <AdminAccountSetupForm
        email={access.email || ""}
        initialDisplayName={
          access.membership?.displayName || access.name || ""
        }
      />
    </div>
  );
}
