import type { Metadata } from "next";
import { AdminSocialsEditor } from "@/components/admin/AdminSocialsEditor";

export const metadata: Metadata = {
  title: "Admin socials",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminSocialsEditor />;
}
