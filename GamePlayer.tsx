import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Gamepad2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";

export default function GamePlayer() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id ?? "0");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: game, isLoading, error } = trpc.games.getById.useQuery({ id: gameId });

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const reload = useCallback(() => {
    setIframeKey((k) => k + 1);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showSearch={false} />
        <div className="container py-12 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
              <Gamepad2 className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Chargement du jeu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showSearch={false} />
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

  if (!game.playUrl) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showSearch={false} />
        <div className="container py-24 text-center">
          <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Jeu non disponible en ligne</h2>
          <p className="text-muted-foreground mb-6">
            Ce jeu n'est pas disponible pour jouer en ligne. Vous pouvez le télécharger.
          </p>
          <Link href={`/game/${gameId}`}>
            <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour à la page du jeu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container">
          <div className="flex h-14 items-center gap-3">
            <Link href={`/game/${gameId}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground h-8">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{game.title}</span>
              </Button>
            </Link>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                <Gamepad2 className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground truncate">{game.title}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">— Jouer en ligne</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={reload}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                title="Recharger"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <a href={game.playUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Game iframe */}
      <div className="flex-1 flex flex-col">
        <div
          ref={containerRef}
          className="flex-1 relative bg-black"
          style={{ minHeight: "calc(100vh - 3.5rem - 1px)" }}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={game.playUrl}
            title={game.title}
            className="w-full h-full absolute inset-0"
            style={{ border: "none", minHeight: "calc(100vh - 3.5rem - 1px)" }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals"
            allow="autoplay; fullscreen; gamepad"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
