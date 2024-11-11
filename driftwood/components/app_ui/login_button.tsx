import type React from "react";
import { type DriftResponse, processResponse } from "@/types/response";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  onLoginSuccess: (hasToken: boolean) => void;
  onLoginFailure: (error: string) => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  onLoginSuccess,
  onLoginFailure,
}) => {
  const handleLogin = async () => {
      const response = await invoke<DriftResponse>("netlify_login");
      const success = processResponse(response);
      success ? onLoginSuccess(success) : onLoginFailure(response.message);
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
