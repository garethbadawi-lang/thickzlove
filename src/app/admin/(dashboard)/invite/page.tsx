import type { Metadata } from "next";
import { AdminInviteClientForm } from "@/components/admin/AdminInviteClientForm";

export const metadata: Metadata = {
  title: "Invite client",
  robots: { index: false, follow: false },
};

export default function AdminInvitePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Invite client</h1>
        <p className="mt-2 max-w-xl text-sm text-warmgrey">
          Create a Love Z Thick admin account for the client&apos;s real email.
          They receive a secure link to choose their own password. Do not invent
          or share a permanent password.
        </p>
      </div>
      <AdminInviteClientForm />
    </div>
  );
}
