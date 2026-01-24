# AIREINO: Aerospace and Unmanned Research Association

The central hub for the AIREINO club (formerly AURA), managing memberships, projects, resources, and community engagement.

## Features
- **Membership System**: Join form with Division selection and screening quiz.
- **Divisions**: Aerodynamics, Avionics, Propulsion, Structures, and Elite.
- **Project Showcase**: Gallery of student projects with image uploads.
- **Resource Hub**: Shared plug-ins, papers, and blueprints.
- **Admin Dashboard**: Manage users, approvals, and content.

## Tech Stack
- Framework: **Next.js 14** (App Router)
- Language: **TypeScript**
- Styling: **Tailwind CSS** + **Shadcn/UI**
- Backend/Auth: **Firebase**
- Image Storage: **ImgBB** (Free Tier)

## Setup Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your ImgBB API Key (see below).
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables (Important!)

This project uses **ImgBB** for handling image uploads (Projects, Resources, Profile Pictures). You must configure the API key for uploads to work in production.

### Required Variable
- `NEXT_PUBLIC_IMGBB_API_KEY`: Your private API key from [ImgBB](https://api.imgbb.com/).

### How to Add to Vercel
1. Go to your project dashboard on Vercel.
2. Navigate to **Settings** > **Environment Variables**.
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_IMGBB_API_KEY`
   - **Value**: `62fe365ed7e7c6b483be867e6259eb79` (or your own key)
4. Click **Save**.
5. **Redeploy** your latest commit for changes to take effect.

### How to Add to Netlify
1. Go to your site dashboard on Netlify.
2. Navigate to **Site configuration** > **Environment variables**.
3. Click **Add a variable**.
   - **Key**: `NEXT_PUBLIC_IMGBB_API_KEY`
   - **Value**: `62fe365ed7e7c6b483be867e6259eb79` (or your own key)
4. Click **Create variable**.
5. Trigger a new deployment (or clear cache and deploy).
