// Validate required environment variables
const requiredEnvVars = {
  // Public vars (exposed to client)
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  
  // Server-only vars
  SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
}

// Check for missing vars
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}`
  )
}

// Export validated env vars
export const env = {
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiToken: process.env.SANITY_API_TOKEN!,
    webhookSecret: process.env.SANITY_WEBHOOK_SECRET!,
  },
  nextAuth: {
    url: process.env.NEXTAUTH_URL!,
    secret: process.env.NEXTAUTH_SECRET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY!,
    from: process.env.EMAIL_FROM!,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM!,
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID,
  },
} as const