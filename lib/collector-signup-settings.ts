import { sanityClient } from './sanity';
import { normalizeNonEmptyString } from './sanity-rich-text';
import {
  DEFAULT_COLLECTOR_SIGNUP_SETTINGS,
  type CollectorSignupSettings,
} from '../sanity/lib/collectorSignupContent';

export { DEFAULT_COLLECTOR_SIGNUP_SETTINGS, type CollectorSignupSettings };

export async function fetchCollectorSignupSettings(): Promise<CollectorSignupSettings> {
  try {
    const settings = await sanityClient.withConfig({ useCdn: false }).fetch<Partial<CollectorSignupSettings> | null>(
      '*[_type == "collectorSignupSettings" && _id == "collectorSignupSettings"][0]',
      {},
      { next: { revalidate: 60 } }
    );

    return Object.fromEntries(
      Object.entries(DEFAULT_COLLECTOR_SIGNUP_SETTINGS).map(([key, fallback]) => [
        key,
        normalizeNonEmptyString(settings?.[key as keyof CollectorSignupSettings], fallback),
      ])
    ) as CollectorSignupSettings;
  } catch {
    return { ...DEFAULT_COLLECTOR_SIGNUP_SETTINGS };
  }
}
