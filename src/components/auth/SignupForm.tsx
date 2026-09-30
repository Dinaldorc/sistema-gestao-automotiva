"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setMensagem(null);
    setCarregando(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });

    setCarregando(false);

    if (error) {
      setErro(
        error.message.includes("already registered") || error.message.includes("already exists")
          ? "Esse e-mail já tem uma conta. Faça login."
          : "Não foi possível criar a conta. Tente novamente.",
      );
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setMensagem("Conta criada! Verifique seu e-mail para confirmar antes de entrar.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="mb-1.5 block text-sm text-muted">
          Nome
        </label>
        <input
          id="nome"
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="Seu nome completo"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="voce@empresa.com"
        />
      </div>

      <div>
        <label htmlFor="senha" className="mb-1.5 block text-sm text-muted">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="••••••••"
        />
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {mensagem && <p className="text-sm text-accent-2">{mensagem}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface-2 hover:opacity-90 disabled:opacity-50"
      >
        {carregando ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
