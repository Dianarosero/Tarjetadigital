import type { Metadata } from "next";
import { logoutAction } from "./actions";
import { requireAdmin } from "@/lib/auth/admin-session";

export const metadata: Metadata = {
  title: "Administración · Baby Shower de Juan José",
  robots: { index: false, follow: false, nocache: true },
};

// Panel administrativo: siempre dinámico y sin caché.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-svh font-sans text-[1rem] text-pizarra-ink">
      <header className="border-b border-pizarra/15 bg-white/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <a href="/admin" className="text-lg font-bold text-pizarra">
            Invitaciones · Baby Shower de Juan José
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="min-h-[2.75rem] rounded-full px-4 text-sm font-semibold text-pizarra ring-1 ring-pizarra/40 hover:bg-cielo/60"
            >
              Salir
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
