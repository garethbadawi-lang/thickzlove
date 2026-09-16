import type { Metadata } from "next";
import { AdminServicesEditor } from "@/components/admin/AdminServicesEditor";

export const metadata: Metadata = {
  title: "Admin services",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminServicesEditor />;
}
