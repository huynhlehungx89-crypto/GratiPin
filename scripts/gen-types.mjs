import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const env = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const token = env.match(/^SUPABASE_ACCESS_TOKEN=(.+)$/m)?.[1]?.trim();
const projectRef = env.match(/^SUPABASE_PROJECT_REF=(.+)$/m)?.[1]?.trim();

const out = execSync(
  `npx supabase gen types typescript --project-id ${projectRef}`,
  { env: { ...process.env, SUPABASE_ACCESS_TOKEN: token }, encoding: "utf8" }
);

fs.writeFileSync(path.join(root, "lib/database.types.ts"), out);
console.log("Generated lib/database.types.ts");
