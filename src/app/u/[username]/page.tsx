// Vestige CardFolio (profil public d'un collectionneur).
// Refactor V1 : la collection publique partagée n'est pas dans le scope
// V1 GameFolio. On redirige vers la home /game pour éviter un 404 si
// quelqu'un suit un ancien lien.

import { redirect } from "next/navigation";

export default function PublicProfilePage(): never {
  redirect("/game");
}
