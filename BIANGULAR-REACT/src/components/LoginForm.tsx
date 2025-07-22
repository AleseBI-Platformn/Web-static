import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Bienvenido a ALESE CORP");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-corporate border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/alese-logo.png" 
                alt="ALESE CORP Logo" 
                className="h-16 w-auto filter drop-shadow-md"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-primary">
                ALESE
              </h1>
              <h2 className="text-xl font-semibold text-primary/80">
                CORPORATIVO
              </h2>
              <p className="text-lg font-medium text-foreground">
                Portal Empresarial
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Ingresa a tu cuenta corporativa
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Corporativo
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@alese.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-border/50 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-border/50 focus:border-primary transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">Recordar sesión</span>
                </label>
                <a href="#" className="text-primary hover:text-primary-hover font-medium">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-medium transition-all duration-200 shadow-lg hover:shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="text-center space-y-2 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                © 2024 ALESE CORP - Sistema Corporativo Perú
              </p>
              <p className="text-xs text-muted-foreground">
                Todos los derechos reservados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
