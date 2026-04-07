import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Login | Sistema de Gestão" };

export default function LoginPage() {
  return <LoginForm title="Acesso Interno" subtitle="Área restrita à equipe" />;
}
