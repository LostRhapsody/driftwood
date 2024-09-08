/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  onLoginSuccess: (hasToken: boolean) => void;
  onLoginFailure: (error: any) => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  onLoginSuccess,
  onLoginFailure,
}) => {
  const handleLogin = async () => {
    try {
      const response = await invoke<boolean>("netlify_login");
      console.log("Login successful:", response);
      onLoginSuccess(response);
    } catch (error) {
      console.error("Login failed:", error);
      onLoginFailure(error);
    }
  };

  return (
    <div className="flex flex-row gap-8">
      <Button onClick={handleLogin} className="flex flex-row gap-4">
        <LogIn/> Log In
      </Button>
    </div>
  );
};

export default LoginButton;
