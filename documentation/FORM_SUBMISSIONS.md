# Contact and commission requests

Both forms use `/api/send-email` and wait for Mailgun to accept the message before showing success. Contact requests open `/contact/success`; commission requests open `/commissions/success`. Neither page clears the shopping cart or displays a payment confirmation.

## Delivery

- Published Sanity Email Settings control each form's recipients. Both are configured for `meganhoussianart@gmail.com`; the code, Studio defaults, seed data, and `MAILGUN_TO_EMAIL` fallback use the same address.
- Reply-To is the validated customer's email address.
- Email settings use one query, a 60-second cache, and a two-second timeout with no retries. A CMS failure uses the default template and recipient.
- Mailgun requests have a 15-second timeout; failure leaves the customer's details in the form. The browser blocks repeated submissions while sending.
- Inputs stay disabled until React is ready, preventing hydration from discarding fast typing or autofill. Fields also stay disabled while a submission is in progress.
- `inquiry.sent` and `inquiry.failed` logs include request IDs and timings without logging customer messages or provider credentials. Success means provider acceptance, not guaranteed inbox delivery.

## Reference photos

Photos upload directly from the browser to a **private Vercel Blob store**. Only the signed upload manifest goes through the form API, avoiding Vercel's 4.5 MB function body limit. Original resolution is preserved.

Limits: 10 images, 25 MB per image, 100 MB combined. Accepted formats: JPEG, PNG, WEBP, GIF, HEIC, and HEIF. The server signs a one-hour manifest containing exact paths, types, and sizes; upload tokens cannot write outside that manifest. The email handler checks the completed objects before sending the notification. Completed uploads are reused during a form retry in the same tab.

Megan receives private download links with expiry dates. Links work for 35 days and redirect to a five-minute signed Blob URL, so large downloads also bypass function body limits. Mailgun click tracking is disabled on these notifications. Anyone given a download link can access that photo until expiry.

`vercel.json` schedules daily cleanup at 08:00 UTC. The authenticated endpoint deletes only objects under `commission-references/` that are at least 35 days old, including abandoned uploads. Links expire at 35 days; deletion occurs on the next daily run.

Required environment variables:

- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and optionally `MAILGUN_FROM_EMAIL`
- `MAILGUN_TO_EMAIL=meganhoussianart@gmail.com`
- `BLOB_READ_WRITE_TOKEN` from the connected private store
- `CRON_SECRET` in production, used by Vercel's cron authorization header
- Optional `NEXT_PUBLIC_BASE_URL`; defaults for photo links to `https://www.meganhoussianart.com`

## Verification

```sh
npm test
npm run build
npm run test:e2e
```

The browser suite covers desktop Chromium and mobile WebKit. Form email responses are intercepted to avoid sending test messages. For an opt-in real 6 MB storage upload, private download, and fixture deletion:

```sh
RUN_STORAGE_SMOKE=1 npm run test:e2e
```

The storage smoke check uses `.env.local` and requires the connected Blob token. It sends no email.

Connecting the Blob store through Vercel CLI also refreshed the ignored `.env.local` file from the project's development environment.

## Investigation findings

The deployed forms both redirected to the payment success page. Commission recipients were set to Tyler in the published CMS, code fallback, Studio default, and seed data. The Vercel fallback recipient also used a different Megan address. Mailgun events confirmed delivery of a commission notification to Tyler.

The previous uploader accepted 25 MB of attachments through a function limited to 4.5 MB, which can reject large submissions before application logging. Retained Vercel logs did not include a failed request from the reported attempts, so a specific historical timeout could not be established. Unbounded provider waits and uncached CMS reads were addressed as reliability issues.
