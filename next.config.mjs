import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {};

// Sentry configuration
const sentryConfig = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options
  org: "bryans-project",
  project: "javascript-nextjs",
  
  // Silent mode in development for faster builds
  silent: true,
  
  // Disable wide client file upload in development for faster builds
  widenClientFileUpload: process.env.NODE_ENV === 'production',
  
  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",
  
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  
  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

export default withSentryConfig(nextConfig, sentryConfig);