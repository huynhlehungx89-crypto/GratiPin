import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl text-peach">Tạo công ty mới</h1>
        <p className="mt-2 text-umber/80">
          Bắt đầu hành trình ghi nhận kỷ niệm ấm áp cùng đội ngũ
        </p>
      </div>
      <SignupForm />
    </main>
  );
}
