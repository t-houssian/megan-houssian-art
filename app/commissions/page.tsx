import { fetchCommissionsPageSettings } from "../../lib/commissions-page-settings";
import CommissionsPageClient from "./CommissionsPageClient";

export const revalidate = 60;

export const metadata = {
  title: "Commissions - Megan Houssian Art",
  description: "Request a custom commission and estimate pricing for your painting.",
};

export default async function CommissionsPage() {
  const settings = await fetchCommissionsPageSettings();

  return <CommissionsPageClient settings={settings} />;
}
