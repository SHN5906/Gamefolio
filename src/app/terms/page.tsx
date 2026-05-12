import { LegalLayout } from '@/components/legal/LegalLayout'

export const metadata = { title: 'Conditions Générales d\'Utilisation · CardFolio' }

export default function TermsPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdate="27 avril 2026">
      <Section title="1. Objet">
        <p>Les présentes CGU régissent l&apos;utilisation de CardFolio, plateforme web permettant aux utilisateurs de suivre la valeur de leur collection de cartes Pokémon TCG. En créant un compte ou en utilisant le service, tu acceptes ces conditions.</p>
      </Section>

      <Section title="2. Compte utilisateur">
        <ul>
          <li>L&apos;inscription est gratuite et nécessite une adresse email valide.</li>
          <li>Tu dois avoir au moins 13 ans (sinon avec accord parental).</li>
          <li>Tu es responsable de la confidentialité de ton mot de passe.</li>
          <li>Une seule personne par compte. Les comptes partagés sont interdits.</li>
        </ul>
      </Section>

      <Section title="3. Utilisation du service">
        <p>Tu peux utiliser CardFolio pour :</p>
        <ul>
          <li>Suivre ta collection personnelle de cartes Pokémon</li>
          <li>Consulter les prix et tendances Cardmarket / eBay</li>
          <li>Partager ton profil public (optionnel)</li>
          <li>Recevoir des alertes prix sur ta wishlist</li>
        </ul>
        <p>Sont <strong>strictement interdits</strong> :</p>
        <ul>
          <li>Le scraping automatisé sans accord (utilise notre API publique pour ça — plan Trader)</li>
          <li>La revente de tes accès</li>
          <li>L&apos;upload de contenus illégaux, haineux ou violant des droits d&apos;auteur</li>
          <li>Les tentatives de hack, d&apos;injection SQL, ou autre attaque</li>
        </ul>
      </Section>

      <Section title="4. Plans payants">
        <ul>
          <li>Les plans Pro (4,99 €/mois) et Trader (14,99 €/mois) sont en abonnement mensuel reconductible.</li>
          <li>Période d&apos;essai gratuite de 14 jours sur le plan Pro.</li>
          <li>Tu peux annuler à tout moment depuis tes paramètres. L&apos;accès reste actif jusqu&apos;à la fin de la période payée.</li>
          <li>Aucun remboursement au prorata. Aucun engagement.</li>
          <li>Les paiements sont gérés par Stripe (sécurité PCI-DSS).</li>
        </ul>
      </Section>

      <Section title="5. Données et propriété">
        <ul>
          <li><strong>Tes données t&apos;appartiennent</strong>. Tu peux les exporter à tout moment (CSV, JSON).</li>
          <li>Les images des cartes Pokémon proviennent de TCGdex (database publique).</li>
          <li>&quot;Pokémon&quot; est une marque déposée de Nintendo / Game Freak / Creatures Inc. CardFolio n&apos;est pas affilié à Nintendo.</li>
        </ul>
      </Section>

      <Section title="6. Limitation de responsabilité">
        <p>CardFolio fournit les prix Cardmarket à <strong>titre indicatif uniquement</strong>. Aucune garantie sur l&apos;exactitude des cotations. Tu ne peux pas tenir CardFolio responsable de pertes financières liées à des décisions prises sur la base des prix affichés.</p>
        <p>Le service est fourni &quot;tel quel&quot;. Nous mettons tout en œuvre pour garantir une disponibilité maximale (objectif 99,5%) mais aucune obligation de résultat.</p>
      </Section>

      <Section title="7. Suspension / Suppression">
        <p>Nous nous réservons le droit de suspendre ou supprimer un compte qui :</p>
        <ul>
          <li>Viole les présentes CGU</li>
          <li>Adopte un comportement abusif (spam, harcèlement)</li>
          <li>Tente de nuire au service ou à d&apos;autres utilisateurs</li>
        </ul>
        <p>En cas de suppression, tes données sont effacées sous 30 jours (sauf obligations légales : facturation 10 ans).</p>
      </Section>

      <Section title="8. Évolutions">
        <p>Ces CGU peuvent évoluer. Toute modification importante sera notifiée par email et dans l&apos;app au moins 30 jours avant. Si tu n&apos;es pas d&apos;accord, tu peux supprimer ton compte sans frais.</p>
      </Section>

      <Section title="9. Droit applicable">
        <p>Ces CGU sont régies par le droit français. En cas de litige, le tribunal compétent est celui du siège social de CardFolio (à compléter).</p>
        <p>Avant tout recours judiciaire, tu peux nous contacter à <a href="mailto:hello@cardfolio.app">hello@cardfolio.app</a>. On essaie de résoudre 99% des problèmes à l&apos;amiable.</p>
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
