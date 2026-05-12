import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Conditions Générales d'Utilisation · GameFolio",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Conditions Générales d'Utilisation"
      lastUpdate="12 mai 2026"
    >
      <Section title="1. Objet">
        <p>
          Les présentes CGU régissent l&apos;utilisation de GameFolio,
          plateforme de jeu en ligne en{" "}
          <strong>monnaie fictive uniquement</strong> autour de l&apos;univers
          du Trading Card Game. En créant un compte ou en utilisant le service,
          tu acceptes ces conditions.
        </p>
        <p>
          <strong>GameFolio n&apos;est pas un jeu d&apos;argent.</strong> Aucun
          dépôt en argent réel n&apos;est requis pour jouer, et aucune monnaie
          ou item obtenu sur la plateforme ne peut être converti, échangé ou
          revendu contre de l&apos;argent réel ou des biens matériels.
        </p>
      </Section>

      <Section title="2. Accès au service — limite d'âge">
        <ul>
          <li>
            L&apos;accès est{" "}
            <strong>réservé aux majeurs (18 ans et plus)</strong>.
          </li>
          <li>
            Une vérification d&apos;âge peut être demandée. La fourniture
            d&apos;une fausse date de naissance entraîne la suppression
            immédiate du compte.
          </li>
          <li>
            Le service est <strong>géo-bloqué</strong> dans les pays qui
            interdisent les loot box, notamment la <strong>Belgique</strong> et
            les <strong>Pays-Bas</strong>.
          </li>
        </ul>
      </Section>

      <Section title="3. Compte utilisateur">
        <ul>
          <li>
            L&apos;inscription est gratuite et nécessite une adresse email
            valide.
          </li>
          <li>Tu es responsable de la confidentialité de ton mot de passe.</li>
          <li>Une seule personne par compte. Comptes multiples interdits.</li>
          <li>
            Les bots, scripts d&apos;auto-jeu et toute forme
            d&apos;automatisation sont strictement interdits.
          </li>
        </ul>
      </Section>

      <Section title="4. Monnaie fictive et items virtuels">
        <ul>
          <li>
            La monnaie affichée en dollars (« $ ») dans le jeu est une{" "}
            <strong>monnaie virtuelle interne à GameFolio</strong>, sans valeur
            monétaire réelle.
          </li>
          <li>
            Les cartes virtuelles que tu obtiens en ouvrant des caisses, en
            jouant à la roue d&apos;upgrade, en battle ou en jackpot sont des{" "}
            <strong>items numériques sans valeur réelle</strong>.
          </li>
          <li>
            Tu ne peux pas vendre, échanger ou donner ces items à des tiers en
            dehors de la plateforme.
          </li>
          <li>
            Toute tentative de revente sur Discord, eBay, Vinted, etc. entraîne
            la suspension immédiate du compte et la confiscation des items.
          </li>
        </ul>
      </Section>

      <Section title="5. Modes de jeu">
        <p>GameFolio propose les modes suivants, tous en monnaie fictive :</p>
        <ul>
          <li>
            <strong>Caisses</strong> — ouverture pondérée carte × grade PSA
          </li>
          <li>
            <strong>Roue d&apos;upgrade</strong> — mise tes cartes pour tenter
            d&apos;en obtenir une plus chère
          </li>
          <li>
            <strong>Battles PvP</strong> — affronte un autre joueur, le meilleur
            drop gagne
          </li>
          <li>
            <strong>Jackpot communautaire</strong> — dépôts proportionnels,
            tirage au sort
          </li>
          <li>
            <strong>Re-gradation</strong> — détruis une carte, retente son grade
          </li>
        </ul>
        <p>
          Chaque tirage est exécuté côté serveur avec un RNG cryptographique.
          Les seed et résultats sont logués pour audit.
        </p>
      </Section>

      <Section title="6. Abonnements VIP">
        <ul>
          <li>
            Les tiers <strong>Plus (4,99 €/mois)</strong> et{" "}
            <strong>VIP (14,99 €/mois)</strong> donnent accès à des cosmétiques,
            de l&apos;animation exclusive, et un bonus de wallet quotidien en
            monnaie fictive.
          </li>
          <li>
            Aucun avantage de gameplay (drop rates inchangés, mêmes
            probabilités).
          </li>
          <li>L&apos;abonnement est mensuel reconductible, sans engagement.</li>
          <li>
            Annulation en 1 clic depuis tes paramètres. L&apos;accès VIP reste
            actif jusqu&apos;à la fin de la période payée.
          </li>
          <li>
            Aucun remboursement au prorata. Les paiements sont gérés par{" "}
            <strong>Stripe</strong> (PCI-DSS).
          </li>
          <li>
            L&apos;achat d&apos;un VIP ne crée pas de droit de retrait IRL sur
            la monnaie ou les items fictifs.
          </li>
        </ul>
      </Section>

      <Section title="7. Comportements interdits">
        <p>
          Sont <strong>strictement interdits</strong> :
        </p>
        <ul>
          <li>
            L&apos;utilisation de bots, macros, scripts ou autres
            automatisations
          </li>
          <li>
            L&apos;exploitation de bugs (« glitches ») au lieu de leur
            signalement
          </li>
          <li>
            La revente, l&apos;échange ou le don d&apos;items virtuels contre de
            l&apos;argent réel
          </li>
          <li>
            La création de comptes multiples pour cumuler les bonus
            d&apos;inscription
          </li>
          <li>
            Le harcèlement, le spam ou la diffusion de contenus illégaux dans le
            chat / battles
          </li>
          <li>Le scraping automatisé de la plateforme</li>
          <li>Toute tentative de hack, injection ou attaque</li>
        </ul>
        <p>
          Sanctions : avertissement, suspension temporaire, bannissement
          définitif, confiscation des items. Aucun remboursement n&apos;est dû
          en cas de sanction.
        </p>
      </Section>

      <Section title="8. Propriété intellectuelle">
        <ul>
          <li>
            « <strong>Pokémon</strong> » est une marque déposée de Nintendo /
            Game Freak / Creatures Inc.{" "}
            <strong>GameFolio n&apos;est pas affilié à Nintendo</strong>, ni à
            aucune de ses filiales.
          </li>
          <li>
            Les noms de cartes et de sets sont mentionnés à titre informatif
            uniquement, sans intention de violer un droit de marque.
          </li>
          <li>Les images proviennent de TCGdex (base de données publique).</li>
          <li>
            Le code source, le design et la logique de jeu de GameFolio sont la
            propriété de GameFolio.
          </li>
        </ul>
      </Section>

      <Section title="9. Limitation de responsabilité">
        <p>
          Le service est fourni « tel quel ». GameFolio ne garantit aucune
          disponibilité particulière, aucune absence de bug, et aucune valeur
          des items virtuels obtenus.
        </p>
        <p>
          La{" "}
          <strong>
            monnaie fictive et les items sont sans valeur monétaire réelle
          </strong>
          . Une perte d&apos;items ou de monnaie fictive (suite à un bug, un
          bannissement ou une fermeture de service){" "}
          <strong>ne donne droit à aucun remboursement</strong>.
        </p>
        <p>
          GameFolio ne pourra être tenu responsable d&apos;une utilisation
          excessive du service par un utilisateur. Si tu sens que tu joues trop,
          parle-en à l&apos;adresse{" "}
          <a href="mailto:support@gamefolio.app">support@gamefolio.app</a> ou
          contacte{" "}
          <a
            href="https://www.joueurs-info-service.fr/"
            target="_blank"
            rel="noreferrer"
          >
            Joueurs Info Service
          </a>{" "}
          (09 74 75 13 13, gratuit, 8h–2h).
        </p>
      </Section>

      <Section title="10. Suspension / Suppression de compte">
        <p>
          GameFolio se réserve le droit de suspendre ou supprimer un compte qui
          :
        </p>
        <ul>
          <li>Viole les présentes CGU</li>
          <li>Adopte un comportement abusif ou frauduleux</li>
          <li>
            Tente de monétiser la monnaie fictive en dehors de la plateforme
          </li>
        </ul>
        <p>
          En cas de suppression de compte (volontaire ou disciplinaire), les
          données personnelles sont effacées sous 30 jours, sauf obligations
          légales (facturation VIP : conservation 10 ans).
        </p>
      </Section>

      <Section title="11. Évolutions">
        <p>
          Ces CGU peuvent évoluer. Toute modification importante est notifiée
          par email + dans l&apos;app au moins 30 jours avant son application.
          Si tu n&apos;es pas d&apos;accord, tu peux supprimer ton compte sans
          frais.
        </p>
      </Section>

      <Section title="12. Droit applicable">
        <p>
          Ces CGU sont régies par le droit français. En cas de litige, le
          tribunal compétent est celui du siège social de GameFolio (à
          compléter).
        </p>
        <p>
          Avant tout recours judiciaire, écris-nous à{" "}
          <a href="mailto:hello@gamefolio.app">hello@gamefolio.app</a>. La
          majorité des litiges se règle à l&apos;amiable.
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
