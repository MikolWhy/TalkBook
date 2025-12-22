# TalkBook

A personal journaling and habit tracking application built with Next.js. Track your daily habits, write journal entries, and build consistency with gamification features like XP and streaks.

**🌐 Live Demo:** [https://talk-book-1g2g.vercel.app/](https://talk-book-1g2g.vercel.app/)

## Features

- 📝 **Journal Entries** - Rich text editor for daily journaling with mood tracking
- 🎯 **Habit Tracking** - Create and track daily, weekly, or monthly habits (boolean or numeric)
- 📊 **Statistics & Insights** - View progress charts, streaks, and analytics
- 🎮 **Gamification** - Earn XP, level up, and track personal records
- 🔒 **Privacy** - PIN-protected lock screen for privacy
- 📱 **PWA Support** - Install as a Progressive Web App
- 🎨 **Customizable** - Choose from multiple background colors and themes

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS
- **Database:** IndexedDB (via Dexie.js)
- **Rich Text:** TipTap
- **State Management:** Zustand
- **Charts:** Recharts
- **NLP:** Compromise.js
- **PWA:** next-pwa

## Project Structure

For detailed architecture and directory structure, see [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md).

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TalkBook
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running Locally

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## How It Works

TalkBook is a client-side application that stores all data locally in your browser. No backend is required - everything runs in the browser for privacy and offline capability.

For detailed information about the architecture, data storage, and development guidelines, see [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md).

## License

This project is licensed under the **GNU AGPL v3** License. You must include the original copyright and license notice in any copies or derivative works. See the full [LICENSE](LICENSE) file for details.
