import { useState } from "react";
import AuthPage from "@/components/AuthPage";
import HomePage from "@/components/HomePage";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return <HomePage />;
};

export default Index;
