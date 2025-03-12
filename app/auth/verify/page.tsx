export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900">Verifica tu correo electrónico</h2>
        <p className="text-gray-600">
          Hemos enviado un enlace de verificación a tu correo electrónico.
        </p>
        <p className="text-gray-600">
          Haz clic en el enlace del correo para completar el proceso de inicio de sesión.
        </p>
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            Si no encuentras el correo, revisa tu carpeta de spam o solicita otro enlace.
          </p>
        </div>
      </div>
    </div>
  );
} 