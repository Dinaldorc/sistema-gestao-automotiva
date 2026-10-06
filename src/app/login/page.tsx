import Link from "next/link";
import { Car } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-screen w-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Car size={22} />
          </div>
          <h1 className="text-lg font-semibold">Sistema de Gestão Automotiva</h1>
          <p className="mt-1 text-sm text-muted">por Campos Tecnologia</p>
        </div>

        {erro === "inativo" && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            Sua conta foi desativada. Fale com o administrador da sua revendedora.
          </p>
        )}

        <LoginForm />

        <p className="mt-4 text-center text-sm text-muted">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-accent hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
