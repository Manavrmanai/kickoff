import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import DashboardNew from "./pages/DashboardNew";
import LeaguesNew from "./pages/LeaguesNew";
import LeagueDetail from "./pages/LeagueDetail";
import TeamDetail from "./pages/TeamDetail.tsx";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail.tsx";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail.tsx";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Main Dashboard */}
            <Route path="/" element={<DashboardNew />} />
            
            {/* Leagues Routes */}
            <Route path="/leagues" element={<LeaguesNew />} />
            <Route path="/leagues/:id" element={<LeagueDetail />} />
            
            {/* Teams Routes */}
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            
            {/* Players Routes */}
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            
            {/* Matches Routes */}
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            
            {/* Statistics */}
            <Route path="/statistics" element={<Statistics />} />
            
            {/* Legacy/Redirect Routes */}
            
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
