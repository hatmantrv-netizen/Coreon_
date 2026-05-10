import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  Upload,
  Image as ImageIcon,
  FileCode,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Gamepad2,
} from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GAME_CATEGORIES } from "../../../drizzle/schema";

interface UploadState {
  uploading: boolean;
  progress: number;
  url?: string;
  key?: string;
  error?: string;
}

async function uploadFile(
  endpoint: string,
  file: File,
  onProgress?: (p: number) => void
): Promise<{ url: string; key?: string; fileUrl?: string; fileKey?: string; fileType?: string; playUrl?: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export default function UploadGame() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Autre");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [coverState, setCoverState] = useState<UploadState>({ uploading: false, progress: 0 });
  const [gameFileState, setGameFileState] = useState<UploadState & { fileType?: string; playUrl?: string; fileUrl?: string; fileKey?: string }>({ uploading: false, progress: 0 });
  const [screenshots, setScreenshots] = useState<Array<{ url: string; key?: string }>>([]);
  const [screenshotUploading, setScreenshotUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const gameFileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const createGame = trpc.games.create.useMutation();
  const addScreenshot = trpc.games.addScreenshot.useMutation();
  const utils = trpc.useUtils();

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    setCoverState({ uploading: true, progress: 0 });
    try {
      const result = await uploadFile("/api/upload/cover", file, (p) =>
        setCoverState((s) => ({ ...s, progress: p }))
      );
      setCoverState({ uploading: false, progress: 100, url: result.url, key: result.key });
      toast.success("Image de couverture uploadée !");
    } catch (err: any) {
      setCoverState({ uploading: false, progress: 0, error: err.message });
      toast.error(err.message ?? "Erreur lors de l'upload de la couverture");
    }
  };

  const handleGameFileUpload = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "html" && ext !== "htm" && ext !== "zip") {
      toast.error("Format non supporté. Utilisez HTML ou ZIP.");
      return;
    }
    setGameFileState({ uploading: true, progress: 0 });
    try {
      const result = await uploadFile("/api/upload/game", file, (p) =>
        setGameFileState((s) => ({ ...s, progress: p }))
      );
      setGameFileState({
        uploading: false,
        progress: 100,
        url: result.fileUrl,
        key: result.fileKey,
        fileType: result.fileType,
        playUrl: result.playUrl,
        fileUrl: result.fileUrl,
        fileKey: result.fileKey,
      });
      toast.success("Fichier de jeu uploadé !");
    } catch (err: any) {
      setGameFileState({ uploading: false, progress: 0, error: err.message });
      toast.error(err.message ?? "Erreur lors de l'upload du jeu");
    }
  };

  const handleScreenshotUpload = async (files: FileList) => {
    setScreenshotUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const result = await uploadFile("/api/upload/screenshot", file);
        setScreenshots((prev) => [...prev, { url: result.url, key: result.key }]);
      } catch (err: any) {
        toast.error(`Erreur screenshot: ${err.message}`);
      }
    }
    setScreenshotUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Le titre est requis"); return; }
    if (!gameFileState.url) { toast.error("Veuillez uploader le fichier du jeu"); return; }

    setSubmitting(true);
    try {
      const { id } = await createGame.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        coverUrl: coverState.url,
        coverKey: coverState.key,
        fileUrl: gameFileState.fileUrl,
        fileKey: gameFileState.fileKey,
        fileType: gameFileState.fileType,
        playUrl: gameFileState.playUrl,
        category,
        tags,
      });

      // Add screenshots
      for (const ss of screenshots) {
        await addScreenshot.mutateAsync({ gameId: id, url: ss.url, storageKey: ss.key });
      }

      await utils.games.list.invalidate();
      toast.success("Jeu publié avec succès !");
      navigate(`/game/${id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la publication");
      setSubmitting(false);
    }
  };

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
          <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Connexion requise</h2>
          <p className="text-muted-foreground mb-6">Connectez-vous pour publier vos jeux sur GameForge.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Se connecter
            </Button>
          </a>
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
            <h1 className="text-2xl font-bold text-foreground">Publier un jeu</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Informations générales
              </h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Titre du jeu <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mon super jeu"
                  maxLength={256}
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre jeu, les mécaniques, les contrôles..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Catégorie
                </label>
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

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tags <span className="text-muted-foreground text-xs">(max 10)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Ajouter un tag..."
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTag} className="border-border text-foreground hover:bg-secondary h-9">
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

            {/* Cover image */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Image de couverture
              </h2>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
              />

              {coverState.url ? (
                <div className="relative rounded-lg overflow-hidden aspect-video border border-border">
                  <img src={coverState.url} alt="Couverture" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverState({ uploading: false, progress: 0 })}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverState.uploading}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 hover:bg-secondary transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  {coverState.uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <span className="text-sm text-muted-foreground">{coverState.progress}%</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Cliquez pour uploader</p>
                        <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WebP — Recommandé: 16:9</p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Game file */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Fichier du jeu <span className="text-destructive">*</span>
              </h2>

              <input
                ref={gameFileInputRef}
                type="file"
                accept=".html,.htm,.zip"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleGameFileUpload(e.target.files[0])}
              />

              {gameFileState.url ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary border border-border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Fichier uploadé</p>
                    <p className="text-xs text-muted-foreground">
                      Format: {gameFileState.fileType?.toUpperCase()} •{" "}
                      {gameFileState.playUrl ? "Jouable en ligne ✓" : "Téléchargement uniquement"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGameFileState({ uploading: false, progress: 0 })}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : gameFileState.error ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{gameFileState.error}</p>
                  <button type="button" onClick={() => setGameFileState({ uploading: false, progress: 0 })} className="ml-auto">
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => gameFileInputRef.current?.click()}
                  disabled={gameFileState.uploading}
                  className="w-full p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 hover:bg-secondary transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  {gameFileState.uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Upload en cours...</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{gameFileState.progress}%</p>
                        <div className="w-48 h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${gameFileState.progress}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <FileCode className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Cliquez pour uploader votre jeu</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          HTML / ZIP (max 200 MB)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Les fichiers HTML et ZIP avec index.html sont jouables en ligne
                        </p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Screenshots */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Captures d'écran <span className="text-muted-foreground text-xs font-normal">(optionnel)</span>
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => screenshotInputRef.current?.click()}
                  disabled={screenshotUploading}
                  className="border-border text-foreground hover:bg-secondary gap-1.5 h-8"
                >
                  {screenshotUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Ajouter
                </Button>
              </div>

              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleScreenshotUpload(e.target.files)}
              />

              {screenshots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {screenshots.map((ss, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                      <img src={ss.url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setScreenshots(screenshots.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune capture d'écran ajoutée
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Link href="/developer/games" className="flex-1">
                <Button type="button" variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting || !title.trim() || !gameFileState.url}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Publier le jeu
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
