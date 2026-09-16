import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin-auth";
import { AdminAccountPanel } from "@/components/admin/AdminAccountPanel";

export const metadata: Metadata = {
  title: "Admin account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const access = await requireAdminSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Account</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Manage your Love Z Thick admin login. Email is your sign-in identity.
        </p>
      </div>
      <AdminAccountPanel
        mode={access.mode === "neon" ? "neon" : "bootstrap"}
        email={access.email || null}
        displayName={
          access.mode === "neon"
            ? access.membership?.displayName || access.name || ""
            : "Client (setup)"
        }
      />
    </div>
  );
}
