import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Meals from "./pages/Meals";
import Chatbot from "./pages/Chatbot";
import Premium from "./pages/Premium";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/workouts" element={<Layout><Workouts /></Layout>} />
            <Route path="/meals" element={<Layout><Meals /></Layout>} />
            <Route path="/chatbot" element={<Layout><Chatbot /></Layout>} />
            <Route path="/premium" element={<Layout><Premium /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
