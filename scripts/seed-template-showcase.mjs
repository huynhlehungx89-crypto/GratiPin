/**
 * Seed 7 showcase pins (one per template) for Phase 5.7 screenshot.
 * Usage: node scripts/seed-template-showcase.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const raw = fs.readFileSync(path.join(root, ".env.local"), "utf8");
  const get = (k) => raw.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
  return {
    url: get("NEXT_PUBLIC_SUPABASE_URL"),
    serviceKey: get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

const SHOWCASE = [
  { template: "note", content: "Cảm ơn nha!", rotation: -2 },
  {
    template: "polaroid",
    content: "Đà Lạt 2025",
    rotation: 2.5,
    image_url:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=380&h=300&fit=crop",
  },
  { template: "floral", content: "Chúc mừng 1 năm gắn bó!", rotation: 0.5 },
  { template: "washi", content: "Hại não ghê 😄", rotation: 3 },
  { template: "garden", content: "Cố lên nha!", rotation: -1 },
  { template: "sunshine", content: "Đỉnh của chóp! 🎉", rotation: 2 },
  { template: "love", content: "Cảm ơn vì luôn ở đó ❤️", rotation: -2 },
];

const SHOWCASE_CONTENTS = SHOWCASE.map((s) => s.content);

async function main() {
  const { url, serviceKey } = loadEnv();
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: company } = await admin
    .from("companies")
    .select("id")
    .eq("slug", "cong-ty-mau-a")
    .single();
  if (!company) throw new Error("Company not found");

  const { data: board } = await admin
    .from("boards")
    .select("id")
    .eq("company_id", company.id)
    .is("department_id", null)
    .single();
  if (!board) throw new Error("Board not found");

  const { data: member } = await admin
    .from("members")
    .select("id")
    .eq("company_id", company.id)
    .eq("role", "admin")
    .limit(1)
    .single();
  if (!member) throw new Error("Member not found");

  await admin.from("pins").delete().eq("board_id", board.id).in("content", SHOWCASE_CONTENTS);

  const rows = SHOWCASE.map((item, i) => ({
    company_id: company.id,
    board_id: board.id,
    author_member_id: member.id,
    is_anonymous: false,
    content: item.content,
    template: item.template,
    image_url: item.image_url ?? null,
    position_x: 40 + i * 220,
    position_y: 480,
    rotation: item.rotation,
  }));

  const { error } = await admin.from("pins").insert(rows);
  if (error) throw error;

  console.log(`Seeded ${rows.length} showcase pins on board ${board.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
