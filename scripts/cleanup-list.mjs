import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const users = await sql`
  SELECT id::text AS id, email, name
  FROM neon_auth.user
  ORDER BY email
`;
console.log("BEFORE users", users.length);
users.forEach((u) => console.log(" ", u.email));

const links = await sql`
  SELECT u.email, s.site_key
  FROM site_admins sa
  JOIN sites s ON s.id = sa.site_id
  JOIN neon_auth.user u ON u.id::text = sa.auth_user_id
  ORDER BY 1
`;
console.log("BEFORE links", links.length);
links.forEach((l) => console.log(" ", l.email, "→", l.site_key));
