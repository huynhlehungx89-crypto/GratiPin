/**
 * Run supabase/migrations/*.sql against remote project via Management API.
 * Usage: node scripts/run-migration.mjs [migration-file]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  const get = (key) => raw.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
  return {
    token: get("SUPABASE_ACCESS_TOKEN"),
    projectRef: get("SUPABASE_PROJECT_REF"),
  };
}

async function runQuery(token, projectRef, query) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return text;
}

async function main() {
  const { token, projectRef } = loadEnv();
  if (!token?.startsWith("sbp_")) {
    throw new Error("SUPABASE_ACCESS_TOKEN missing or invalid in .env.local");
  }

  const migrationFile =
    process.argv[2] ??
    path.join(root, "supabase/migrations/20260708160000_initial_schema.sql");

  const sql = fs.readFileSync(migrationFile, "utf8");
  console.log(`Running migration: ${path.basename(migrationFile)}`);

  const result = await runQuery(token, projectRef, sql);
  console.log("Migration OK:", result.slice(0, 200));
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
