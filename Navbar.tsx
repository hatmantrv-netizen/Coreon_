import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Gamepad2, Search, Upload, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface NavbarProps {
  onSearchChange?: (q: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

export default function Navbar({ onSearchChange, searchValue = "", showSearch = true }: NavbarProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Déconnecté avec succès");
      navigate("/");
      window.location.reload();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) onSearchChange(localSearch);
    else navigate(`/?search=${encodeURIComponent(localSearch)}`);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <div className="container">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 group-hover:bg-primary/30 transition-colors">
              <Gamepad2 className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight gradient-text hidden sm:block">
              GameForge
            </span>
          </Link>

          {/* Search bar */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher un jeu..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
              </div>
            </form>
          )}

          <div className="flex-1 md:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href="/developer/upload">
                      <Button variant="outline" size="sm" className="gap-1.5 border-border/60 hover:border-primary/50 hover:bg-primary/10 text-foreground">
                        <Upload className="h-3.5 w-3.5" />
                        Publier
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary transition-colors">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground hidden lg:block">{user?.name ?? "Profil"}</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" />
                            Mon profil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/developer/games" className="flex items-center gap-2 cursor-pointer">
                            <LayoutDashboard className="h-4 w-4" />
                            Mes jeux
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                          onClick={() => logout.mutate()}
                          className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Déconnexion
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <a href={getLoginUrl()}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Se connecter
                      </Button>
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border/50 mt-0 pt-3 space-y-3">
            {showSearch && (
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher un jeu..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </form>
            )}
            {!loading && (
              isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground transition-colors">
                    <User className="h-4 w-4" /> Mon profil
                  </Link>
                  <Link href="/developer/games" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground transition-colors">
                    <LayoutDashboard className="h-4 w-4" /> Mes jeux
                  </Link>
                  <Link href="/developer/upload" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground transition-colors">
                    <Upload className="h-4 w-4" /> Publier un jeu
                  </Link>
                  <button onClick={() => logout.mutate()} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-destructive transition-colors">
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </div>
              ) : (
                <a href={getLoginUrl()} className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    Se connecter
                  </Button>
                </a>
              )
            )}
          </div>
        )}
      </div>
    </header>
  );
}
