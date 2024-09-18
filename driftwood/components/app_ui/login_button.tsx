import type React from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  onLoginSuccess: (hasToken: boolean) => void;
  onLoginFailure: (error: unknown) => void;
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
      <Button onClick={handleLogin} className="flex flex-row gap-4 text-xl p-6">
        <LogIn/>
      </Button>
    </div>
  );
};

export default LoginButton;
