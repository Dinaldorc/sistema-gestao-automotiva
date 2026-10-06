"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function SenhaForm() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSucesso(false);

    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);

    if (error) {
      setErro("Não foi possível trocar a senha. Tente novamente.");
      return;
    }

    setSenha("");
    setConfirmacao("");
    setSucesso(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="senha-nova" className="mb-1.5 block text-sm text-muted">
          Nova senha
        </label>
        <input
          id="senha-nova"
          type="password"
          required
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="senha-confirmacao" className="mb-1.5 block text-sm text-muted">
          Confirmar nova senha
        </label>
        <input
          id="senha-confirmacao"
          type="password"
          required
          minLength={6}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="••••••••"
        />
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {sucesso && <p className="text-sm text-accent-2">Senha atualizada.</p>}

      <button
        type="submit"
        disabled={carregando}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface-2 hover:opacity-90 disabled:opacity-50"
      >
        {carregando ? "Salvando..." : "Trocar senha"}
      </button>
    </form>
  );
}
