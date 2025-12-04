# 🌐 Watch-Anime Website

This directory contains the frontend application for Watch-Anime, built with **Next.js 13+** (App Router) and **TypeScript**.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   - Database connection (MySQL)
   - NextAuth Secret
   - OAuth Providers (Google, Discord)

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📜 Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm start`: Runs the built app in production mode.
- `npm lint`: Runs ESLint to check for code quality issues.

## 📁 Project Structure

```
src/
├── app/                 # App Router pages and API routes
│   ├── api/            # Backend API endpoints
│   ├── anime/          # Anime details pages
│   ├── profile/        # User profile pages
│   └── ...
├── components/          # Reusable React components
│   ├── Player/         # Video player components
│   └── ...
├── lib/                 # Utility functions and configurations
│   ├── auth.ts         # NextAuth configuration
│   └── db.ts           # Database connection
└── styles/             # Global styles
```

## 🛠️ Key Technologies

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (if applicable) / CSS Modules
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **UI Components**: [MUI (Material UI)](https://mui.com/)

## 📖 Documentation

For full project documentation, including deployment and contribution guidelines, please refer to the [root README](../README.md).
