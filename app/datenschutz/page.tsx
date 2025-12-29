export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-extrabold">Datenschutzerklärung</h1>

        <div className="mt-4 space-y-4 text-sm text-zinc-800">
          <section>
            <h2 className="text-sm font-extrabold">1. Verantwortlicher</h2>
            <p className="text-zinc-700">
              NAME / FIRMA, Straße Hausnr., PLZ Ort, Deutschland
              <br />
              E-Mail: hello@deinedomain.de
            </p>
          </section>

          <section>
            <h2 className="text-sm font-extrabold">2. Web-Analyse (Plausible)</h2>
            <p className="text-zinc-700">
              Wir nutzen Plausible Analytics zur Reichweitenmessung. Plausible verwendet
              keine Cookies und erstellt keine Nutzerprofile über Websites hinweg.
            </p>
            <p className="text-zinc-700">
              Zusätzlich können Ereignisse (z. B. „compare_toggled“, „preset_used“,
              „feedback_clicked“) erfasst werden, um die Nutzung der Funktionen zu
              verstehen.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-extrabold">3. LocalStorage</h2>
            <p className="text-zinc-700">
              Eingaben werden lokal im Browser gespeichert (LocalStorage), damit Werte beim
              nächsten Besuch erhalten bleiben. Diese Daten werden nicht an uns übertragen.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-extrabold">4. Feedback-Formular</h2>
            <p className="text-zinc-700">
              Beim Klick auf den Feedback-Link öffnet sich ein externes Formular (z. B.
              Tally). Es gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
