import { Eye, Download, Gamepad2 } from "lucide-react";
import { Link } from "wouter";

interface GameCardProps {
  id: number;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  category: string;
  views: number;
  downloads: number;
  authorName?: string | null;
  createdAt?: Date | string;
}

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

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function GameCard({
  id,
  title,
  description,
  coverUrl,
  category,
  views,
  downloads,
  authorName,
}: GameCardProps) {
  return (
    <Link href={`/game/${id}`} className="block group">
      <article className="game-card-glow rounded-xl border border-border bg-card overflow-hidden cursor-pointer">
        {/* Cover image */}
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gamepad2 className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {/* Category badge overlay */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getCategoryClass(category)}`}>
              {category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {authorName && (
            <p className="text-xs text-muted-foreground mt-1">{authorName}</p>
          )}

          {description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {formatNumber(views)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="h-3 w-3" />
              {formatNumber(downloads)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Skeleton loader for GameCard
export function GameCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="aspect-video skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded mt-2" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="flex gap-3 mt-3 pt-3 border-t border-border/50">
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}
