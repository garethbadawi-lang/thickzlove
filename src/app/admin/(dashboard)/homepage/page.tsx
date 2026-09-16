import type { Metadata } from "next";
import { AdminHomepageEditor } from "@/components/admin/AdminHomepageEditor";

export const metadata: Metadata = {
  title: "Admin homepage",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminHomepageEditor />;
}
