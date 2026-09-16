import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { AdminAccountSetupForm } from "@/components/admin/AdminAccountSetupForm";
import { AdminBootstrapSetupForm } from "@/components/admin/AdminBootstrapSetupForm";
import { SITE_KEY } from "@/lib/site";
import { getSiteByKey } from "@/lib/site-access";

export const metadata: Metadata = {
  title: "Complete your account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAccountSetupPage() {
  const access = await requireAdminSession({ allowIncompleteProfile: true });

  if (access.mode === "neon" && access.profileComplete) {
    redirect("/admin");
  }

  if (access.mode === "bootstrap") {
    const site = await getSiteByKey(SITE_KEY);
    return (
      <div className="flex min-h-[70vh] items-center bg-ivory px-4 py-16">
        <AdminBootstrapSetupForm
          initialEmail={site?.bootstrapPendingEmail || ""}
          initialDisplayName={site?.bootstrapPendingDisplayName || ""}
          emailAlreadySubmitted={Boolean(site?.bootstrapPendingEmail)}
        />
      </div>
    );
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
