export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 text-zinc-900">
      <h1 className="text-2xl font-bold mb-4">Datenschutzerklärung</h1>

      <p className="mb-4">
        <strong>Verantwortlicher:</strong>
        <br />
        Paras Singh <br />
        Jablonskistraße 17 <br />
        Deutschland <br />
        E-Mail: paras_8@icloud.com
      </p>

      <p className="mb-4">
        <strong>Zweck der Website</strong>
        <br />
        Elavis ist ein webbasiertes Tool zur unverbindlichen Berechnung
        von Immobilienkennzahlen im Rahmen einer Testphase (MVP).
      </p>

      <p className="mb-4">
        <strong>Webanalyse</strong>
        <br />
        Diese Website nutzt Plausible Analytics zur anonymen Reichweitenmessung.
        Plausible verwendet keine Cookies und erstellt keine personenbezogenen
        Nutzerprofile. Es werden ausschließlich aggregierte Nutzungsdaten verarbeitet.
      </p>

      <p className="mb-4">
        <strong>LocalStorage</strong>
        <br />
        Eingegebene Daten werden ausschließlich lokal im Browser gespeichert
        (LocalStorage), um die Nutzung zu erleichtern.
        Diese Daten werden nicht an den Betreiber übertragen.
      </p>

      <p className="mb-4">
        <strong>Feedback-Formular</strong>
        <br />
        Für Feedback nutzt Elavis ein externes Formular (Tally).
        Bei Nutzung gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
      </p>
    </main>
  );
}

