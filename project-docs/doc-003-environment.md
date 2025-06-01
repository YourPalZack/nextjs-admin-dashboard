# DOC-003: Environment Configuration

## Overview
Complete environment setup for all services including Sanity, authentication, email, and analytics.

## Prerequisites
- Sanity project created (from DOC-002)
- Google Cloud Console access (for OAuth)
- Resend account (free tier)

## Steps

### 1. Create Environment File

Create `.env.local` in your Next.js project root:

```bash
# In your Next.js project
touch .env.local
```

### 2. Sanity Configuration

#### 2.1 Get Sanity Project ID
1. Go to https://www.sanity.io/manage
2. Select your project
3. Copy the Project ID from the project settings

#### 2.2 Create Sanity API Token
1. In Sanity management, go to API → Tokens
2. Create new token:
   - Name: "Next.js Production"
   - Permissions: Editor
3. Copy the token immediately

#### 2.3 Add to .env.local
```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_actual_token
SANITY_WEBHOOK_SECRET=generate_random_string_here
```

### 3. NextAuth Configuration

#### 3.1 Generate NextAuth Secret
```bash
# Generate a secure random string
openssl rand -base64 32
```

#### 3.2 Add to .env.local
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
```

### 4. Google OAuth Setup (Free)

#### 4.1 Create Google OAuth Credentials
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Enable it
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Name: "Colorado Job Board"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://your-domain.com`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.com/api/auth/callback/google`
5. Copy Client ID and Client Secret

#### 4.2 Add to .env.local
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret
```

### 5. Email Configuration (Resend - Free Tier)

#### 5.1 Create Resend Account
1. Sign up at https://resend.com (free)
2. Verify your email
3. Add and verify your domain (optional but recommended)

#### 5.2 Get API Key
1. Go to API Keys in Resend dashboard
2. Create new API key
3. Copy the key

#### 5.3 Add to .env.local
```env
# Email Service (Resend)
RESEND_API_KEY=re_your_actual_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_REPLY_TO=support@yourdomain.com
```

### 6. Optional Services

#### 6.1 Google Analytics (Free)
```env
# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### 6.2 Sentry Error Tracking (Free tier)
```env
# Error Tracking (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 7. Complete .env.local File

Your complete `.env.local` should look like:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=skRt7...very_long_token...x9z2
SANITY_WEBHOOK_SECRET=my_webhook_secret_123

# NextAuth Configuration  
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=Hj8+PmQ3...your_32_char_secret...bN2A=

# Google OAuth
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1234567890abcdefghijk

# Email Service (Resend)
RESEND_API_KEY=re_123abc...your_resend_key
EMAIL_FROM=noreply@coloradotradesjobs.com
EMAIL_REPLY_TO=support@coloradotradesjobs.com

# Optional Services
NEXT_PUBLIC_GA_ID=G-ABC123XYZ
```

### 8. Create Environment Type Definitions

Create `types/env.d.ts`:

```typescript
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
```

### 9. Create Environment Validation

Create `lib/env.ts`:

```typescript
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
```

### 10. Production Environment Variables

For Vercel deployment, add these environment variables in the Vercel dashboard:

```bash
# Required for production
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com

# All other vars from .env.local
```

## Verification Steps

1. **Test Environment Loading:**
   ```typescript
   // Add to app/page.tsx temporarily
   console.log('Sanity Project:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Should start without environment errors

3. **Check TypeScript:**
   ```bash
   npm run type-check
   ```
   Environment types should be recognized

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to repository
- [ ] Different API tokens for dev/prod
- [ ] OAuth redirect URIs are correct
- [ ] Email domain is verified in Resend

## Common Issues & Solutions

### Issue: Environment variables undefined
**Solution:** Restart Next.js dev server after changing .env.local

### Issue: Google OAuth error
**Solution:** Check redirect URIs match exactly (including trailing slashes)

### Issue: Resend emails not sending
**Solution:** Verify domain or use Resend's test domain

### Issue: TypeScript env errors
**Solution:** Ensure env.d.ts is included in tsconfig.json

## Next Steps

Proceed to [DOC-004: Authentication Setup](doc-004-authentication.md) to implement user authentication.

## Notes for Claude Code

When setting up environment:
1. Never commit .env.local to git
2. Use exact variable names as shown
3. Test each service connection individually
4. Keep production and development tokens separate