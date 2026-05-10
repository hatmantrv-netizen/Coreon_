import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Eye,
  Download,
  Edit,
  Trash2,
  Gamepad2,
  Loader2,
  BarChart3,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function getCategoryClass(category: string): string {
  const map: Record<string, string> = {
    Action: "badge-action", Puzzle: "badge-puzzle", RPG: "badge-rpg",
    Arcade: "badge-arcade", Aventure: "badge-aventure", Sport: "badge-sport",
    Plateforme: "badge-plateforme", Simulation: "badge-simulation", Autre: "badge-autre",
  };
  return map[category] ?? "badge-autre";
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function DeveloperGames() {
  const { isAuthenticated, loading } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: games = [], isLoading, refetch } = trpc.games.myGames.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.games.delete.useMutation({
    onSuccess: () => {
      toast.success("Jeu supprimé");
      refetch();
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(err.message ?? "Erreur lors de la suppression");
      setDeleteId(null);
    },
  });

  if (loading || isLoading) {
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
          <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Connexion requise</h2>
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
              Se connecter
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Stats totaux
  const totalViews = games.reduce((sum, g) => sum + g.views, 0);
  const totalDownloads = games.reduce((sum, g) => sum + g.downloads, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar showSearch={false} />

      <div className="container py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mes jeux</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez vos jeux publiés sur GameForge
              </p>
            </div>
            <Link href="/developer/upload">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                Nouveau jeu
              </Button>
            </Link>
          </div>

          {/* Global stats */}
          {games.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Jeux publiés", value: games.length, icon: Gamepad2 },
                { label: "Vues totales", value: totalViews.toLocaleString("fr-FR"), icon: Eye },
                { label: "Téléchargements", value: totalDownloads.toLocaleString("fr-FR"), icon: Download },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <stat.icon className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Games list */}
          {games.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun jeu publié</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Publiez votre premier jeu et partagez-le avec la communauté.
              </p>
              <Link href="/developer/upload">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" />
                  Publier mon premier jeu
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Jeu
                      </th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Catégorie
                      </th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Eye className="h-3.5 w-3.5 inline" />
                      </th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Download className="h-3.5 w-3.5 inline" />
                      </th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {games.map((game) => (
                      <tr key={game.id} className="hover:bg-secondary/30 transition-colors">
                        {/* Game info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                              {game.coverUrl ? (
                                <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Gamepad2 className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-48">{game.title}</p>
                              {game.fileType && (
                                <span className="text-xs text-muted-foreground uppercase">{game.fileType}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryClass(game.category)}`}>
                            {game.category}
                          </span>
                        </td>

                        {/* Views */}
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-foreground font-medium">
                            {game.views.toLocaleString("fr-FR")}
                          </span>
                        </td>

                        {/* Downloads */}
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-foreground font-medium">
                            {game.downloads.toLocaleString("fr-FR")}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{formatDate(game.createdAt)}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/game/${game.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Link href={`/developer/games/${game.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(game.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Supprimer ce jeu ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action est irréversible. Le jeu sera définitivement supprimé de la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-secondary">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
