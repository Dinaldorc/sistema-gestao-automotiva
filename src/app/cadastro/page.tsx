import Link from "next/link";
import { Car } from "lucide-react";
import { SignupForm } from "@/components/auth/SignupForm";

export default function CadastroPage() {
  return (
    <main className="flex min-h-screen w-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Car size={22} />
          </div>
          <h1 className="text-lg font-semibold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted">Sistema de Gestão Automotiva</p>
        </div>

        <SignupForm />

        <p className="mt-4 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
