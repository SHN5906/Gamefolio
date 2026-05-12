import { LegalLayout } from '@/components/legal/LegalLayout'

export const metadata = { title: 'Politique de confidentialité · CardFolio' }

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdate="27 avril 2026">
      <Section title="1. Qui sommes-nous ?">
        <p>CardFolio est édité par <strong>[Raison sociale à compléter]</strong>, immatriculée au RCS sous le numéro <strong>[à compléter]</strong>, dont le siège est situé en France. Le responsable du traitement des données est <a href="mailto:hello@cardfolio.app">hello@cardfolio.app</a>.</p>
      </Section>

      <Section title="2. Quelles données collectons-nous ?">
        <ul>
          <li><strong>Données de compte</strong> : email, nom affiché, mot de passe (hashé via bcrypt — jamais en clair)</li>
          <li><strong>Données de profil</strong> : avatar, username, devise par défaut</li>
          <li><strong>Données de collection</strong> : cartes possédées, scellés, prix d&apos;achat, dates, notes</li>
          <li><strong>Données de wishlist</strong> : cartes surveillées, seuils d&apos;alerte</li>
          <li><strong>Données techniques</strong> : adresse IP, type de navigateur, pages visitées (anonymisées via PostHog EU)</li>
          <li><strong>Cookies</strong> : session d&apos;authentification + préférences UI uniquement</li>
        </ul>
      </Section>

      <Section title="3. Pourquoi ?">
        <ul>
          <li><strong>Authentification</strong> : email + mot de passe pour accéder à ton compte</li>
          <li><strong>Personnalisation</strong> : afficher TA collection avec TES prix</li>
          <li><strong>Notifications</strong> : alertes prix par email (Pro / Trader)</li>
          <li><strong>Amélioration produit</strong> : analytics anonymisées pour comprendre l&apos;usage</li>
          <li><strong>Facturation</strong> : Stripe stocke les infos de paiement (jamais nos serveurs)</li>
        </ul>
      </Section>

      <Section title="4. Avec qui ?">
        <p>Tes données sont stockées chez <strong>Supabase</strong> (hébergeur cloud, région Europe : Frankfurt). Nous utilisons :</p>
        <ul>
          <li><strong>Supabase</strong> (PostgreSQL + Auth + Storage) — région Frankfurt, RGPD-compliant</li>
          <li><strong>Vercel</strong> (hosting frontend) — région Paris</li>
          <li><strong>Stripe</strong> (paiements) — RGPD-compliant, certifié PCI-DSS</li>
          <li><strong>Resend</strong> (envoi emails) — RGPD-compliant</li>
          <li><strong>PostHog EU</strong> (analytics anonymisées, opt-out facile)</li>
          <li><strong>TCGdex</strong> (catalogue de cartes — pas de données perso transmises)</li>
        </ul>
        <p>Aucune donnée n&apos;est vendue à des tiers. Aucune publicité ciblée.</p>
      </Section>

      <Section title="5. Tes droits (RGPD)">
        <p>Tu peux à tout moment :</p>
        <ul>
          <li><strong>Accéder</strong> à tes données (export JSON disponible dans tes paramètres)</li>
          <li><strong>Rectifier</strong> tes informations (depuis ton profil)</li>
          <li><strong>Supprimer</strong> ton compte définitivement (bouton dans les paramètres)</li>
          <li><strong>Porter</strong> tes données vers un autre service (export CSV)</li>
          <li><strong>T&apos;opposer</strong> aux analytics (toggle dans les paramètres)</li>
        </ul>
        <p>Pour toute question : <a href="mailto:hello@cardfolio.app">hello@cardfolio.app</a>. Réponse sous 7 jours max.</p>
        <p>Tu peux également déposer une réclamation auprès de la <a href="https://www.cnil.fr/" target="_blank" rel="noreferrer">CNIL</a>.</p>
      </Section>

      <Section title="6. Combien de temps ?">
        <ul>
          <li>Données de compte : conservées tant que ton compte est actif. Supprimées définitivement 30 jours après suppression du compte.</li>
          <li>Logs techniques : 12 mois max</li>
          <li>Données de facturation : 10 ans (obligation légale)</li>
        </ul>
      </Section>

      <Section title="7. Cookies">
        <p>On utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement (session) et un cookie <strong>analytics anonymisé</strong> (PostHog) que tu peux refuser via le bandeau cookies. Pas de pub. Pas de tracking cross-site.</p>
      </Section>

      <Section title="8. Sécurité">
        <p>Les mots de passe sont hashés (bcrypt). Les communications sont chiffrées (HTTPS). Les uploads sont scannés. Les bases de données sont sauvegardées chaque jour. Mais aucun système n&apos;est 100% sûr — préviens-nous si tu remarques un comportement louche.</p>
      </Section>

      <Section title="9. Modifications">
        <p>Cette politique peut évoluer. Toute modification importante te sera notifiée par email + dans l&apos;app au moins 30 jours avant son entrée en vigueur.</p>
      </Section>
    </LegalLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-[18px] font-bold mb-3 mt-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      <div className="text-[13.5px] leading-relaxed flex flex-col gap-3" style={{ color: 'var(--color-text-secondary)' }}>
        {children}
      </div>
    </section>
  )
}
