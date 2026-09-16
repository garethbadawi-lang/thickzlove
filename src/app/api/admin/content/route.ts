import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  patchSiteContentSection,
  readSiteContent,
  writeSiteContent,
} from "@/lib/site-content-store";
import {
  normalizeSocialLinks,
  validateSocialLinks,
} from "@/lib/social-links";
import type { SocialLink } from "@/data/socials";
import type { SiteContent, SiteContentSection } from "@/lib/site-content-types";

const SECTIONS: SiteContentSection[] = [
  "homepage",
  "about",
  "socials",
  "gallery",
  "availabilityOverrides",
  "services",
  "faqs",
  "settings",
];

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

function json(data: unknown, init?: { status?: number }) {
  return new NextResponse(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: JSON_HEADERS,
  });
}

function prepareSectionValue(
  section: SiteContentSection,
  value: unknown,
): SiteContent[SiteContentSection] {
  if (section === "socials") {
    if (!Array.isArray(value)) {
      throw new Error("Social links must be a list.");
    }
    const normalised = normalizeSocialLinks(value as SocialLink[]);
    const error = validateSocialLinks(normalised);
    if (error) throw new Error(error);
    return normalised;
  }
  return value as SiteContent[SiteContentSection];
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const content = await readSiteContent();
    return json({ content });
  } catch {
    return json({ error: "Unable to load site content." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      section?: SiteContentSection;
      value?: unknown;
      content?: SiteContent;
    };

    if (body.content) {
      const next = {
        ...body.content,
        socials: normalizeSocialLinks(body.content.socials || []),
      };
      const socialError = validateSocialLinks(next.socials);
      if (socialError) throw new Error(socialError);
      const saved = await writeSiteContent(next);
      return json({ content: saved });
    }

    if (!body.section || !SECTIONS.includes(body.section)) {
      return json({ error: "Invalid section." }, { status: 400 });
    }
    if (body.value === undefined) {
      return json({ error: "Missing value." }, { status: 400 });
    }

    const value = prepareSectionValue(body.section, body.value);
    const saved = await patchSiteContentSection(body.section, value);
    return json({ content: saved });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unable to save site content.";
    const status =
      message.startsWith("Invalid") ||
      message.includes("URL") ||
      message.includes("label") ||
      message.includes("list")
        ? 400
        : 500;
    return json({ error: message }, { status });
  }
}
