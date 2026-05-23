import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Travel Food Restaurant Portal",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Decorative brand gradient in corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #FC5F30 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-5 blur-3xl"
        style={{ background: "radial-gradient(circle, #FC5F30 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-sm px-4">
        {children}
      </div>
    </div>
  );
}
