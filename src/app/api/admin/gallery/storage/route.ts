import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getGalleryStorageUsage } from "@/lib/gallery-storage";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const usage = await getGalleryStorageUsage();
    return NextResponse.json({ usage });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unable to load gallery storage usage.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
