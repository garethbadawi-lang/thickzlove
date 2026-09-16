/**
 * Generate a bcrypt hash for ADMIN_PASSWORD_HASH.
 *
 * Usage (interactive — preferred, avoids shell history):
 *   node scripts/generate-admin-password.js
 *
 * Or with an env var (still avoid committing the password):
 *   set ADMIN_PASSWORD_PLAIN=your-password
 *   node scripts/generate-admin-password.js
 *
 * Paste ONLY the printed hash into .env.local / Vercel as ADMIN_PASSWORD_HASH.
 * The raw password is never written to disk.
 */

const bcrypt = require("bcryptjs");
const readline = require("readline");

const ROUNDS = 12;

async function hashPassword(password) {
  if (!password || typeof password !== "string" || password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, ROUNDS);
  const escaped = hash.replace(/\$/g, "\\$");
  console.log("\nFor Vercel (Environment Variables) paste this exact hash:");
  console.log(hash);
  console.log(
    "\nFor local .env.local, escape $ signs so Next.js does not corrupt the hash:",
  );
  console.log(`ADMIN_PASSWORD_HASH=${escaped}`);
  console.log("");
}

async function main() {
  const fromEnv = process.env.ADMIN_PASSWORD_PLAIN;
  if (fromEnv) {
    await hashPassword(fromEnv);
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askHidden = () =>
    new Promise((resolve) => {
      const stdin = process.stdin;
      if (stdin.isTTY) {
        stdin.setRawMode(true);
      }
      process.stdout.write("Enter admin password (input hidden): ");
      let password = "";
      const onData = (buf) => {
        const str = buf.toString("utf8");
        if (str === "\r" || str === "\n") {
          stdin.removeListener("data", onData);
          if (stdin.isTTY) stdin.setRawMode(false);
          process.stdout.write("\n");
          rl.close();
          resolve(password);
          return;
        }
        if (str === "\u0003") {
          process.exit(1);
        }
        if (str === "\u007f" || str === "\b") {
          password = password.slice(0, -1);
          return;
        }
        password += str;
      };
      stdin.on("data", onData);
    });

  const password = await askHidden();
  await hashPassword(password);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : "Failed to hash password.");
  process.exit(1);
});
