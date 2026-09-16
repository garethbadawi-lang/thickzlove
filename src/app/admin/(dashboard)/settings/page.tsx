import type { Metadata } from "next";
import { AdminSettingsEditor } from "@/components/admin/AdminSettingsEditor";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminSettingsEditor />;
}
