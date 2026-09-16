import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Bookings",
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return <AdminDashboard />;
}
