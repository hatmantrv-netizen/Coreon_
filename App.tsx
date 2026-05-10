import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GameDetail from "./pages/GameDetail";
import GamePlayer from "./pages/GamePlayer";
import UploadGame from "./pages/UploadGame";
import DeveloperGames from "./pages/DeveloperGames";
import EditGame from "./pages/EditGame";
import Profile from "./pages/Profile";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/game/:id" component={GameDetail} />
      <Route path="/game/:id/play" component={GamePlayer} />

      {/* Developer */}
      <Route path="/developer/upload" component={UploadGame} />
      <Route path="/developer/games" component={DeveloperGames} />
      <Route path="/developer/games/:id/edit" component={EditGame} />

      {/* User */}
      <Route path="/profile" component={Profile} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
