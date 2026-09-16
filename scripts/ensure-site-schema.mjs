import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(databaseUrl);
const schemaPath = resolve(process.cwd(), "db/schema.sql");
const raw = readFileSync(schemaPath, "utf8");

// Strip comments and split into statements.
const statements = raw
  .split(";")
  .map((s) =>
    s
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim(),
  )
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
  console.log("OK:", statement.slice(0, 60).replace(/\s+/g, " ") + "…");
}

const sites = await sql`
  SELECT site_key, display_name, contact_email, created_at
  FROM sites
  WHERE site_key = 'thickzlove'
`;
console.log("thickzlove sites:", sites);
