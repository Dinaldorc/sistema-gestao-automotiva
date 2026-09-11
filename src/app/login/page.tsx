import { Car } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
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

        <LoginForm />
      </div>
    </main>
  );
}
