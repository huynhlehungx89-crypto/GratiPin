import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl text-peach">Chào mừng trở lại</h1>
        <p className="mt-2 text-umber/80">Đăng nhập để xem bảng ghim của công ty bạn</p>
      </div>
      <LoginForm />
    </main>
  );
}
