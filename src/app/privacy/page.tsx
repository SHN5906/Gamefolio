import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = { title: "Politique de confidentialité · GameFolio" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdate="12 mai 2026">
      <Section title="1. Qui sommes-nous ?">
        <p>
          GameFolio est édité par <strong>[Raison sociale à compléter]</strong>,
          immatriculée au RCS sous le numéro <strong>[à compléter]</strong>,
          dont le siège est situé en France. Le responsable du traitement des
          données est{" "}
          <a href="mailto:hello@gamefolio.app">hello@gamefolio.app</a>.
        </p>
      </Section>

      <Section title="2. Quelles données collectons-nous ?">
        <ul>
          <li>
            <strong>Données de compte</strong> : email, pseudo, mot de passe
            (hashé via Argon2 — jamais stocké en clair), date de naissance (pour
            vérifier la majorité)
          </li>
          <li>
            <strong>Données de profil</strong> : avatar (couleur ou image
            uploadée), badge VIP éventuel
          </li>
          <li>
            <strong>Données de jeu</strong> : monnaie fictive (solde, gains,
            pertes), inventaire virtuel (cartes obtenues avec grade), historique
            d&apos;ouvertures, participations battles / jackpot, regrades
            effectuées
          </li>
          <li>
            <strong>Données techniques</strong> : adresse IP (pour le
            géo-blocage Belgique/Pays-Bas et la détection de comptes multiples),
            type de navigateur, pages visitées (anonymisées via PostHog EU)
          </li>
          <li>
            <strong>Données de facturation</strong> (VIP uniquement) : gérées
            par <strong>Stripe</strong>, jamais stockées sur nos serveurs (sauf
            l&apos;ID Stripe Customer)
          </li>
          <li>
            <strong>Cookies</strong> : cookie de session (auth) + cookie
            analytics anonymisé (PostHog, opt-out facile)
          </li>
        </ul>
      </Section>

      <Section title="3. Pourquoi ?">
        <ul>
          <li>
            <strong>Authentification</strong> : email + mot de passe pour
            accéder à ton compte
          </li>
          <li>
            <strong>Jeu</strong> : suivi de ton solde fictif, inventaire,
            historique de tirages
          </li>
          <li>
            <strong>Anti-fraude</strong> : détection de bots, comptes multiples,
            exploits
          </li>
          <li>
            <strong>Conformité légale</strong> : vérification de la majorité,
            géo-blocage des juridictions interdites
          </li>
          <li>
            <strong>Amélioration produit</strong> : analytics anonymisées pour
            comprendre l&apos;usage
          </li>
          <li>
            <strong>Facturation VIP</strong> : Stripe stocke les infos de
            paiement (PCI-DSS)
          </li>
        </ul>
      </Section>

      <Section title="4. Avec qui ?">
        <p>
          Tes données sont stockées chez <strong>Supabase</strong> (PostgreSQL +
          Auth + Storage, région Europe : Frankfurt). Sous-traitants :
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — région Frankfurt, RGPD-compliant
          </li>
          <li>
            <strong>Vercel</strong> (hosting frontend) — région Paris/Frankfurt,
            RGPD-compliant
          </li>
          <li>
            <strong>Stripe</strong> (paiements VIP) — RGPD-compliant, certifié
            PCI-DSS
          </li>
          <li>
            <strong>Resend</strong> (envoi emails) — RGPD-compliant
          </li>
          <li>
            <strong>PostHog EU</strong> (analytics anonymisées, opt-out facile)
          </li>
          <li>
            <strong>Sentry EU</strong> (crash reporting, sans données
            utilisateur)
          </li>
          <li>
            <strong>TCGdex</strong> (catalogue de cartes — aucune donnée perso
            transmise)
          </li>
        </ul>
        <p>
          Aucune donnée n&apos;est vendue à des tiers. Aucune publicité ciblée.
          Pas de cookie marketing.
        </p>
      </Section>

      <Section title="5. Tes droits (RGPD)">
        <p>Tu peux à tout moment :</p>
        <ul>
          <li>
            <strong>Accéder</strong> à tes données (export JSON depuis tes
            paramètres)
          </li>
          <li>
            <strong>Rectifier</strong> tes informations (depuis ton profil)
          </li>
          <li>
            <strong>Supprimer</strong> ton compte définitivement (bouton dans
            les paramètres)
          </li>
          <li>
            <strong>Porter</strong> tes données vers un autre service (export
            JSON ou CSV)
          </li>
          <li>
            <strong>T&apos;opposer</strong> aux analytics (toggle dans les
            paramètres)
          </li>
        </ul>
        <p>
          Pour toute question :{" "}
          <a href="mailto:hello@gamefolio.app">hello@gamefolio.app</a>. Réponse
          sous 7 jours max.
        </p>
        <p>
          Tu peux également déposer une réclamation auprès de la{" "}
          <a href="https://www.cnil.fr/" target="_blank" rel="noreferrer">
            CNIL
          </a>
          .
        </p>
      </Section>

      <Section title="6. Combien de temps ?">
        <ul>
          <li>
            Données de compte : conservées tant que ton compte est actif.
            Supprimées définitivement 30 jours après suppression du compte.
          </li>
          <li>Logs techniques (IP, user-agent) : 12 mois max</li>
          <li>Historique de jeu : 24 mois max (analytics et anti-fraude)</li>
          <li>
            Données de facturation VIP : 10 ans (obligation légale française)
          </li>
        </ul>
      </Section>

      <Section title="7. Cookies">
        <p>On utilise uniquement :</p>
        <ul>
          <li>Un cookie de session (strictement nécessaire à l&apos;auth)</li>
          <li>
            Un cookie analytics anonymisé (PostHog, refusable via le bandeau)
          </li>
        </ul>
        <p>
          Pas de cookie marketing, pas de tracking cross-site, pas de publicité.
        </p>
      </Section>

      <Section title="8. Sécurité">
        <p>
          Les mots de passe sont hashés avec Argon2. Les communications sont en
          HTTPS uniquement (HSTS preload). Les tirages de jeu sont exécutés côté
          serveur avec un RNG cryptographique. Les bases de données sont
          sauvegardées chaque jour. Mais aucun système n&apos;est 100 % sûr —
          préviens-nous si tu remarques un comportement louche à{" "}
          <a href="mailto:security@gamefolio.app">security@gamefolio.app</a>.
        </p>
      </Section>

      <Section title="9. Joueurs vulnérables">
        <p>
          GameFolio est en monnaie fictive, mais nous prenons au sérieux le
          risque d&apos;addiction. Si tu sens que tu joues trop :
        </p>
        <ul>
          <li>
            Tu peux <strong>auto-exclure ton compte</strong> depuis les
            paramètres (verrouillage 24h, 7j, 30j, ou définitif)
          </li>
          <li>
            Contacte{" "}
            <a
              href="https://www.joueurs-info-service.fr/"
              target="_blank"
              rel="noreferrer"
            >
              Joueurs Info Service
            </a>{" "}
            (09 74 75 13 13, gratuit, 8h-2h)
          </li>
          <li>Demande de l&apos;aide à un proche</li>
        </ul>
      </Section>

      <Section title="10. Modifications">
        <p>
          Cette politique peut évoluer. Toute modification importante te sera
          notifiée par email + dans l&apos;app au moins 30 jours avant son
          entrée en vigueur.
        </p>
      </Section>
    </LegalLayout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2
        className="text-[18px] font-bold mb-3 mt-2"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      <div
        className="text-[13.5px] leading-relaxed flex flex-col gap-3"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {children}
      </div>
    </section>
  );
}
