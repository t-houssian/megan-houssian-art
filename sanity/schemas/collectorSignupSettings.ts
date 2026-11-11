import { defineField, defineType } from 'sanity';
import { DEFAULT_COLLECTOR_SIGNUP_SETTINGS } from '../lib/collectorSignupContent';

const sectionFields = [
  { name: 'heading', title: 'Heading', type: 'string' },
  { name: 'description', title: 'Invitation Text', type: 'text' },
  { name: 'buttonLabel', title: 'Signup Button Text', type: 'string' },
  { name: 'finePrint', title: 'Small Print', type: 'text' },
] as const;

const formFields = [
  { name: 'firstNameLabel', title: 'First Name Label' },
  { name: 'firstNamePlaceholder', title: 'First Name Placeholder' },
  { name: 'emailLabel', title: 'Email Label' },
  { name: 'emailPlaceholder', title: 'Email Placeholder' },
  { name: 'submittingLabel', title: 'Submitting Button Text' },
  { name: 'cancelLabel', title: 'Cancel Button Text' },
] as const;

const messageFields = [
  { name: 'successMessage', title: 'Success Message' },
  { name: 'emailValidationMessage', title: 'Invalid Email Message' },
  { name: 'firstNameValidationMessage', title: 'Missing First Name Message' },
  { name: 'errorMessage', title: 'Signup Error Message' },
] as const;

export default defineType({
  name: 'collectorSignupSettings',
  title: 'Collector Signup',
  type: 'document',
  groups: [
    { name: 'section', title: 'Signup Section', default: true },
    { name: 'form', title: 'Form Labels & Buttons' },
    { name: 'messages', title: 'Confirmation & Messages' },
  ],
  fields: [
    ...sectionFields.map(({ name, title, type }) => defineField({
      name, title, type, group: 'section',
      initialValue: DEFAULT_COLLECTOR_SIGNUP_SETTINGS[name],
      validation: (rule) => rule.required(),
    })),
    ...formFields.map(({ name, title }) => defineField({
      name, title, type: 'string', group: 'form',
      initialValue: DEFAULT_COLLECTOR_SIGNUP_SETTINGS[name],
      validation: (rule) => rule.required(),
    })),
    ...messageFields.map(({ name, title }) => defineField({
      name, title, type: 'text', rows: 2, group: 'messages',
      initialValue: DEFAULT_COLLECTOR_SIGNUP_SETTINGS[name],
      validation: (rule) => rule.required(),
    })),
  ],
  preview: { prepare: () => ({ title: 'Collector Signup' }) },
});
