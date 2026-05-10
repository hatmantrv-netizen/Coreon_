import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import GameCard from "@/components/GameCard";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  User,
  Gamepad2,
  Download,
  Upload,
  Calendar,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Tab = "published" | "downloads";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("published");

  const { data: myGames = [], isLoading: gamesLoading } = trpc.games.myGames.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myDownloads = [], isLoading: downloadsLoading } = trpc.games.myDownloads.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showSearch={false} />
        <div className="container py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showSearch={false} />
        <div className="container py-24 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Connexion requise</h2>
          <p className="text-muted-foreground mb-6">Connectez-vous pour accéder à votre profil.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Se connecter
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const totalViews = myGames.reduce((sum, g) => sum + g.views, 0);
  const totalDownloads = myGames.reduce((sum, g) => sum + g.downloads, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar showSearch={false} />

      <div className="container py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile header */}
          <div className="rounded-xl border border-border bg-card p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">{user?.name ?? "Utilisateur"}</h1>
                {user?.email && (
                  <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Membre depuis {new Date(user?.createdAt ?? Date.now()).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </div>
              </div>

              <Link href="/developer/upload">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shrink-0" size="sm">
                  <Upload className="h-3.5 w-3.5" />
                  Publier un jeu
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
              {[
                { label: "Jeux publiés", value: myGames.length, icon: Gamepad2 },
                { label: "Jeux téléchargés", value: myDownloads.length, icon: Download },
                { label: "Vues totales", value: totalViews.toLocaleString("fr-FR"), icon: User },
                { label: "Téléchargements reçus", value: totalDownloads.toLocaleString("fr-FR"), icon: Download },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-secondary border border-border mb-6 w-fit">
            {[
              { id: "published" as Tab, label: "Jeux publiés", icon: Gamepad2, count: myGames.length },
              { id: "downloads" as Tab, label: "Téléchargements", icon: Download, count: myDownloads.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? "bg-primary/20 text-primary" : "bg-border text-muted-foreground"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Published games */}
          {activeTab === "published" && (
            <>
              {gamesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : myGames.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-16 text-center">
                  <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Aucun jeu publié</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Partagez vos créations avec la communauté GameForge.
                  </p>
                  <Link href="/developer/upload">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" size="sm">
                      <Upload className="h-3.5 w-3.5" />
                      Publier mon premier jeu
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {myGames.map((game) => (
                    <GameCard
                      key={game.id}
                      id={game.id}
                      title={game.title}
                      description={game.description}
                      coverUrl={game.coverUrl}
                      category={game.category}
                      views={game.views}
                      downloads={game.downloads}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Downloaded games */}
          {activeTab === "downloads" && (
            <>
              {downloadsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : myDownloads.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-16 text-center">
                  <Download className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Aucun téléchargement</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Téléchargez des jeux depuis la page de détail pour les retrouver ici.
                  </p>
                  <Link href="/">
                    <Button variant="outline" className="border-border text-foreground hover:bg-secondary gap-2" size="sm">
                      <Gamepad2 className="h-3.5 w-3.5" />
                      Explorer les jeux
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {myDownloads.map(({ game, downloadedAt }) => (
                    <div key={game.id} className="relative">
                      <GameCard
                        id={game.id}
                        title={game.title}
                        description={game.description}
                        coverUrl={game.coverUrl}
                        category={game.category}
                        views={game.views}
                        downloads={game.downloads}
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-md text-xs bg-background/80 border border-border text-muted-foreground">
                          {new Date(downloadedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
