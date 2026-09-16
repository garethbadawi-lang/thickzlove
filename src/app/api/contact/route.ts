import { NextResponse } from "next/server";
import { notifyContactEnquiry } from "@/lib/notifications";

type ContactBody = {
  name?: string;
  email?: string;
  platform?: string;
  enquiryType?: string;
  experience?: string;
  message?: string;
  ageConfirmed?: boolean;
  website?: string;
};

const rateMap = new Map<string, { count: number; reset: number }>();

function getIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 5;
  const entry = rateMap.get(ip);

  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

export async function POST(req: Request) {
  try {
    const ip = getIp(req);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as ContactBody;

    // Honeypot — silent success for bots
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const platform = String(body.platform || "").trim();
    const enquiryType = String(body.enquiryType || "").trim();
    const experience = String(body.experience || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in name, email and message." },
        { status: 400 },
      );
    }

    if (!body.ageConfirmed) {
      return NextResponse.json(
        {
          error:
            "You must confirm you meet the minimum legal age in your location.",
        },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (name.length > 80 || email.length > 120 || message.length > 2000) {
      return NextResponse.json({ error: "Input too long." }, { status: 400 });
    }

    const receivedAt = new Date().toISOString();

    // Email notification is prepared only when CONTACT_NOTIFICATION_EMAIL is set.
    // No recipient / no mail provider = silent skip.
    await notifyContactEnquiry({
      name,
      email,
      platform,
      enquiryType,
      experience,
      message,
      receivedAt,
    });

    if (process.env.CONTACT_WEBHOOK_URL) {
      await fetch(process.env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          platform,
          enquiryType,
          experience,
          message,
          receivedAt,
        }),
      });
    } else if (process.env.NODE_ENV === "development") {
      console.info("[contact]", {
        name,
        email,
        platform,
        enquiryType,
        experience,
        message,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 },
    );
  }
}
