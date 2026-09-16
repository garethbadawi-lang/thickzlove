import type { Metadata } from "next";
import Link from "next/link";
import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";
import { siteConfig } from "@/data/site-config";

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
  const token = String(params.token || "").trim();
  const hasToken = Boolean(token) && !params.error;

  return (
    <div className="flex min-h-[70vh] items-center bg-ivory px-4 py-16">
      {hasToken ? (
        <AdminResetPasswordForm token={token} error={null} />
      ) : (
        <div className="mx-auto w-full max-w-md card-light space-y-5 p-8 text-center">
          <p className="font-script text-3xl text-burgundy">{siteConfig.name}</p>
          <h1 className="mt-3 font-display text-2xl text-espresso">
            Reset link unavailable
          </h1>
          <p className="text-sm text-warmgrey">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/admin/login" className="btn-primary inline-flex">
            Back to login
          </Link>
        </div>
      )}
    </div>
  );
}
