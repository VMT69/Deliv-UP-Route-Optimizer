
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const LOCAL_KEY = "deliup_demo_user";

// Hardcoded credentials for demo
const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "password";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // If already logged in, redirect
  React.useEffect(() => {
    const user = localStorage.getItem(LOCAL_KEY);
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check credentials against hardcoded values
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      // Save credentials in localStorage (not secure, for demo only)
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ username, password })
      );
      setError(""); // Clear error if any
      navigate("/");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm animate-fade-in shadow-lg">
        <CardContent>
          <CardTitle className="mb-4 text-center">Login</CardTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <Input
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Use <span className="font-mono text-foreground">demo</span> / <span className="font-mono text-foreground">password</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

