import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <h1 className="font-serif italic text-3xl tracking-tight">
            Satellite
          </h1>
          <p className="mt-1 text-xs text-txt-3">CleanTech GrowthLab</p>
        </div>

        <div className="border border-line rounded-xl p-8 bg-panel">
          <p className="text-sm text-txt-2 mb-6">Sign in to your portal</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
