import type { Metadata } from "next";
import { AdminGalleryEditor } from "@/components/admin/AdminGalleryEditor";

export const metadata: Metadata = {
  title: "Admin gallery",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminGalleryEditor />;
}
