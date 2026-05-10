# GameForge - TODO

## Backend & Base de données
- [x] Schéma DB : table `games` (id, title, description, coverUrl, fileKey, fileUrl, tags, category, authorId, views, downloads, createdAt, updatedAt)
- [x] Schéma DB : table `screenshots` (id, gameId, url, key)
- [x] Schéma DB : table `user_downloads` (id, userId, gameId, downloadedAt)
- [x] Migration SQL appliquée via webdev_execute_sql
- [x] Helper db.ts : getGames, getGameById, createGame, updateGame, deleteGame, incrementViews, incrementDownloads
- [x] Procédure tRPC : games.list (public, filtres catégorie + recherche)
- [x] Procédure tRPC : games.getById (public, incrémente vues)
- [x] Procédure tRPC : games.create (protégé, upload fichier + cover)
- [x] Procédure tRPC : games.update (protégé, auteur seulement)
- [x] Procédure tRPC : games.delete (protégé, auteur seulement)
- [x] Procédure tRPC : games.download (protégé, enregistre téléchargement)
- [x] Procédure tRPC : games.myGames (protégé, jeux du développeur)
- [x] Procédure tRPC : games.myDownloads (protégé, jeux téléchargés)
- [x] Procédure tRPC : games.stats (protégé, stats par jeu)
- [x] Upload de fichiers via endpoint Express multipart (cover + fichier jeu + screenshots)

## Interface publique
- [x] Page d'accueil avec hero section et grille de jeux
- [x] Barre de recherche fonctionnelle
- [x] Filtres par catégorie (Action, Puzzle, RPG, Arcade, Aventure, Sport, Autre)
- [x] Carte de jeu (GameCard) avec cover, titre, auteur, catégorie
- [x] Page détail d'un jeu (/game/:id)
- [x] Bouton "Jouer en ligne" sur la page détail
- [x] Bouton "Télécharger" sur la page détail (réservé aux connectés)
- [x] Affichage des captures d'écran sur la page détail
- [x] Navigation principale avec logo, recherche, liens auth

## Lecteur de jeux en ligne
- [x] Page lecteur (/game/:id/play)
- [x] iframe sandbox avec allow-scripts allow-same-origin
- [x] Support fichiers HTML5 single-file et ZIP (extraction côté serveur)
- [x] Bouton plein écran dans le lecteur
- [x] Bouton retour vers la page détail

## Espace développeur
- [x] Page upload de jeu (/developer/upload)
- [x] Formulaire : titre, description, catégorie, tags, cover, fichier jeu, screenshots
- [x] Page gestion des jeux (/developer/games)
- [x] Tableau des jeux avec vues, téléchargements, actions
- [x] Page modification d'un jeu (/developer/games/:id/edit)
- [x] Suppression d'un jeu avec confirmation
- [x] Statistiques par jeu (vues, téléchargements)

## Page profil utilisateur
- [x] Page profil (/profile)
- [x] Bibliothèque des jeux uploadés
- [x] Bibliothèque des jeux téléchargés
- [x] Avatar et informations utilisateur

## Design & UX
- [x] Thème sombre élégant (dark theme) avec palette soignée
- [x] Typographie premium (Google Fonts)
- [x] Animations et transitions fluides
- [x] États de chargement (skeletons)
- [x] États vides et messages d'erreur
- [x] Design responsive (mobile-first)
- [x] Navigation cohérente sur toutes les pages

## Tests
- [x] Tests vitest pour les procédures backend principales (11 tests passés)
