export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 text-zinc-900">
      <h1 className="text-2xl font-bold">Impressum</h1>

      <h2 className="mt-6 text-lg font-semibold">Angaben gemäß § 5 TMG</h2>
      <p className="mt-2 leading-7">
        Paras Singh <br />
        Jablonskistraße 17 <br />
        Deutschland
      </p>

      <h2 className="mt-6 text-lg font-semibold">Kontakt</h2>
      <p className="mt-2 leading-7">
        E-Mail:{" "}
        <a className="underline" href="mailto:paras_8@icloud.com">
          paras_8@icloud.com
        </a>
      </p>

      <h2 className="mt-6 text-lg font-semibold">Produkt</h2>
      <p className="mt-2 leading-7">
        Elavis – Objektbezogene Immobilienanalyse (MVP)
      </p>

      <h2 className="mt-6 text-lg font-semibold">Hinweis</h2>
      <p className="mt-2 leading-7">
        Elavis befindet sich in einer Testphase. Die bereitgestellten Informationen
        stellen keine Steuer-, Rechts- oder Finanzberatung dar. Alle Angaben ohne Gewähr.
      </p>
    </main>
  );
}
