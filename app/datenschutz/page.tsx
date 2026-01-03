export default function DatenschutzPage() {
  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold">Datenschutzerklärung</h1>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Verantwortlicher</h2>
          <p>Paras Singh</p>
          <p>Jablonskistraße 17</p>
          <p>Deutschland</p>
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
          <h2 className="text-xl font-semibold">Zweck der Website</h2>
          <p>
            Elavis ist ein webbasiertes Tool zur unverbindlichen Berechnung von
            Immobilienkennzahlen im Rahmen einer Testphase (MVP).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Webanalyse</h2>
          <p>
            Diese Website nutzt Plausible Analytics zur anonymen
            Reichweitenmessung. Plausible verwendet keine Cookies und erstellt
            keine personenbezogenen Nutzerprofile. Es werden ausschließlich
            aggregierte Nutzungsdaten verarbeitet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">LocalStorage</h2>
          <p>
            Eingegebene Daten werden ausschließlich lokal im Browser gespeichert
            (LocalStorage), um die Nutzung zu erleichtern. Diese Daten werden
            nicht an den Betreiber übertragen.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Feedback-Formular</h2>
          <p>
            Für Feedback nutzt Elavis ein externes Formular (Tally). Bei Nutzung
            gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
          </p>
        </section>
      </div>
    </main>
  );
}

