import type { BoardSkin } from "@/lib/utils/board";
import { normalizePinTemplate } from "@/lib/utils/board";
import { Board } from "@/components/board/Board";
import { BoardPinLayer } from "@/components/board/BoardPinLayer";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PinDisplay } from "@/components/pin/PinCard";

export default async function EmbedBoardPage({
  params,
  searchParams,
}: {
  params: { boardId: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  if (!token) {
    return <EmbedError />;
  }

  const admin = createAdminClient();
  const { data: board } = await admin
    .from("boards")
    .select("id, skin, embed_enabled, embed_token, company_id, companies(logo_url)")
    .eq("id", params.boardId)
    .single();

  if (!board || !board.embed_enabled || board.embed_token !== token) {
    return <EmbedError />;
  }

  const { data: pins } = await admin
    .from("pins")
    .select(
      `id, content, template, image_url, is_anonymous, is_hidden, created_at,
       position_x, position_y, rotation, is_edited, edited_at, author_member_id,
       author:members!pins_author_member_id_fkey(display_name),
       recipient:members!pins_recipient_member_id_fkey(display_name)`
    )
    .eq("board_id", board.id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  const company = board.companies as { logo_url: string | null } | null;
  const displayPins: PinDisplay[] = (pins ?? []).map((pin) => {
    const author = pin.author as { display_name: string } | null;
    const recipient = pin.recipient as { display_name: string } | null;
    return {
      id: pin.id,
      content: pin.content,
      template: normalizePinTemplate(pin.template),
      image_url: pin.image_url,
      is_anonymous: pin.is_anonymous,
      is_hidden: pin.is_hidden,
      created_at: pin.created_at,
      is_edited: pin.is_edited ?? false,
      edited_at: pin.edited_at ?? null,
      author_name: pin.is_anonymous ? "Ẩn danh" : (author?.display_name ?? "—"),
      author_member_id: pin.author_member_id,
      recipient_name: recipient?.display_name ?? null,
      position_x: pin.position_x,
      position_y: pin.position_y,
      rotation: pin.rotation,
    };
  });

  return (
    <main className="h-screen bg-cream">
      <Board skin={board.skin as BoardSkin} pins={displayPins}>
        <BoardPinLayer
          pins={displayPins}
          companyLogoUrl={company?.logo_url ?? null}
          companySlug=""
          currentMemberId=""
          draggable={false}
        />
      </Board>
    </main>
  );
}

function EmbedError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream p-8">
      <p className="text-umber/70">Không thể hiển thị bảng ghim này.</p>
    </main>
  );
}
