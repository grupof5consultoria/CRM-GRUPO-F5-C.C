export const metadata = { title: "Recuperar Senha | Sistema de Gestão" };

export default function RecoverPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="text-sm text-gray-500 mt-1">
            Informe seu e-mail para receber as instruções
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <p className="text-sm text-gray-500 text-center">
            Funcionalidade será implementada em breve.
          </p>
          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              Voltar ao login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
