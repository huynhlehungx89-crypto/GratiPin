"use client";

import { useState } from "react";
import { addMember, createDepartment } from "@/lib/actions/admin";
import {
  completeOnboardingAction,
  updateSetupBoardSkinAction,
} from "@/lib/actions/setup";
import { getBoardSkinClass, SKIN_LABELS, type BoardSkin } from "@/lib/utils/board";

const STEPS = [
  { title: "Chào mừng", optional: false },
  { title: "Diện mạo bảng", optional: false },
  { title: "Mời thành viên", optional: true },
  { title: "Phòng ban đầu tiên", optional: true },
  { title: "Hoàn tất", optional: false },
] as const;

export function SetupWizard({
  companySlug,
  initialSkin,
}: {
  companySlug: string;
  initialSkin: BoardSkin;
}) {
  const [step, setStep] = useState(0);
  const [skin, setSkin] = useState<BoardSkin>(initialSkin);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberPassword, setMemberPassword] = useState("");

  const [deptName, setDeptName] = useState("");
  const [deptSkin, setDeptSkin] = useState<BoardSkin>("felt");

  async function saveSkinAndNext() {
    setLoading(true);
    setError(null);
    const result = await updateSetupBoardSkinAction(companySlug, skin);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setStep(2);
  }

  async function inviteMember() {
    if (!memberEmail.trim() || !memberName.trim() || !memberPassword.trim()) {
      setStep(3);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await addMember({
      companySlug,
      email: memberEmail.trim(),
      displayName: memberName.trim(),
      password: memberPassword,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMemberEmail("");
    setMemberName("");
    setMemberPassword("");
    setStep(3);
  }

  async function createFirstDepartment() {
    if (!deptName.trim()) {
      setStep(4);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createDepartment({
      companySlug,
      name: deptName.trim(),
      skin: deptSkin,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setStep(4);
  }

  async function finish() {
    setLoading(true);
    setError(null);
    const result = await completeOnboardingAction(companySlug);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  function skipOptional() {
    if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
      <div className="mb-8 flex justify-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className={`h-2 w-8 rounded-full transition ${
              i <= step ? "bg-peach" : "bg-umber/15"
            }`}
            title={s.title}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-umber/10 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        {step === 0 && (
          <div className="space-y-4 text-center">
            <h1 className="font-heading text-2xl text-peach sm:text-3xl">
              Chào mừng đến GratiPin!
            </h1>
            <p className="text-umber/80">
              GratiPin giúp đội ngũ ghi lại lời biết ơn, kỷ niệm ấm áp trên bảng ghim
              tương tác. Hãy thiết lập nhanh vài bước trước khi bắt đầu.
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 rounded-full bg-peach px-8 py-3 font-heading text-white hover:opacity-90"
            >
              Bắt đầu
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-umber">
              Chọn diện mạo Bảng chung
            </h2>
            <p className="text-sm text-umber/70">
              Đây là bảng đầu tiên mọi người sẽ thấy khi vào công ty.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(SKIN_LABELS) as BoardSkin[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkin(s)}
                  className={`overflow-hidden rounded-xl border-2 p-2 text-left transition ${
                    skin === s ? "border-peach" : "border-transparent"
                  }`}
                >
                  <div
                    className={`mb-2 h-16 w-full rounded-lg ${getBoardSkinClass(s)}`}
                  />
                  <span className="text-sm font-medium text-umber">
                    {SKIN_LABELS[s]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={saveSkinAndNext}
                className="rounded-full bg-peach px-6 py-2.5 font-heading text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : "Tiếp tục"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-umber">Mời thành viên</h2>
            <p className="text-sm text-umber/70">
              Tuỳ chọn — bạn có thể mời sau ở trang Thành viên.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="w-full rounded-lg border border-umber/20 px-3 py-2"
            />
            <input
              placeholder="Tên hiển thị"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="w-full rounded-lg border border-umber/20 px-3 py-2"
            />
            <input
              type="password"
              placeholder="Mật khẩu tạm (tối thiểu 8 ký tự)"
              minLength={8}
              value={memberPassword}
              onChange={(e) => setMemberPassword(e.target.value)}
              className="w-full rounded-lg border border-umber/20 px-3 py-2"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={inviteMember}
                className="rounded-full bg-peach px-6 py-2.5 font-heading text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Đang mời..." : "Mời & tiếp tục"}
              </button>
              <button
                type="button"
                onClick={skipOptional}
                className="rounded-full border border-umber/20 px-6 py-2.5 text-umber/80 hover:bg-umber/5"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-umber">
              Tạo phòng ban đầu tiên
            </h2>
            <p className="text-sm text-umber/70">
              Tuỳ chọn — mỗi phòng ban có bảng ghim riêng.
            </p>
            <input
              placeholder="Tên phòng ban (VD: Marketing)"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full rounded-lg border border-umber/20 px-3 py-2"
            />
            <select
              value={deptSkin}
              onChange={(e) => setDeptSkin(e.target.value as BoardSkin)}
              className="w-full rounded-lg border border-umber/20 px-3 py-2"
            >
              {(Object.keys(SKIN_LABELS) as BoardSkin[]).map((s) => (
                <option key={s} value={s}>
                  {SKIN_LABELS[s]}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={createFirstDepartment}
                className="rounded-full bg-peach px-6 py-2.5 font-heading text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Đang tạo..." : "Tạo & tiếp tục"}
              </button>
              <button
                type="button"
                onClick={skipOptional}
                className="rounded-full border border-umber/20 px-6 py-2.5 text-umber/80 hover:bg-umber/5"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <h2 className="font-heading text-2xl text-peach">Sẵn sàng rồi!</h2>
            <p className="text-umber/80">
              Bảng chung của bạn đã sẵn sàng. Hãy bắt đầu ghim những khoảnh khắc đáng
              nhớ cùng đội ngũ.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={finish}
              className="mt-2 rounded-full bg-peach px-8 py-3 font-heading text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Đang vào bảng..." : "Vào Bảng chung"}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
