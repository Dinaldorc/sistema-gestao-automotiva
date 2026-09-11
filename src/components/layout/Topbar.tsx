import { Bell, ChevronDown } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export function Topbar({
  title,
  userName = "Usuário",
  userRole = "Vendedor",
}: {
  title: string;
  userName?: string;
  userRole?: string;
}) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface-2 px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-muted hover:text-foreground">
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-surface-2">
            3
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
            {initial}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted capitalize">{userRole}</p>
          </div>
          <ChevronDown size={16} className="text-muted" />
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
