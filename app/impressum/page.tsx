export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-extrabold">Impressum</h1>

        <div className="mt-4 space-y-4 text-sm text-zinc-800">
          <p className="text-zinc-700">Angaben gemäß § 5 TMG / § 18 Abs. 2 MStV.</p>

          <section>
            <h2 className="text-sm font-extrabold">Diensteanbieter</h2>
            <p>
              <strong>NAME / FIRMA</strong>
              <br />
              Straße Hausnr.
              <br />
              PLZ Ort
              <br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-sm font-extrabold">Kontakt</h2>
            <p>E-Mail: hello@deinedomain.de</p>
          </section>

          <section>
            <h2 className="text-sm font-extrabold">Haftungsausschluss</h2>
            <p className="text-zinc-700">
              Keine Steuer-/Rechts-/Finanzberatung. Angaben ohne Gewähr.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
