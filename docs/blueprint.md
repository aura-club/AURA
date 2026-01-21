# **App Name**: AIREINO Nexus

## Core Features:

- Projects Showcase: Showcase club projects with title, excerpt, thumbnail, and detail view (gallery, description, team, links).
- Resource Hub: List plugins, research papers, 3D models, and blueprints.
- Opportunities Board: Display Events, Club Sessions and external Opportunities.
- Admin Panel: Admin approves/denies Join Requests, promotes members, toggles isApproved and canUpload for each user, and filters user requests by approval status.
- Member Panel: Members with canUpload permissions add/edit content. Members view Announcements. Only users approved by the admin (with isApproved: true in Firestore) can log in and access the Member Panel. Only members with canUpload: true should see the content submission forms (for projects, blogs, etc.).
- Join Us Form: Members apply through a form, storing data on Firestore as isApproved: false by default. The admin must approve them manually via the Admin Panel.
- Blog Post System: Manual blog post creation (title, content, author, image, date), using Firestore only. Includes tags or categories for filtering (e.g. workshop, project, personal experience).

## Style Guidelines:

- Primary color: Deep teal (#124559) for a professional and modern feel.
- Background color: Dark navy (#01161E) to provide contrast and a clean look.
- Accent color: Muted olive (#73956F) for highlights and calls to action.
- Headline font: 'Space Grotesk' sans-serif, for headings and short amounts of body text. Body font: 'Inter' sans-serif, for body text.
- Clean, minimalist icons related to aerospace, science, and club activities.
- Responsive grid layout for projects and resources.
- Subtle transitions and animations to enhance user experience without being distracting.