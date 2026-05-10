import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import GameCard, { GameCardSkeleton } from "@/components/GameCard";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Gamepad2, Sparkles, ChevronRight, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const searchParams = new URLSearchParams(useSearch());
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories = [] } = trpc.games.categories.useQuery();

  const { data: games = [], isLoading } = trpc.games.list.useQuery({
    search: debouncedSearch || undefined,
    category: activeCategory !== "Tous" ? activeCategory : undefined,
    limit: 48,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        showSearch={false}
        onSearchChange={setSearch}
        searchValue={search}
      />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 hero-gradient">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Sparkles className="h-3 w-3" />
              Jouez. Créez. Partagez.
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              La plateforme des{" "}
              <span className="gradient-text">jeux indépendants</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto">
              Découvrez des milliers de jeux créés par des développeurs passionnés.
              Jouez directement dans votre navigateur, sans installation.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!isAuthenticated ? (
                <>
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8">
                      <Gamepad2 className="h-5 w-5" />
                      Commencer à jouer
                    </Button>
                  </a>
                  <Link href="#games">
                    <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 hover:bg-primary/10 text-foreground gap-2">
                      Explorer les jeux
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/developer/upload">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8">
                      Publier mon jeu
                    </Button>
                  </Link>
                  <Link href="#games">
                    <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 hover:bg-primary/10 text-foreground gap-2">
                      Explorer les jeux
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-border/30">
              {[
                { label: "Jeux disponibles", value: games.length > 0 ? `${games.length}+` : "—" },
                { label: "Jouez en ligne", value: "100%" },
                { label: "Gratuit", value: "Toujours" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Games section */}
      <section id="games" className="py-12">
        <div className="container">
          {/* Search + filters */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Search bar */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un jeu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {activeCategory !== "Tous" ? activeCategory : "Tous les jeux"}
              {debouncedSearch && (
                <span className="text-muted-foreground font-normal text-base ml-2">
                  — "{debouncedSearch}"
                </span>
              )}
            </h2>
            {!isLoading && (
              <span className="text-sm text-muted-foreground">
                {games.length} jeu{games.length !== 1 ? "x" : ""}
              </span>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Gamepad2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun jeu trouvé</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {debouncedSearch
                  ? `Aucun résultat pour "${debouncedSearch}". Essayez d'autres mots-clés.`
                  : "Soyez le premier à publier un jeu dans cette catégorie !"}
              </p>
              {isAuthenticated && (
                <Link href="/developer/upload">
                  <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    Publier un jeu
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  id={game.id}
                  title={game.title}
                  description={game.description}
                  coverUrl={game.coverUrl}
                  category={game.category}
                  views={game.views}
                  downloads={game.downloads}
                  authorName={game.authorName}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold gradient-text">GameForge</span>
            </div>
            <p className="text-xs text-muted-foreground">
              La plateforme des créateurs de jeux indépendants
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
