import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const raw = fs.readFileSync(path.join(root, ".env.local"), "utf8");
  const get = (key) => raw.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
  return {
    url: get("NEXT_PUBLIC_SUPABASE_URL"),
    serviceKey: get("SUPABASE_SERVICE_ROLE_KEY"),
    emails: (get("PLATFORM_ADMIN_EMAILS") ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
    password: get("PLATFORM_ADMIN_PASSWORD"),
  };
}

async function ensureAuthUser(admin, email, password) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    if (password) {
      const { error } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });
      if (error) throw error;
      console.log(`Updated password for existing user: ${email}`);
    } else {
      console.log(`User already exists: ${email}`);
    }
    return existing.id;
  }

  if (!password) {
    throw new Error(
      `User ${email} not found. Set PLATFORM_ADMIN_PASSWORD in .env.local to create it.`
    );
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Created platform admin user: ${email}`);
  return data.user.id;
}

async function main() {
  const { url, serviceKey, emails, password } = loadEnv();
  if (!url || !serviceKey) throw new Error("Missing Supabase URL or service role key");
  if (emails.length === 0) throw new Error("PLATFORM_ADMIN_EMAILS is empty");

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const email of emails) {
    await ensureAuthUser(admin, email, password);
  }

  console.log("\nPlatform admin ready. Emails:", emails.join(", "));
  if (password) {
    console.log("Login password: (from PLATFORM_ADMIN_PASSWORD in .env.local)");
  }
  console.log("Access: /connecta-admin after signing in at /login");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
