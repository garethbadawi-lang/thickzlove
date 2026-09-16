import type { Metadata } from "next";
import { AdminAboutEditor } from "@/components/admin/AdminAboutEditor";

export const metadata: Metadata = {
  title: "Admin about",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminAboutEditor />;
}
