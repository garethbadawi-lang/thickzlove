import type { Metadata } from "next";
import { AdminAvailabilityEditor } from "@/components/admin/AdminAvailabilityEditor";

export const metadata: Metadata = {
  title: "Admin availability",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminAvailabilityEditor />;
}
