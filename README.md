# 🏰 PlaygroundExplorer - UK Playground Rating App

A delightful web application that allows families across the United Kingdom to discover, rate, and share their playground experiences. Built with Next.js, Supabase, and designed with children's joy in mind!

## ✨ Features

- 🔍 **Search & Discovery**: Find amazing playgrounds near you
- ⭐ **Custom Rating System**: Create your own rating categories
- 📸 **Private Photo Collection**: Upload and store playground photos privately
- 🏆 **Top 5 Leaderboard**: Discover the highest-rated playgrounds
- 👨‍👩‍👧‍👦 **Family-Friendly**: Designed for parents and children
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:
- A computer with internet access
- A [GitHub account](https://github.com)
- A [Vercel account](https://vercel.com) (free)
- A [Supabase account](https://supabase.com) (free)

### 1. Get the Code

1. **Download this project** or **clone from GitHub**
2. **Extract the files** to a folder on your computer
3. **Open a terminal/command prompt** in that folder

### 2. Set Up the Database

Follow the detailed instructions in \`docs/SUPABASE_SETUP.md\`

### 3. Deploy to Vercel

Follow the detailed instructions in \`docs/DEPLOYMENT.md\`

## 📁 Project Structure

\`\`\`
playground-explorer/
├── app/                    # Next.js app pages
│   ├── page.tsx           # Home page
│   ├── search/            # Search functionality
│   ├── playground/        # Playground details
│   ├── add-playground/    # Add new playground
│   └── profile/           # User profile
├── components/            # Reusable UI components
├── scripts/               # Database setup scripts
├── docs/                  # Documentation
├── package.json           # Project dependencies
└── README.md             # This file
\`\`\`

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for photos)
- **Deployment**: Vercel
- **Charts**: Recharts for data visualization

## 📖 Documentation

- [🚀 Deployment Guide](docs/DEPLOYMENT.md) - Step-by-step deployment instructions
- [🗄️ Supabase Setup](docs/SUPABASE_SETUP.md) - Database configuration guide
- [⚙️ Environment Variables](docs/ENVIRONMENT_VARIABLES.md) - Configuration settings
- [🔧 Development Guide](docs/DEVELOPMENT.md) - Local development setup
- [❓ Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Need Help?

- Check our [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Open an issue on GitHub
- Contact the development team

## 🎉 Acknowledgments

Built with love for families exploring playgrounds across the UK! 🇬🇧

---

**Happy playground exploring!** 🏰✨
\`\`\`

```md project="Playground Explorer" file="docs/DEPLOYMENT.md" type="markdown"
# 🚀 Deployment Guide - Step by Step

This guide will walk you through deploying your PlaygroundExplorer app to Vercel, step by step. Don't worry if you're new to this - we'll explain everything!

## What You'll Need

- ✅ A GitHub account (free)
- ✅ A Vercel account (free) 
- ✅ A Supabase project set up (see [Supabase Setup Guide](SUPABASE_SETUP.md))
- ✅ Your project code ready

## Step 1: Prepare Your Code for GitHub

### 1.1 Create a .gitignore file

First, we need to tell Git which files NOT to upload to GitHub.

Create a new file called \`.gitignore\` in your project root folder and add this content:

\`\`\`
# Dependencies
node_modules/
.pnpm-debug.log*

# Next.js
.next/
out/

# Environment variables (IMPORTANT - keeps your secrets safe!)
.env
.env.local
.env.production.local
.env.development.local

# Vercel
.vercel

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
\`\`\`

### 1.2 Create a package.json file

Create a \`package.json\` file in your project root:

\`\`\`json
{
  "name": "playground-explorer",
  "version": "1.0.0",
  "description": "UK Playground Rating App for Families",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "@tailwindcss/forms": "^0.5.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.294.0",
    "recharts": "^2.8.0",
    "@supabase/supabase-js": "^2.38.0",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0"
  }
}
\`\`\`

## Step 2: Upload to GitHub

### 2.1 Create a new repository on GitHub

1. Go to [GitHub.com](https://github.com)
2. Click the **"+"** button in the top right
3. Select **"New repository"**
4. Name it: \`playground-explorer\`
5. Make it **Public** (so Vercel can access it)
6. **Don't** check "Add a README file" (we already have one)
7. Click **"Create repository"**

### 2.2 Upload your code

**Option A: Using GitHub's web interface (Easiest for beginners)**

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop ALL your project files (except node_modules if you have it)
3. Write a commit message: "Initial commit - PlaygroundExplorer app"
4. Click **"Commit changes"**

**Option B: Using Git commands (if you're comfortable with terminal)**

\`\`\`bash
# In your project folder
git init
git add .
git commit -m "Initial commit - PlaygroundExplorer app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/playground-explorer.git
git push -u origin main
\`\`\`

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign up"** or **"Log in"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### 3.2 Import your project

1. On your Vercel dashboard, click **"New Project"**
2. Find your \`playground-explorer\` repository
3. Click **"Import"**

### 3.3 Configure your project

1. **Project Name**: Keep as \`playground-explorer\`
2. **Framework Preset**: Should auto-detect as "Next.js"
3. **Root Directory**: Leave as \`./\`
4. **Build Command**: Leave as default
5. **Output Directory**: Leave as default

### 3.4 Add Environment Variables

This is CRUCIAL - your app won't work without these!

1. Click **"Environment Variables"** section
2. Add these variables one by one:

| Name | Value | Where to get it |
|------|-------|----------------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Your Supabase URL | From Supabase dashboard → Settings → API |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Your Supabase anon key | From Supabase dashboard → Settings → API |
| \`SUPABASE_SERVICE_ROLE_KEY\` | Your Supabase service role key | From Supabase dashboard → Settings → API |

**How to add each variable:**
1. Type the **Name** (exactly as shown above)
2. Paste the **Value** from your Supabase dashboard
3. Click **"Add"**
4. Repeat for all three variables

### 3.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll see a success screen with your live URL!

## Step 4: Test Your Deployment

1. Click on your deployment URL
2. Check that the homepage loads correctly
3. Try navigating to different pages
4. Test the search functionality

## Step 5: Set Up Automatic Deployments

Good news! This is already done. Every time you push changes to your GitHub repository, Vercel will automatically rebuild and deploy your app.

## 🎉 You're Live!

Congratulations! Your PlaygroundExplorer app is now live on the internet. Share the URL with friends and family to start building your playground community!

## Next Steps

- Share your app URL with other families
- Start adding playgrounds in your area
- Customize the rating categories
- Upload photos of your playground visits

## 🆘 Having Issues?

Check our [Troubleshooting Guide](TROUBLESHOOTING.md) or the common issues below:

### Build Failed?
- Check that all environment variables are set correctly
- Make sure your Supabase database is set up properly

### App loads but features don't work?
- Verify your environment variables are correct
- Check that your Supabase database has the required tables

### Can't see images?
- Make sure Supabase Storage is configured (see Supabase Setup guide)

---

**Need more help?** Open an issue on GitHub or contact the development team!
\`\`\`

```md project="Playground Explorer" file="docs/SUPABASE_SETUP.md" type="markdown"
# 🗄️ Supabase Setup Guide - Complete Walkthrough

Supabase will be your app's database and user authentication system. This guide will walk you through setting it up from scratch, even if you've never used a database before!

## What is Supabase?

Supabase is like a digital filing cabinet for your app. It stores:
- User accounts and login information
- Playground information
- Ratings and reviews
- Private photos
- User preferences

## Step 1: Create Your Supabase Account

### 1.1 Sign Up
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### 1.2 Create a New Project
1. Click **"New Project"**
2. Choose your organization (usually your username)
3. Fill in the details:
   - **Name**: \`playground-explorer\`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to UK (Europe West)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

## Step 2: Set Up Your Database

### 2.1 Create the Database Tables

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste this code:

\`\`\`sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playgrounds table
CREATE TABLE IF NOT EXISTS playgrounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  age_range VARCHAR(100),
  accessibility VARCHAR(100),
  opening_hours VARCHAR(100),
  equipment TEXT[],
  facilities TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rating_categories table
CREATE TABLE IF NOT EXISTS rating_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  playground_id UUID REFERENCES playgrounds(id) ON DELETE CASCADE,
  category_id UUID REFERENCES rating_categories(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 1 AND score <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, playground_id, category_id)
);

-- Create user_photos table (private photos)
CREATE TABLE IF NOT EXISTS user_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  playground_id UUID REFERENCES playgrounds(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  playground_id UUID REFERENCES playgrounds(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, playground_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playgrounds_location ON playgrounds USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_playgrounds_name ON playgrounds USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_ratings_playground_id ON ratings(playground_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_playground_id ON user_photos(playground_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
\`\`\`

4. Click **"Run"** (bottom right)
5. You should see "Success. No rows returned" - this is good!

### 2.2 Add Sample Data

1. Create another new query
2. Copy and paste this code:

\`\`\`sql
-- Insert default rating categories
INSERT INTO rating_categories (name, description, user_id) VALUES
('Safety', 'How safe is the playground?', NULL),
('Equipment Quality', 'Quality and condition of play equipment', NULL),
('Cleanliness', 'How clean and well-maintained is the area?', NULL),
('Age Appropriateness', 'Suitable for the intended age group?', NULL),
('Accessibility', 'Accessible for children with disabilities?', NULL),
('Overall Fun Factor', 'How much fun did your child have?', NULL);

-- Insert sample playgrounds
INSERT INTO playgrounds (name, location, description, age_range, accessibility, opening_hours, equipment, facilities) VALUES
('Sunshine Adventure Park', 'Hyde Park, London', 'A fantastic playground with modern equipment suitable for children of all ages.', '2-12 years', 'Wheelchair accessible', '6:00 AM - 10:00 PM', ARRAY['Swings', 'Slides', 'Climbing Frame', 'Sand Pit'], ARRAY['Toilets', 'Parking', 'Cafe nearby']),

('Rainbow Play Area', 'Regent''s Park, London', 'A colorful playground perfect for younger children.', '2-8 years', 'Partially accessible', '7:00 AM - 9:00 PM', ARRAY['Swings', 'See-saw', 'Monkey Bars'], ARRAY['Toilets', 'Benches']),

('Castle Playground', 'Hampstead Heath, London', 'An exciting castle-themed playground.', '4-14 years', 'Wheelchair accessible', '24 hours', ARRAY['Castle Structure', 'Zip Line', 'Climbing Wall'], ARRAY['Toilets', 'Parking', 'Picnic Tables']);
\`\`\`

3. Click **"Run"**
4. You should see "Success" messages

## Step 3: Set Up Authentication

### 3.1 Configure Auth Settings
1. Click **"Authentication"** in the left sidebar
2. Click **"Settings"**
3. Under **"Site URL"**, add your domain:
   - For development: \`http://localhost:3000\`
   - For production: \`https://your-app-name.vercel.app\` (you'll get this after deployment)
4. Under **"Redirect URLs"**, add:
   - \`http://localhost:3000/auth/callback\`
   - \`https://your-app-name.vercel.app/auth/callback\`

### 3.2 Enable Email Authentication
1. In Authentication → Settings
2. Make sure **"Enable email confirmations"** is ON
3. **"Enable email change confirmations"** should be ON
4. Save changes

## Step 4: Set Up File Storage (for Photos)

### 4.1 Create Storage Bucket
1. Click **"Storage"** in the left sidebar
2. Click **"New bucket"**
3. Name it: \`playground-photos\`
4. Make it **Private** (photos should only be visible to users who uploaded them)
5. Click **"Create bucket"**

### 4.2 Set Up Storage Policies
1. Click on your \`playground-photos\` bucket
2. Click **"Policies"** tab
3. Click **"New policy"**
4. Use this template for **"Users can upload photos"**:

\`\`\`sql
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
\`\`\`

5. Create another policy for **"Users can view their own photos"**:

\`\`\`sql
CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
\`\`\`

## Step 5: Get Your API Keys

### 5.1 Find Your Keys
1. Click **"Settings"** in the left sidebar
2. Click **"API"**
3. You'll see three important values:

**Copy these values - you'll need them for deployment:**

- **Project URL**: \`https://your-project-id.supabase.co\`
- **anon public key**: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\` (very long)
- **service_role secret key**: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\` (very long, different from anon)

### 5.2 Keep These Safe!
- **NEVER** share your service_role key publicly
- **NEVER** commit these to GitHub
- Store them securely - you'll add them to Vercel later

## Step 6: Test Your Database

### 6.1 Check Your Tables
1. Click **"Table Editor"** in the left sidebar
2. You should see all your tables:
   - users
   - playgrounds
   - rating_categories
   - ratings
   - user_photos
   - user_favorites

### 6.2 Verify Sample Data
1. Click on **"playgrounds"** table
2. You should see 3 sample playgrounds
3. Click on **"rating_categories"** table
4. You should see 6 default categories

## 🎉 Supabase Setup Complete!

Your database is now ready! Here's what you've accomplished:

✅ Created a Supabase project  
✅ Set up all database tables  
✅ Added sample data  
✅ Configured authentication  
✅ Set up photo storage  
✅ Got your API keys  

## Next Steps

1. **Save your API keys** somewhere safe
2. Follow the [Deployment Guide](DEPLOYMENT.md) to deploy your app
3. Add your API keys to Vercel environment variables

## 🆘 Troubleshooting

### "Permission denied" errors?
- Check that your Row Level Security policies are set up correctly
- Make sure authentication is working

### Can't see your tables?
- Make sure you ran the SQL commands successfully
- Check for any error messages in the SQL editor

### Storage not working?
- Verify your storage policies are created
- Check that the bucket is set to private

### Need to reset everything?
1. Go to Settings → General
2. Scroll to "Danger Zone"
3. You can reset your database (this will delete all data!)

---

**Ready for the next step?** Head to the [Deployment Guide](DEPLOYMENT.md)!
\`\`\`

```md project="Playground Explorer" file="docs/ENVIRONMENT_VARIABLES.md" type="markdown"
# ⚙️ Environment Variables Guide

Environment variables are like secret settings for your app. They tell your application how to connect to your database and other services, without exposing sensitive information in your code.

## What Are Environment Variables?

Think of environment variables as a secure way to store:
- Database connection details
- API keys
- Passwords
- Configuration settings

They're called "environment" variables because they can be different in different environments (development, testing, production).

## Required Environment Variables

Your PlaygroundExplorer app needs these environment variables to work:

### 1. NEXT_PUBLIC_SUPABASE_URL
- **What it is**: The web address of your Supabase database
- **Example**: \`https://abcdefghijklmnop.supabase.co\`
- **Where to find it**: Supabase Dashboard → Settings → API → Project URL
- **Why it's public**: The \`NEXT_PUBLIC_\` prefix means this is safe to expose to users' browsers

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **What it is**: A public key that allows your app to connect to Supabase
- **Example**: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0ODAwMCwiZXhwIjoxOTUyMTI0MDAwfQ.signature\`
- **Where to find it**: Supabase Dashboard → Settings → API → anon public
- **Why it's public**: This key is designed to be public and has limited permissions

### 3. SUPABASE_SERVICE_ROLE_KEY
- **What it is**: A private key with admin access to your database
- **Example**: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NTQ4MDAwLCJleHAiOjE5NTIxMjQwMDB9.different-signature\`
- **Where to find it**: Supabase Dashboard → Settings → API → service_role secret
- **⚠️ IMPORTANT**: This is SECRET! Never share it publicly or commit it to GitHub

## How to Set Environment Variables

### For Local Development

If you want to run the app on your computer:

1. Create a file called \`.env.local\` in your project root
2. Add your variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
\`\`\`

3. **NEVER** commit this file to GitHub (it should be in your \`.gitignore\`)

### For Vercel Deployment

When deploying to Vercel:

1. Go to your Vercel project dashboard
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add each variable:
   - **Name**: Exactly as shown above
   - **Value**: Your actual key from Supabase
   - **Environment**: Production (and Preview if you want)
5. Click **"Save"**

## Security Best Practices

### ✅ DO:
- Keep your service role key secret
- Use the \`.env.local\` file for local development
- Add \`.env*\` to your \`.gitignore\` file
- Regenerate keys if you accidentally expose them

### ❌ DON'T:
- Commit environment variables to GitHub
- Share your service role key with anyone
- Use production keys in development
- Hard-code sensitive values in your code

## Troubleshooting Environment Variables

### "Supabase client not initialized" error
- Check that your \`NEXT_PUBLIC_SUPABASE_URL\` is correct
- Verify your \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` is set

### "Invalid API key" error
- Double-check you copied the keys correctly (they're very long!)
- Make sure there are no extra spaces
- Verify you're using the right keys for the right environment

### App works locally but not on Vercel
- Check that you've added all environment variables to Vercel
- Make sure the variable names match exactly (case-sensitive!)
- Redeploy after adding environment variables

### How to check if variables are set correctly

Add this to any page temporarily to debug:

\`\`\`javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
\`\`\`

**Remove this code before going live!**

## Environment Variable Checklist

Before deploying, make sure:

- [ ] You have all three required environment variables
- [ ] Keys are copied correctly from Supabase (no typos)
- [ ] Variables are added to Vercel
- [ ] \`.env.local\` is in your \`.gitignore\`
- [ ] You haven't committed any secrets to GitHub

## Getting Your Keys from Supabase

### Step-by-step:

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your project
4. Click **"Settings"** (gear icon in sidebar)
5. Click **"API"**
6. Copy the values:
   - **Project URL** → \`NEXT_PUBLIC_SUPABASE_URL\`
   - **anon public** → \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - **service_role secret** → \`SUPABASE_SERVICE_ROLE_KEY\`

## 🆘 Need Help?

If you're having trouble with environment variables:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Verify your Supabase setup is complete
3. Make sure you're copying the full keys (they're very long!)
4. Try redeploying after setting variables

---

**Remember**: Environment variables are the bridge between your app and your database. Get them right, and everything else will work smoothly! 🌉
\`\`\`

```md project="Playground Explorer" file="docs/DEVELOPMENT.md" type="markdown"
# 🔧 Development Guide - Running Locally

Want to make changes to your PlaygroundExplorer app? This guide will help you set up a development environment on your computer so you can test changes before deploying them live.

## Why Develop Locally?

Running the app on your computer lets you:
- Make changes and see them instantly
- Test new features safely
- Debug issues without affecting live users
- Learn how the code works

## Prerequisites

Before you start, you'll need to install some software on your computer.

### Required Software

#### 1. Node.js (JavaScript Runtime)
- **What it is**: The engine that runs your app
- **Download**: [nodejs.org](https://nodejs.org)
- **Which version**: Download the "LTS" version (recommended)
- **How to install**: 
  - Windows/Mac: Download and run the installer
  - Follow the setup wizard (default settings are fine)

#### 2. Code Editor (Optional but Recommended)
- **VS Code**: [code.visualstudio.com](https://code.visualstudio.com) (free, most popular)
- **Other options**: Sublime Text, Atom, or any text editor

#### 3. Git (Version Control)
- **What it is**: Tool for managing code changes
- **Download**: [git-scm.com](https://git-scm.com)
- **Installation**: Use default settings

## Step 1: Get the Code

### Option A: Download from GitHub
1. Go to your GitHub repository
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to a folder on your computer

### Option B: Clone with Git (Recommended)
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to where you want the project:
   \`\`\`bash
   cd Desktop  # or wherever you want the folder
   \`\`\`
3. Clone your repository:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/playground-explorer.git
   cd playground-explorer
   \`\`\`

## Step 2: Install Dependencies

Dependencies are like ingredients for your app - other people's code that your app needs to work.

1. Open Terminal/Command Prompt in your project folder
2. Run this command:
   \`\`\`bash
   npm install
   \`\`\`
3. Wait for it to finish (might take 2-3 minutes)
4. You'll see a new \`node_modules\` folder appear

## Step 3: Set Up Environment Variables

Your local app needs to connect to your Supabase database.

1. Create a file called \`.env.local\` in your project root
2. Add your Supabase credentials:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
\`\`\`

**Where to find these values**: See the [Environment Variables Guide](ENVIRONMENT_VARIABLES.md)

## Step 4: Start the Development Server

1. In your terminal, run:
   \`\`\`bash
   npm run dev
   \`\`\`
2. You'll see output like:
   \`\`\`
   ▲ Next.js 14.0.0
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.100:3000
   \`\`\`
3. Open your browser and go to: \`http://localhost:3000\`
4. You should see your PlaygroundExplorer app running!

## Step 5: Making Changes

Now you can edit the code and see changes instantly!

### Try This:
1. Open \`app/page.tsx\` in your code editor
2. Find the line with "Discover Amazing Playgrounds!"
3. Change it to "Find the Best Playgrounds!"
4. Save the file
5. Look at your browser - it should update automatically!

## Project Structure Explained

Here's what each folder does:

\`\`\`
playground-explorer/
├── app/                    # Your app pages
│   ├── page.tsx           # Home page (what users see first)
│   ├── search/            # Search page
│   │   └── page.tsx       # Search functionality
│   ├── playground/        # Individual playground pages
│   │   └── [id]/          # Dynamic pages for each playground
│   │       └── page.tsx   # Playground details
│   ├── add-playground/    # Add new playground
│   │   └── page.tsx       # Form to add playgrounds
│   ├── profile/           # User profile
│   │   └── page.tsx       # User's ratings, photos, etc.
│   ├── layout.tsx         # Shared layout for all pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI pieces
│   └── ui/               # Pre-built components (buttons, cards, etc.)
├── lib/                   # Utility functions
├── scripts/               # Database setup scripts
├── docs/                  # Documentation (like this file!)
├── package.json           # Project configuration and dependencies
├── tailwind.config.ts     # Styling configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.mjs        # Next.js configuration
\`\`\`

## Common Development Tasks

### Adding a New Page
1. Create a new folder in \`app/\`
2. Add a \`page.tsx\` file
3. Export a React component

Example - adding an "About" page:
\`\`\`typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About PlaygroundExplorer</h1>
      <p>We help families find amazing playgrounds!</p>
    </div>
  )
}
\`\`\`

### Modifying Styles
- Global styles: Edit \`app/globals.css\`
- Component styles: Use Tailwind CSS classes
- Custom components: Edit files in \`components/ui/\`

### Adding New Features
1. Plan your feature
2. Create or modify the necessary components
3. Test locally
4. Commit your changes
5. Push to GitHub (triggers automatic deployment)

## Development Workflow

### Daily Workflow:
1. **Start your day**: \`npm run dev\`
2. **Make changes**: Edit files in your code editor
3. **Test changes**: Check \`http://localhost:3000\`
4. **Save progress**: Commit changes to Git
5. **Deploy**: Push to GitHub when ready

### Git Commands (Basic):
\`\`\`bash
# See what files you've changed
git status

# Add files to be committed
git add .

# Commit your changes
git commit -m "Add new feature: playground search filters"

# Push to GitHub (triggers deployment)
git push
\`\`\`

## Debugging Tips

### App Won't Start?
- Check that Node.js is installed: \`node --version\`
- Make sure you ran \`npm install\`
- Verify your \`.env.local\` file exists and has the right values

### Changes Not Showing?
- Make sure you saved the file
- Check the terminal for error messages
- Try refreshing your browser
- Restart the dev server (\`Ctrl+C\` then \`npm run dev\`)

### Database Errors?
- Check your environment variables
- Verify your Supabase project is running
- Look at the browser console for error messages

### Styling Issues?
- Remember to use Tailwind CSS classes
- Check that your changes are in the right file
- Use browser developer tools to inspect elements

## Testing Your Changes

Before deploying:

1. **Test all pages**: Click through your entire app
2. **Test on mobile**: Use browser dev tools to simulate mobile
3. **Check console**: Look for any error messages
4. **Test with real data**: Try adding playgrounds, ratings, etc.

## Deploying Your Changes

When you're happy with your changes:

1. **Commit your changes**:
   \`\`\`bash
   git add .
   git commit -m "Describe what you changed"
   \`\`\`

2. **Push to GitHub**:
   \`\`\`bash
   git push
   \`\`\`

3. **Automatic deployment**: Vercel will automatically deploy your changes!

4. **Check the live site**: Visit your Vercel URL to see the changes

## 🆘 Getting Help

### Common Issues:
- **Port 3000 already in use**: Try \`npm run dev -- --port 3001\`
- **Module not found**: Run \`npm install\` again
- **Permission errors**: Try running terminal as administrator

### Resources:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Getting Unstuck:
1. Read the error message carefully
2. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
3. Search for the error on Google
4. Ask for help on GitHub Issues

## 🎉 You're Ready to Develop!

You now have everything you need to:
- Run the app locally
- Make changes and see them instantly
- Test new features
- Deploy updates to your live site

**Happy coding!** 👨‍💻👩‍💻

---

**Next Steps**: Try making a small change to see the development workflow in action!
\`\`\`

```md project="Playground Explorer" file="docs/TROUBLESHOOTING.md" type="markdown"
# ❓ Troubleshooting Guide

Having issues with your PlaygroundExplorer app? Don't worry! This guide covers the most common problems and how to fix them, explained in simple terms.

## 🚨 Common Issues & Solutions

### 1. App Won't Load / White Screen

**Symptoms:**
- Blank white page
- "Application error" message
- Page never finishes loading

**Possible Causes & Solutions:**

#### Missing Environment Variables
**Check:** Are your environment variables set correctly?

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure you have all three:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - \`SUPABASE_SERVICE_ROLE_KEY\`
3. Redeploy your app after adding variables

#### Wrong Environment Variable Values
**Check:** Are your Supabase keys correct?

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the values again (they're very long!)
3. Update them in Vercel
4. Redeploy

### 2. Database Connection Errors

**Symptoms:**
- "Failed to fetch" errors
- "Invalid API key" messages
- Data not loading

**Solutions:**

#### Check Supabase Project Status
1. Go to your Supabase dashboard
2. Make sure your project shows as "Active" (green dot)
3. If it's paused, click "Resume"

#### Verify Database Tables
1. Supabase Dashboard → Table Editor
2. Check that you have these tables:
   - users
   - playgrounds
   - rating_categories
   - ratings
   - user_photos
   - user_favorites
3. If missing, run the setup SQL scripts again

#### Check API Keys
1. Supabase Dashboard → Settings → API
2. Copy the keys again
3. Make sure you're using:
   - **Project URL** for \`NEXT_PUBLIC_SUPABASE_URL\`
   - **anon public** for \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - **service_role secret** for \`SUPABASE_SERVICE_ROLE_KEY\`

### 3. Build Failures on Vercel

**Symptoms:**
- "Build failed" message
- Red X on deployment
- Error logs in Vercel

**Common Build Errors:**

#### TypeScript Errors
**Error:** "Type 'X' is not assignable to type 'Y'"

**Fix:**
1. Check the error details in Vercel logs
2. Fix the TypeScript issues in your code
3. Test locally first: \`npm run build\`

#### Missing Dependencies
**Error:** "Module not found: Can't resolve 'package-name'"

**Fix:**
1. Make sure \`package.json\` includes all dependencies
2. Check that the package name is spelled correctly
3. Redeploy

#### Environment Variable Issues
**Error:** Build succeeds but app doesn't work

**Fix:**
1. Double-check all environment variables in Vercel
2. Make sure there are no typos
3. Verify the values are correct

### 4. Authentication Issues

**Symptoms:**
- Can't sign up or log in
- "Invalid credentials" errors
- Redirect loops

**Solutions:**

#### Check Auth Configuration
1. Supabase Dashboard → Authentication → Settings
2. Verify **Site URL** is set to your domain:
   - \`https://your-app-name.vercel.app\`
3. Check **Redirect URLs** include:
   - \`https://your-app-name.vercel.app/auth/callback\`

#### Email Confirmation Issues
1. Check your email spam folder
2. Supabase Dashboard → Authentication → Settings
3. Make sure "Enable email confirmations" is ON

### 5. Photo Upload Problems

**Symptoms:**
- Photos won't upload
- "Permission denied" errors
- Images not displaying

**Solutions:**

#### Check Storage Bucket
1. Supabase Dashboard → Storage
2. Make sure \`playground-photos\` bucket exists
3. Verify it's set to **Private**

#### Check Storage Policies
1. Click on your bucket → Policies
2. You should have policies for:
   - Users can upload their own photos
   - Users can view their own photos
3. If missing, recreate them (see Supabase Setup guide)

### 6. Search Not Working

**Symptoms:**
- Search returns no results
- Search box doesn't respond
- Filters don't work

**Solutions:**

#### Check Sample Data
1. Supabase Dashboard → Table Editor → playgrounds
2. Make sure you have sample playgrounds
3. If empty, run the seed data SQL script

#### Verify Database Indexes
1. The search uses text indexes
2. Make sure the setup SQL script ran completely
3. Check for any error messages in SQL editor

### 7. Local Development Issues

**Symptoms:**
- \`npm run dev\` fails
- "Port already in use" errors
- Changes not showing

**Solutions:**

#### Node.js Issues
**Check Node.js version:**
\`\`\`bash
node --version
\`\`\`
Should be 18.0.0 or higher.

**Reinstall dependencies:**
\`\`\`bash
rm -rf node_modules
rm package-lock.json
npm install
\`\`\`

#### Port Issues
**Error:** "Port 3000 already in use"

**Fix:**
\`\`\`bash
# Use a different port
npm run dev -- --port 3001

# Or kill the process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
\`\`\`

#### Environment Variables for Local Development
1. Create \`.env.local\` file in project root
2. Add your Supabase credentials
3. Make sure \`.env.local\` is in \`.gitignore\`

### 8. Deployment Issues

**Symptoms:**
- Vercel deployment fails
- App works locally but not online
- "Function timeout" errors

**Solutions:**

#### Check Vercel Logs
1. Vercel Dashboard → Your Project → Functions
2. Look for error messages
3. Check both build logs and function logs

#### Redeploy
Sometimes a simple redeploy fixes issues:
1. Vercel Dashboard → Your Project → Deployments
2. Click the three dots on latest deployment
3. Click "Redeploy"

#### Check Domain Settings
1. Make sure your custom domain (if any) is configured correctly
2. Verify SSL certificate is active

## 🔍 How to Debug Issues

### Step 1: Check Browser Console
1. Open your app in browser
2. Press F12 (or right-click → Inspect)
3. Click "Console" tab
4. Look for red error messages

### Step 2: Check Network Tab
1. In browser dev tools, click "Network" tab
2. Refresh the page
3. Look for failed requests (red entries)
4. Click on failed requests to see details

### Step 3: Check Vercel Logs
1. Vercel Dashboard → Your Project
2. Click on latest deployment
3. Check "Build Logs" and "Function Logs"
4. Look for error messages

### Step 4: Check Supabase Logs
1. Supabase Dashboard → Logs
2. Look for recent errors
3. Check API logs for failed requests

## 🆘 Getting Help

### Before Asking for Help:
1. Check this troubleshooting guide
2. Look at browser console errors
3. Check Vercel and Supabase logs
4. Try the solutions above

### When Asking for Help:
Include this information:
- What you were trying to do
- What happened instead
- Any error messages (exact text)
- Screenshots if helpful
- Your browser and operating system

### Where to Get Help:
- GitHub Issues on your repository
- Vercel Support (for deployment issues)
- Supabase Support (for database issues)
- Next.js Documentation
- Stack Overflow

## 📋 Quick Diagnostic Checklist

When something's not working, check these in order:

### ✅ Environment Variables
- [ ] All three variables set in Vercel
- [ ] Values copied correctly from Supabase
- [ ] No extra spaces or characters

### ✅ Supabase Setup
- [ ] Project is active (not paused)
- [ ] All database tables exist
- [ ] Sample data is loaded
- [ ] Storage bucket exists
- [ ] Auth settings configured

### ✅ Deployment
- [ ] Latest code pushed to GitHub
- [ ] Vercel build succeeded
- [ ] No TypeScript errors
- [ ] All dependencies in package.json

### ✅ Browser
- [ ] Hard refresh (Ctrl+F5)
- [ ] Clear browser cache
- [ ] Try incognito/private mode
- [ ] Check console for errors

## 🔧 Emergency Reset

If everything is broken and you need to start fresh:

### Reset Supabase Database
1. Supabase Dashboard → Settings → General
2. Scroll to "Reset database password"
3. Or create a new project entirely

### Reset Vercel Deployment
1. Delete the project from Vercel
2. Reimport from GitHub
3. Set up environment variables again

### Reset Local Development
\`\`\`bash
# Delete everything and start over
rm -rf node_modules
rm package-lock.json
rm .next
npm install
npm run dev
\`\`\`

## 💡 Prevention Tips

### To Avoid Future Issues:
- Always test locally before deploying
- Keep your environment variables backed up
- Don't edit the database directly (use the app)
- Regularly check Supabase and Vercel dashboards
- Keep your dependencies updated

### Good Practices:
- Commit changes frequently
- Use descriptive commit messages
- Test on different devices/browsers
- Monitor your app after deployment

---

**Still stuck?** Don't give up! Every developer faces these issues. The key is methodical debugging and asking for help when needed. 🚀

**Remember:** Most issues are simple configuration problems that can be fixed quickly once you know what to look for!
\`\`\`

```md project="Playground Explorer" file="docs/CONTRIBUTING.md" type="markdown"
# 🤝 Contributing to PlaygroundExplorer

Thank you for your interest in contributing to PlaygroundExplorer! This guide will help you get started with contributing to the project, whether you're fixing bugs, adding features, or improving documentation.

## 🌟 Ways to Contribute

### For Everyone:
- 🐛 **Report bugs** - Found something broken? Let us know!
- 💡 **Suggest features** - Have ideas for improvements?
- 📝 **Improve documentation** - Help make our guides clearer
- 🎨 **Design feedback** - Suggestions for better user experience
- 🧪 **Test the app** - Use it and tell us what works/doesn't work

### For Developers:
- 🔧 **Fix bugs** - Help resolve reported issues
- ✨ **Add features** - Implement new functionality
- 🎨 **Improve UI/UX** - Make the app more beautiful and usable
- ⚡ **Performance improvements** - Make the app faster
- 🧹 **Code cleanup** - Refactor and improve code quality

## 🚀 Getting Started

### 1. Set Up Your Development Environment

Follow our [Development Guide](DEVELOPMENT.md) to:
- Install required software (Node.js, Git, code editor)
- Clone the repository
- Set up local environment variables
- Run the app locally

### 2. Understand the Project Structure

\`\`\`
playground-explorer/
├── app/                    # Next.js pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions
├── scripts/               # Database scripts
├── docs/                  # Documentation
└── README.md             # Project overview
\`\`\`

### 3. Choose What to Work On

#### Good First Issues:
- Fix typos in documentation
- Add new playground equipment types
- Improve error messages
- Add loading states
- Enhance mobile responsiveness

#### Intermediate Issues:
- Add new rating categories
- Implement search filters
- Add photo gallery features
- Improve accessibility
- Add data validation

#### Advanced Issues:
- Implement real-time features
- Add geolocation search
- Create admin dashboard
- Add data export features
- Implement caching

## 📋 Contribution Process

### 1. Before You Start

1. **Check existing issues** - Someone might already be working on it
2. **Create an issue** - Describe what you want to work on
3. **Get feedback** - Discuss your approach with maintainers
4. **Fork the repository** - Create your own copy to work on

### 2. Making Changes

#### Branch Naming Convention:
- `feature/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation
- `style/description` - For styling changes

Examples:
- `feature/add-playground-photos`
- `fix/search-not-working`
- `docs/improve-setup-guide`

#### Development Workflow:

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
