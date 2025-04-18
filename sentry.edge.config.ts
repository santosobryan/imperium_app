// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c21a30f397ec183da743a524ffb74cb1@o4509169061003264.ingest.de.sentry.io/4509169065721936",

  // Reduce sample rate in development for better performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,

  // Disable debug mode
  debug: false,
  
  // Disable performance monitoring in development for faster builds
  integrations: process.env.NODE_ENV === 'production' 
    ? undefined 
    : integrations => integrations.filter(integration => integration.name !== 'BrowserTracing'),
});
