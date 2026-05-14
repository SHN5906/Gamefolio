// Vestige CardFolio (subscription tier, currency, Supabase profile…)
// Refactor V1 : on redirige proprement vers /game/profile qui couvre
// le scope GameFolio (avatar, stats, reset, déco). Les anciens settings
// reviendront en Phase 2 quand auth+Stripe seront branchés.

import { redirect } from "next/navigation";

export default function SettingsPage(): never {
  redirect("/game/profile");
}
