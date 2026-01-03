export default function ImpressumPage() {
  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold">Impressum</h1>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
          <p>Paras Singh</p>
          <p>Jablonskistraße 17</p>
          <p>Deutschland</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Kontakt</h2>
          <p>
            E-Mail:{" "}
            <a
              href="mailto:paras_8@icloud.com"
              className="underline hover:opacity-80"
            >
              paras_8@icloud.com
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Produkt</h2>
          <p>Elavis – Objektbezogene Immobilienanalyse (MVP)</p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-xl font-semibold text-white">Hinweis</h2>
          <p>
            Elavis befindet sich in einer Testphase. Die bereitgestellten
            Informationen stellen keine Steuer-, Rechts- oder Finanzberatung dar.
            Alle Angaben ohne Gewähr.
          </p>
        </section>
      </div>
    </main>
  );
}
