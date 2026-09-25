import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="text-3xl font-bold tracking-tight text-slate-950">
              MAX <span className="font-normal text-blue-600">ERP</span>
            </div>

            <div className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Enterprise Platform
            </div>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Sign in to MAX ERP
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in securely using your MAX ERP identity.
              </p>
            </div>

            <form
              action={async () => {
                "use server";

                await signIn("max-erp", {
                  redirectTo: "/",
                });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Continue with MAX ERP
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3 5 6v5c0 4.8 2.9 8.7 7 10 4.1-1.3 7-5.2 7-10V6l-7-3Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Secure authentication
                  </div>

                  <div className="mt-1 text-xs leading-5 text-slate-600">
                    Authentication is handled by MAX Identity using
                    OAuth 2.0 and OpenID Connect.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            MAX ERP Enterprise Platform
          </div>
        </div>
      </div>
    </main>
  );
}