# Colorado Job Board - Sanity Studio

This is the content management system for the Colorado Job Board built with Sanity.

## Setup Instructions

### 1. Create a Sanity Project

1. Go to [https://www.sanity.io/manage](https://www.sanity.io/manage)
2. Create a new project
3. Note down your Project ID

### 2. Configure Environment Variables

Copy the `.env` file and update with your values:

```bash
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_API_TOKEN=your-token-with-write-access
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Initialize the Project

```bash
# This will connect your local studio to your Sanity project
sanity init --bare
```

### 5. Run the Studio

```bash
npm run dev
```

The studio will be available at `http://localhost:3333`

### 6. Deploy the Studio

```bash
npm run deploy
```

Choose a unique URL like: `colorado-jobs-studio`

### 7. Create API Token

1. Go to https://www.sanity.io/manage
2. Select your project
3. Go to API → Tokens
4. Add API token:
   - Name: "Next.js Development"
   - Permissions: Editor
   - Copy the token for your Next.js .env.local

### 8. Seed Initial Data

After setting up your API token in the seed script:

```bash
npm run seed
```

## Schema Structure

- **Documents**
  - `jobPosting` - Job listings
  - `company` - Company profiles
  - `jobCategory` - Job categories
  - `jobApplication` - Job applications

- **Objects**
  - `location` - Location data with coordinates
  - `blockContent` - Rich text content

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Sanity
- `npm run seed` - Seed initial categories