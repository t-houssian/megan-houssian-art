export type HomepageContent = {
  aboutHeading: string;
  aboutLocation: string;
  aboutDescription: string;
  aboutButtonLabel: string;
  commissionsHeading: string;
  commissionsDescription: string;
  commissionsButtonLabel: string;
  contactHeading: string;
  contactIntroText: string;
  contactEmail: string;
  contactButtonLabel: string;
};

export type FooterContent = {
  brandTitle: string;
  brandDescription: string;
  exploreHeading: string;
  galleryLabel: string;
  originalsLabel: string;
  commissionsLabel: string;
  aboutLabel: string;
  connectHeading: string;
  instagramLabel: string;
  pinterestLabel: string;
  facebookLabel: string;
  contactLabel: string;
  copyrightName: string;
  location: string;
};

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  aboutHeading: 'Megan Houssian',
  aboutLocation: 'Marble Falls, Texas.',
  aboutDescription:
    "Megan Houssian is a Texas-based artist known for peaceful, atmospheric landscapes rooted in everyday life. Painted in quiet moments, each piece invites you to slow down and welcome nature's calm into your home.",
  aboutButtonLabel: 'About',
  commissionsHeading: 'Interested in a Commission?',
  commissionsDescription:
    "I accept a limited number of commissions each season. If you're drawn to the mood and atmosphere in my landscapes, I'd love to create a one-of-a-kind piece for your home.",
  commissionsButtonLabel: 'Commission a Piece',
  contactHeading: 'Contact the Artist',
  contactIntroText: 'Fill out the form below or email me at',
  contactEmail: 'meganhoussianart@gmail.com',
  contactButtonLabel: 'Go to Contact Page',
};

export const DEFAULT_FOOTER_CONTENT: FooterContent = {
  brandTitle: 'Megan Houssian Art',
  brandDescription: 'Creating unique art that brings beauty and inspiration to your everyday spaces.',
  exploreHeading: 'Explore',
  galleryLabel: 'Gallery',
  originalsLabel: 'Originals',
  commissionsLabel: 'Commissions',
  aboutLabel: 'About the Artist',
  connectHeading: 'Connect',
  instagramLabel: 'Instagram',
  pinterestLabel: 'Pinterest',
  facebookLabel: 'Facebook',
  contactLabel: 'Get in Touch',
  copyrightName: 'Megan Houssian',
  location: 'Marble Falls, Texas',
};
