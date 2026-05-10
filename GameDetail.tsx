import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  Play,
  Download,
  Eye,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Gamepad2,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function getCategoryClass(category: string): string {
  const map: Record<string, string> = {
    Action: "badge-action",
    Puzzle: "badge-puzzle",
    RPG: "badge-rpg",
    Arcade: "badge-arcade",
    Aventure: "badge-aventure",
    Sport: "badge-sport",
    Plateforme: "badge-plateforme",
    Simulation: "badge-simulation",
    Autre: "badge-autre",
  };
  return map[category] ?? "badge-autre";
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id ?? "0");
  const { isAuthenticated } = useAuth();
  const [screenshotIdx, setScreenshotIdx] = useState(0);

  const { data: game, isLoading, error } = trpc.games.getById.useQuery({ id: gameId });

  const downloadMutation = trpc.games.download.useMutation({
    onSuccess: (data) => {
      // Trigger browser download
      const a = document.createElement("a");
      a.href = data.fileUrl;
      a.download = data.fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Téléchargement démarré !");
    },
    onError: (err) => {
      toast.error(err.message ?? "Erreur lors du téléchargement");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="skeleton h-8 w-48 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="skeleton aspect-video rounded-xl" />
                <div className="skeleton h-6 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
              </div>
              <div className="space-y-4">
                <div className="skeleton h-48 rounded-xl" />
                <div className="skeleton h-12 rounded-lg" />
                <div className="skeleton h-12 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Jeu introuvable</h2>
          <p className="text-muted-foreground mb-6">Ce jeu n'existe pas ou a été supprimé.</p>
          <Link href="/">
            <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tags: string[] = (() => {
    try { return JSON.parse(game.tags ?? "[]"); } catch { return []; }
  })();

  const screenshots = game.screenshots ?? [];
  const allImages = [
    ...(game.coverUrl ? [game.coverUrl] : []),
    ...screenshots.map((s) => s.url),
  ];

  const canPlay = !!game.playUrl;
  const canDownload = !!game.fileUrl;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryClass(game.category)}`}>
              {game.category}
            </span>
            <span>/</span>
            <span className="text-foreground truncate max-w-48">{game.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: media + info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main image / screenshot carousel */}
              {allImages.length > 0 ? (
                <div className="relative rounded-xl overflow-hidden border border-border bg-secondary aspect-video">
                  <img
                    src={allImages[screenshotIdx]}
                    alt={`${game.title} - capture ${screenshotIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setScreenshotIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setScreenshotIdx((i) => (i + 1) % allImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setScreenshotIdx(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === screenshotIdx ? "bg-primary w-4" : "bg-foreground/40 hover:bg-foreground/60"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-secondary aspect-video flex items-center justify-center">
                  <Gamepad2 className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setScreenshotIdx(i)}
                      className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === screenshotIdx ? "border-primary" : "border-border hover:border-border/80"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title + meta */}
              <div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h1 className="text-3xl font-bold text-foreground leading-tight">{game.title}</h1>
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-medium shrink-0 ${getCategoryClass(game.category)}`}>
                    {game.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {game.author && (
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {game.author.name ?? "Développeur"}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    {game.views.toLocaleString("fr-FR")} vues
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    {game.downloads.toLocaleString("fr-FR")} téléchargements
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(game.createdAt)}
                  </span>
                </div>
              </div>

              {/* Description */}
              {game.description && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Description
                  </h2>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-sm">
                    {game.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs bg-secondary border border-border text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: action panel */}
            <div className="space-y-4">
              {/* Action card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 sticky top-24">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider text-muted-foreground">
                  Actions
                </h3>

                {/* Play online */}
                {canPlay ? (
                  <Link href={`/game/${game.id}/play`} className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11 text-base font-semibold">
                      <Play className="h-5 w-5 fill-current" />
                      Jouer en ligne
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full gap-2 h-11 text-base font-semibold opacity-50">
                    <Play className="h-5 w-5" />
                    Jouer en ligne
                  </Button>
                )}

                {/* Download */}
                {canDownload ? (
                  isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full gap-2 h-11 text-base font-semibold border-border/60 hover:border-primary/50 hover:bg-primary/10 text-foreground"
                      onClick={() => downloadMutation.mutate({ id: game.id })}
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="h-5 w-5" />
                      {downloadMutation.isPending ? "Préparation..." : "Télécharger"}
                    </Button>
                  ) : (
                    <a href={getLoginUrl()}>
                      <Button
                        variant="outline"
                        className="w-full gap-2 h-11 text-base font-semibold border-border/60 hover:border-primary/50 hover:bg-primary/10 text-foreground"
                      >
                        <Lock className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </a>
                  )
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full gap-2 h-11 text-base font-semibold opacity-50 border-border text-foreground"
                  >
                    <Download className="h-5 w-5" />
                    Télécharger
                  </Button>
                )}

                {!isAuthenticated && canDownload && (
                  <p className="text-xs text-muted-foreground text-center">
                    Connectez-vous pour télécharger ce jeu
                  </p>
                )}

                {/* Divider */}
                <div className="border-t border-border/50 pt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Catégorie</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryClass(game.category)}`}>
                      {game.category}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Format</span>
                    <span className="text-foreground uppercase font-medium">{game.fileType ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Vues</span>
                    <span className="text-foreground">{game.views.toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Téléchargements</span>
                    <span className="text-foreground">{game.downloads.toLocaleString("fr-FR")}</span>
                  </div>
                </div>
              </div>

              {/* Back link */}
              <Link href="/">
                <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux jeux
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
