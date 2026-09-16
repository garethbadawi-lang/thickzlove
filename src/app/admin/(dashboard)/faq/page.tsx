import type { Metadata } from "next";
import { AdminFaqEditor } from "@/components/admin/AdminFaqEditor";

export const metadata: Metadata = {
  title: "Admin faq",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminFaqEditor />;
}
