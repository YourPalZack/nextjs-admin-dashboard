declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Sanity
      NEXT_PUBLIC_SANITY_PROJECT_ID: string
      NEXT_PUBLIC_SANITY_DATASET: string
      SANITY_API_TOKEN: string
      SANITY_WEBHOOK_SECRET: string
      
      // NextAuth
      NEXTAUTH_URL: string
      NEXTAUTH_SECRET: string
      
      // Google OAuth
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      
      // Email
      RESEND_API_KEY: string
      EMAIL_FROM: string
      EMAIL_REPLY_TO: string
      
      // Optional
      NEXT_PUBLIC_GA_ID?: string
      SENTRY_DSN?: string
      NEXT_PUBLIC_SENTRY_DSN?: string
    }
  }
}

export {}