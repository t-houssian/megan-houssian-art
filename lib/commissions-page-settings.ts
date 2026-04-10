import { sanityClient } from './sanity';
import { normalizeNonEmptyString } from './sanity-rich-text';

export type CommissionsPageSettings = {
  pageTitle: string;
  introLead: string;
  checklistHeading: string;
  checklistItems: string[];
  introClosing: string;
  informationSectionTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  referenceImagesLabel: string;
  referenceImagesDropzoneTitle: string;
  referenceImagesDropzoneHint: string;
  canvasSectionTitle: string;
  canvasSizeLabel: string;
  customSizeLabel: string;
  customWidthLabel: string;
  customHeightLabel: string;
  quantityLabel: string;
  customSizeNote: string;
  itemEstimateLabel: string;
  addCanvasButtonLabel: string;
  removeCanvasButtonLabel: string;
  predefinedCanvasOptions: string[];
  pricePerSquareInch: number;
  minimumCommissionPrice: number;
  depositPercentage: number;
  summarySectionTitle: string;
  totalLabel: string;
  depositLabel: string;
  summaryNotes: string[];
  submitButtonLabel: string;
};

const DEFAULT_COMMISSIONS_PAGE_SETTINGS: CommissionsPageSettings = {
  pageTitle: 'Commission a Custom Piece',
  introLead: 'Thank you for your interest!',
  checklistHeading: 'A few notes before we begin:',
  checklistItems: [
    'Commission spots are limited, so be sure to reserve early.',
    "Upload an inspiration photo that reflects what you're envisioning.",
    'Images should be your own original photos, clear and well lit.',
    "Still deciding? I'm happy to help you choose the strongest reference.",
    "Include any notes about specific colors or palettes you'd like to complement your space.",
    'Pricing is based on size, and a 20% upfront, non-recoverable investment secures your spot and covers materials.',
  ],
  introClosing:
    "To request a spot or receive exact pricing, simply fill out the form below. There's no need to have every detail figured out; share your photos and initial ideas, and we'll refine the vision together. I can't wait to create something beautiful with you!",
  informationSectionTitle: 'Your Information',
  nameLabel: 'Your Name',
  namePlaceholder: 'Your full name',
  emailLabel: 'Your Email',
  emailPlaceholder: 'example@email.com',
  descriptionLabel: 'Artwork Description or Notes',
  descriptionPlaceholder: 'Tell us about your ideas (colors, style, subject)...',
  referenceImagesLabel: 'Reference Images (optional)',
  referenceImagesDropzoneTitle: 'Drag & drop inspiration images',
  referenceImagesDropzoneHint: 'or click to browse. JPG, PNG, or WEBP. Max 25MB total.',
  canvasSectionTitle: 'Canvas Selections',
  canvasSizeLabel: 'Canvas Size',
  customSizeLabel: 'Custom Size',
  customWidthLabel: 'Custom Width (inches)',
  customHeightLabel: 'Custom Height (inches)',
  quantityLabel: 'Quantity',
  customSizeNote:
    "Note: I'll source the canvas for custom sizes, and pricing may increase depending on the dimensions.",
  itemEstimateLabel: 'Estimated Total',
  addCanvasButtonLabel: 'Add Another Canvas',
  removeCanvasButtonLabel: 'Remove Item',
  predefinedCanvasOptions: [
    '24" X 36"',
    '24" X 48"',
    '30" X 40"',
    '6" X 6"',
    '4" X 6"',
    '5" X 7"',
    '8" X 8"',
    '10" X 10"',
    '12" X 12"',
    '14" X 14"',
    '18" X 18"',
    '20" X 20"',
    '8" X 10"',
    '8" X 16"',
    '9" X 12"',
    '10" X 20"',
    '11" X 14"',
    '12" X 16"',
    '12" X 24"',
    '14" X 18"',
    '16" X 20"',
    '18" X 24"',
    '20" X 24"',
    '22" X 28"',
    '24" X 30"',
    '20" X 36"',
    '12" X 36"',
    '36" X 48"',
    '30" X 30"',
    '36" X 36"',
    '48" X 48"',
    '48" X 60"',
  ],
  pricePerSquareInch: 1,
  minimumCommissionPrice: 250,
  depositPercentage: 20,
  summarySectionTitle: 'Commission Summary',
  totalLabel: 'Total Commission Cost',
  depositLabel: 'Upfront Deposit',
  summaryNotes: [
    'Smaller canvas sizes 14" x 18" and under have fixed prices to account for creation time and materials.',
    'The calculator provides an approximate price based on size. This form is just a request for a commission, and I will reach out to discuss the details and provide a final quote.',
    'I may not be able to accept all commissions due to time constraints but will do my best to accommodate. Thank you so much for your interest in my work! I look forward to working with you.',
  ],
  submitButtonLabel: 'Submit Commission Request',
};

type PartialCommissionsPageSettings = Partial<CommissionsPageSettings> | null;

const commissionsPageSettingsProjection = `{
  pageTitle,
  introLead,
  checklistHeading,
  checklistItems,
  introClosing,
  informationSectionTitle,
  nameLabel,
  namePlaceholder,
  emailLabel,
  emailPlaceholder,
  descriptionLabel,
  descriptionPlaceholder,
  referenceImagesLabel,
  referenceImagesDropzoneTitle,
  referenceImagesDropzoneHint,
  canvasSectionTitle,
  canvasSizeLabel,
  customSizeLabel,
  customWidthLabel,
  customHeightLabel,
  quantityLabel,
  customSizeNote,
  itemEstimateLabel,
  addCanvasButtonLabel,
  removeCanvasButtonLabel,
  predefinedCanvasOptions,
  pricePerSquareInch,
  minimumCommissionPrice,
  depositPercentage,
  summarySectionTitle,
  totalLabel,
  depositLabel,
  summaryNotes,
  submitButtonLabel
}`;

const commissionsPageSettingsSingletonQuery = `*[
  _type == "commissionsPageSettings" &&
  _id in ["commissionsPageSettings", "drafts.commissionsPageSettings"]
][0]${commissionsPageSettingsProjection}`;

const commissionsPageSettingsFallbackQuery = `*[_type == "commissionsPageSettings"] | order(_updatedAt desc)[0]${commissionsPageSettingsProjection}`;

const normalizeStringArray = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeNumber = (value: unknown, fallback: number, min = 0, max = Number.POSITIVE_INFINITY) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return value >= min && value <= max ? value : fallback;
};

export async function fetchCommissionsPageSettings(): Promise<CommissionsPageSettings> {
  try {
    const singletonSettings = await sanityClient.fetch<PartialCommissionsPageSettings>(
      commissionsPageSettingsSingletonQuery,
      {},
      { next: { revalidate: 60 } }
    );

    const settings =
      singletonSettings ??
      (await sanityClient.fetch<PartialCommissionsPageSettings>(
        commissionsPageSettingsFallbackQuery,
        {},
        { next: { revalidate: 60 } }
      ));

    return {
      pageTitle: normalizeNonEmptyString(settings?.pageTitle, DEFAULT_COMMISSIONS_PAGE_SETTINGS.pageTitle),
      introLead: normalizeNonEmptyString(settings?.introLead, DEFAULT_COMMISSIONS_PAGE_SETTINGS.introLead),
      checklistHeading: normalizeNonEmptyString(
        settings?.checklistHeading,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.checklistHeading
      ),
      checklistItems: normalizeStringArray(
        settings?.checklistItems,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.checklistItems
      ),
      introClosing: normalizeNonEmptyString(
        settings?.introClosing,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.introClosing
      ),
      informationSectionTitle: normalizeNonEmptyString(
        settings?.informationSectionTitle,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.informationSectionTitle
      ),
      nameLabel: normalizeNonEmptyString(settings?.nameLabel, DEFAULT_COMMISSIONS_PAGE_SETTINGS.nameLabel),
      namePlaceholder: normalizeNonEmptyString(
        settings?.namePlaceholder,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.namePlaceholder
      ),
      emailLabel: normalizeNonEmptyString(settings?.emailLabel, DEFAULT_COMMISSIONS_PAGE_SETTINGS.emailLabel),
      emailPlaceholder: normalizeNonEmptyString(
        settings?.emailPlaceholder,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.emailPlaceholder
      ),
      descriptionLabel: normalizeNonEmptyString(
        settings?.descriptionLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.descriptionLabel
      ),
      descriptionPlaceholder: normalizeNonEmptyString(
        settings?.descriptionPlaceholder,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.descriptionPlaceholder
      ),
      referenceImagesLabel: normalizeNonEmptyString(
        settings?.referenceImagesLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.referenceImagesLabel
      ),
      referenceImagesDropzoneTitle: normalizeNonEmptyString(
        settings?.referenceImagesDropzoneTitle,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.referenceImagesDropzoneTitle
      ),
      referenceImagesDropzoneHint: normalizeNonEmptyString(
        settings?.referenceImagesDropzoneHint,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.referenceImagesDropzoneHint
      ),
      canvasSectionTitle: normalizeNonEmptyString(
        settings?.canvasSectionTitle,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.canvasSectionTitle
      ),
      canvasSizeLabel: normalizeNonEmptyString(
        settings?.canvasSizeLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.canvasSizeLabel
      ),
      customSizeLabel: normalizeNonEmptyString(
        settings?.customSizeLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.customSizeLabel
      ),
      customWidthLabel: normalizeNonEmptyString(
        settings?.customWidthLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.customWidthLabel
      ),
      customHeightLabel: normalizeNonEmptyString(
        settings?.customHeightLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.customHeightLabel
      ),
      quantityLabel: normalizeNonEmptyString(
        settings?.quantityLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.quantityLabel
      ),
      customSizeNote: normalizeNonEmptyString(
        settings?.customSizeNote,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.customSizeNote
      ),
      itemEstimateLabel: normalizeNonEmptyString(
        settings?.itemEstimateLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.itemEstimateLabel
      ),
      addCanvasButtonLabel: normalizeNonEmptyString(
        settings?.addCanvasButtonLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.addCanvasButtonLabel
      ),
      removeCanvasButtonLabel: normalizeNonEmptyString(
        settings?.removeCanvasButtonLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.removeCanvasButtonLabel
      ),
      predefinedCanvasOptions: normalizeStringArray(
        settings?.predefinedCanvasOptions,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.predefinedCanvasOptions
      ),
      pricePerSquareInch: normalizeNumber(
        settings?.pricePerSquareInch,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.pricePerSquareInch,
        0.01
      ),
      minimumCommissionPrice: normalizeNumber(
        settings?.minimumCommissionPrice,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.minimumCommissionPrice
      ),
      depositPercentage: normalizeNumber(
        settings?.depositPercentage,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.depositPercentage,
        0,
        100
      ),
      summarySectionTitle: normalizeNonEmptyString(
        settings?.summarySectionTitle,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.summarySectionTitle
      ),
      totalLabel: normalizeNonEmptyString(settings?.totalLabel, DEFAULT_COMMISSIONS_PAGE_SETTINGS.totalLabel),
      depositLabel: normalizeNonEmptyString(
        settings?.depositLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.depositLabel
      ),
      summaryNotes: normalizeStringArray(settings?.summaryNotes, DEFAULT_COMMISSIONS_PAGE_SETTINGS.summaryNotes),
      submitButtonLabel: normalizeNonEmptyString(
        settings?.submitButtonLabel,
        DEFAULT_COMMISSIONS_PAGE_SETTINGS.submitButtonLabel
      ),
    };
  } catch (error) {
    console.error('Failed to load commissions page settings from Sanity', error);
    return DEFAULT_COMMISSIONS_PAGE_SETTINGS;
  }
}
