import "./globals.css";
import Script from "next/script";
import PlausiblePageview from "./PlausiblePageview";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <Script
          defer
          data-domain="investment-calculator-koeds13lt-paras-singhs-projects-f072a0f0.vercel.app/"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>

      <body>
        <PlausiblePageview />

        {children}

        <footer className="mt-10 border-t border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-zinc-700 md:flex-row md:items-center md:justify-between">
            <div className="font-semibold text-zinc-800">
              Hinweis: Keine Steuer-/Rechts-/Finanzberatung. Angaben ohne Gewähr.
            </div>
            <div className="flex gap-4 font-semibold">
              <a className="underline underline-offset-4" href="/impressum">
                Impressum
              </a>
              <a className="underline underline-offset-4" href="/datenschutz">
                Datenschutz
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
