import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandPanel } from "@/components/landing/BrandPanel";
import { DemoCorkboard } from "@/components/landing/DemoCorkboard";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="grid lg:grid-cols-2 lg:items-stretch">
        <BrandPanel>
          <h1 className="mt-6 text-center font-heading text-2xl font-bold text-umber sm:text-3xl">
            Chào mừng trở lại
          </h1>
          <p className="mt-2 text-center font-body text-sm text-umber/80">
            Đăng nhập để xem bảng ghim của công ty bạn
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-6 text-center font-body text-sm text-umber/75">
            Chưa có công ty?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#d4845c] underline decoration-[#d4845c]/40 underline-offset-2 transition hover:text-peach"
            >
              Tạo bảng ghim miễn phí
            </Link>
          </p>
        </BrandPanel>
        <DemoCorkboard />
      </section>
    </div>
  );
}
