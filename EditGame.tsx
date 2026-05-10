import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Loader2,
  Save,
  Tag,
  X,
  Image as ImageIcon,
  FileCode,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GAME_CATEGORIES } from "../../../drizzle/schema";

async function uploadFile(endpoint: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(endpoint, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Upload failed");
  }
  return res.json();
}

export default function EditGame() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id ?? "0");
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: game, isLoading } = trpc.games.getById.useQuery({ id: gameId });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Autre");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [coverKey, setCoverKey] = useState<string | undefined>();
  const [coverUploading, setCoverUploading] = useState(false);
  const [newFileUrl, setNewFileUrl] = useState<string | undefined>();
  const [newFileKey, setNewFileKey] = useState<string | undefined>();
  const [newFileType, setNewFileType] = useState<string | undefined>();
  const [newPlayUrl, setNewPlayUrl] = useState<string | undefined>();
  const [fileUploading, setFileUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = trpc.games.update.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setDescription(game.description ?? "");
      setCategory(game.category);
      try { setTags(JSON.parse(game.tags ?? "[]")); } catch { setTags([]); }
      setCoverUrl(game.coverUrl ?? undefined);
      setCoverKey(game.coverKey ?? undefined);
    }
  }, [game]);

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    try {
      const result = await uploadFile("/api/upload/cover", file);
      setCoverUrl(result.url);
      setCoverKey(result.key);
      toast.success("Couverture mise à jour");
    } catch (err: any) {
      toast.error(err.message);
    }
    setCoverUploading(false);
  };

  const handleFileUpload = async (file: File) => {
    setFileUploading(true);
    try {
      const result = await uploadFile("/api/upload/game", file);
      setNewFileUrl(result.fileUrl);
      setNewFileKey(result.fileKey);
      setNewFileType(result.fileType);
      setNewPlayUrl(result.playUrl);
      toast.success("Fichier de jeu mis à jour");
    } catch (err: any) {
      toast.error(err.message);
    }
    setFileUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Le titre est requis"); return; }
    setSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: gameId,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        tags,
        coverUrl,
        coverKey,
        ...(newFileUrl ? { fileUrl: newFileUrl, fileKey: newFileKey, fileType: newFileType, playUrl: newPlayUrl } : {}),
      });
      await utils.games.myGames.invalidate();
      await utils.games.getById.invalidate({ id: gameId });
      toast.success("Jeu mis à jour !");
      navigate(`/game/${gameId}`);
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la mise à jour");
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showSearch={false} />
        <div className="container py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showSearch={false} />
        <div className="container py-24 text-center">
          <p className="text-muted-foreground">Jeu introuvable</p>
          <Link href="/developer/games">
            <Button variant="outline" className="mt-4 border-border text-foreground hover:bg-secondary">
              Retour
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar showSearch={false} />
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/developer/games">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Mes jeux
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-2xl font-bold text-foreground">Modifier le jeu</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Informations générales
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Titre *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={256}
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                >
                  {GAME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = tagInput.trim(); if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); } } }}
                    placeholder="Ajouter un tag..."
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => { const t = tagInput.trim(); if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); } }} className="border-border text-foreground hover:bg-secondary h-9">
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary border border-border text-xs text-foreground">
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-muted-foreground hover:text-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cover */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Image de couverture
              </h2>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
              {coverUrl ? (
                <div className="relative rounded-lg overflow-hidden aspect-video border border-border">
                  <img src={coverUrl} alt="Couverture" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => coverInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="h-8 w-8 text-white" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading} className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 flex items-center justify-center gap-3 group transition-all">
                  {coverUploading ? <Loader2 className="h-6 w-6 text-primary animate-spin" /> : <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                  <span className="text-sm text-muted-foreground">Changer la couverture</span>
                </button>
              )}
            </div>

            {/* Game file */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Fichier du jeu
              </h2>
              <input ref={fileInputRef} type="file" accept=".html,.htm,.zip" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />

              {/* Current file info */}
              {game.fileType && !newFileUrl && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Fichier actuel: <span className="font-medium uppercase">{game.fileType}</span></p>
                    {game.playUrl && <p className="text-xs text-muted-foreground">Jouable en ligne ✓</p>}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground h-8 gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    Remplacer
                  </Button>
                </div>
              )}

              {newFileUrl && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Nouveau fichier: <span className="font-medium uppercase">{newFileType}</span></p>
                    {newPlayUrl && <p className="text-xs text-muted-foreground">Jouable en ligne ✓</p>}
                  </div>
                  <button type="button" onClick={() => { setNewFileUrl(undefined); setNewFileKey(undefined); }} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {!game.fileType && !newFileUrl && (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={fileUploading} className="w-full p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 flex items-center justify-center gap-3 group transition-all">
                  {fileUploading ? <Loader2 className="h-6 w-6 text-primary animate-spin" /> : <FileCode className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                  <span className="text-sm text-muted-foreground">Uploader un fichier HTML ou ZIP</span>
                </button>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Link href="/developer/games" className="flex-1">
                <Button type="button" variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
