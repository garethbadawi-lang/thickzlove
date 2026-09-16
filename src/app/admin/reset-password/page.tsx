import type { Metadata } from "next";
import Link from "next/link";
import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

/**
 * Password reset is authorized ONLY by a Neon Auth recovery token from the
 * email link (?token=...). Email / userId query params must never unlock the form.
 */
function extractResetToken(params: Record<string, string | string[] | undefined>): {
  token: string | null;
  invalid: boolean;
} {
  if (params.error) {
    return { token: null, invalid: true };
  }

  const raw = params.token;
  const token = Array.isArray(raw) ? String(raw[0] || "") : String(raw || "");
  const cleaned = token.trim();

  // Presence of a non-empty token is required to show the form. Neon Auth
  // validates the token server-side on submit — we do not trust email/userId.
  if (!cleaned) {
    return { token: null, invalid: true };
  }

  return { token: cleaned, invalid: false };
}

function InvalidResetLink() {
  return (
    <div className="mx-auto w-full max-w-md card-light space-y-6 p-8 text-center">
      <div>
        <p className="font-script text-3xl text-burgundy">{siteConfig.name}</p>
        <h1 className="mt-3 font-display text-2xl text-espresso">
          Invalid or expired password reset link.
        </h1>
        <p className="mt-3 text-sm text-warmgrey">
          Request a new reset link to continue.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/admin/forgot-password" className="btn-primary w-full">
          Request a new reset link
        </Link>
        <Link href="/admin/login" className="btn-secondary w-full">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { token, invalid } = extractResetToken(params);

  return (
    <div className="flex min-h-[70vh] items-center bg-ivory px-4 py-16">
      {token && !invalid ? (
        <AdminResetPasswordForm token={token} />
      ) : (
        <InvalidResetLink />
      )}
    </div>
  );
}
