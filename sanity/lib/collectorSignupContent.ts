export type CollectorSignupSettings = {
  heading: string;
  description: string;
  buttonLabel: string;
  finePrint: string;
  firstNameLabel: string;
  firstNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  submittingLabel: string;
  cancelLabel: string;
  successMessage: string;
  emailValidationMessage: string;
  firstNameValidationMessage: string;
  errorMessage: string;
};

export const DEFAULT_COLLECTOR_SIGNUP_SETTINGS: CollectorSignupSettings = {
  heading: 'Join My Collector List',
  description: "Join my Collector List and I'll email you a link when a new collection is released.",
  buttonLabel: 'Notify me',
  finePrint: 'Get an email when a new collection is released. Unsubscribe anytime.',
  firstNameLabel: 'First Name',
  firstNamePlaceholder: 'Your first name',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  submittingLabel: 'Joining…',
  cancelLabel: 'Cancel',
  successMessage: "You're on the list! I'll email you when a new collection is released.",
  emailValidationMessage: 'Please enter a valid email address.',
  firstNameValidationMessage: 'Please enter your first name.',
  errorMessage: 'Unable to join right now. Please try again shortly.',
};
