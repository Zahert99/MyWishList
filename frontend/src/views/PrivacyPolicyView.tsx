import { Link } from "react-router-dom";

export default function PrivacyPolicyView() {
  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        color: "var(--text)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "var(--surface)",
          padding: "2rem",
          borderRadius: "8px",
        }}
      >
        <h1
          style={{
            color: "var(--primary)",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0.5rem",
          }}
        >
          Integritetspolicy för Önskelistan
        </h1>
        <p>
          <em>Senast uppdaterad: 2025-11-12</em>
        </p>

        <h2>Introduktion</h2>
        <p>
          Denna integritetspolicy beskriver hur vi ("Önskelistan") samlar in,
          använder och skyddar de personuppgifter du lämnar när du använder vår
          tjänst. Detta är ett skolprojekt och hanterar endast påhittade
          personuppgifter, men vi följer principerna i GDPR för att demonstrera
          korrekt hantering.
        </p>

        <h2>Vilka uppgifter samlar vi in?</h2>
        <p>När du skapar ett konto hos oss samlar vi in följande uppgifter:</p>
        <ul>
          <li>
            <strong>Användarnamn:</strong> Används för att identifiera dig i
            tjänsten och som ägare till dina önskelistor.
          </li>
          <li>
            <strong>E-postadress:</strong> Används för att du ska kunna logga in
            och för eventuell framtida kommunikation, som att återställa ditt
            lösenord.
          </li>
          <li>
            <strong>Lösenord (hashat):</strong> Vi sparar aldrig ditt lösenord i
            klartext, utan endast en säker, krypterad version (hash).
          </li>
        </ul>

        <h2>Varför samlar vi in uppgifterna? (Ändamål och laglig grund)</h2>
        <p>
          Vi behandlar dina personuppgifter med <strong>samtycke</strong> som
          laglig grund. Syftet är att tillhandahålla vår tjänst, vilket innebär
          att:
        </p>
        <ul>
          <li>Hantera ditt användarkonto.</li>
          <li>
            Göra det möjligt för dig att skapa, se och hantera önskelistor.
          </li>
        </ul>

        <h2>Dina rättigheter</h2>
        <p>
          Du har rätt att när som helst komma åt, ändra eller radera dina
          personuppgifter. Detta kan du göra via din profilsida ("Min Profil")
          när du är inloggad.
        </p>

        <div
          style={{
            marginTop: "2rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "1rem",
          }}
        >
          <Link to='/' style={{ color: "var(--primary)" }}>
            &larr; Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}
