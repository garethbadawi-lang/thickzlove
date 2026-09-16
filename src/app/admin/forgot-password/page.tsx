import type { Metadata } from "next";
import { AdminForgotPasswordForm } from "@/components/admin/AdminForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center bg-ivory px-4 py-16">
      <AdminForgotPasswordForm />
    </div>
  );
}
