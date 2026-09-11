"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  Wallet,
  Users,
  UserRound,
  BarChart3,
  Settings,
  LifeBuoy,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/veiculos", label: "Veículos", icon: Car },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/vendedores", label: "Vendedores", icon: UserRound },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface-2">
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Car size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Campos</p>
          <p className="text-[10px] uppercase tracking-wide text-muted">Tecnologia</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground">
          <LifeBuoy size={18} />
          Suporte
        </button>
      </div>
    </aside>
  );
}
