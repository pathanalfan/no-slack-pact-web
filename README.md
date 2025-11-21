# No Slack Pact Web

A commitment and accountability platform where users can create or join "pacts" (commitment groups) to track their activities and maintain consistency. The platform uses financial penalties as motivation to stick to commitments.

## Overview

**No Slack Pact** is a web application that helps users stay accountable to their goals through group commitments. Users can:
- Create or join pacts with specific rules and requirements
- Track daily activities and log their progress
- View weekly progress with visual indicators
- Face financial penalties for skipping days or leaving pacts

## Features

### 🎯 Pact Management
- **Create Pacts**: Set up commitment groups with custom rules
  - Minimum days per week requirement
  - Maximum activities per user
  - Financial penalties (skip fine & leave fine)
  - Optional start/end dates
- **Explore Pacts**: Browse and discover active pacts
- **Join Pacts**: Add activities and commit to pacts

### 📊 Activity Tracking
- Create multiple activities per pact (e.g., "Morning Run", "Meditation")
- Log activities daily with notes and images
- Track progress with visual progress bars
- Weekly calendar view showing all logged activities

### 📈 Progress Monitoring
- Real-time progress calculation (target days vs actual days)
- Weekly completion percentages
- Visual progress indicators on pact cards
- Auto-scrolling calendar to current day

### 🎨 User Experience
- Modern dark theme UI with gradient backgrounds
- Fully responsive design (mobile-first)
- Smooth animations and transitions
- Loading states and error handling
- Intuitive navigation and clear CTAs

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) with React 19
- **Language**: TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS 4
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom components built with Tailwind

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- Backend API running (set `NEXT_PUBLIC_API_URL` environment variable)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd no-slack-pact-web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
# Create a .env.local file
NEXT_PUBLIC_API_URL=your-api-url-here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # User authentication
│   ├── pacts/             # Pact listing and creation
│   └── pact/[id]/         # Pact details, activities, logs
├── components/             # Reusable UI components
│   ├── common/            # Button, Input, Textarea, etc.
│   └── pact/              # PactCard component
├── store/                 # Redux store and API
│   ├── api/               # RTK Query API endpoints
│   └── slices/            # Redux slices
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── constants/             # App constants
```

## Key Pages

- `/` - Home (redirects based on auth status)
- `/login` - User signup/login
- `/pacts` - List all active pacts
- `/pacts/create` - Create a new pact
- `/pact/[id]` - Pact detail page
- `/pact/[id]/week` - Weekly calendar view
- `/pact/[id]/activity/create` - Create activity
- `/pact/[id]/log/create` - Log activity
- `/pact/[id]/log/[logId]` - View activity log details

## API Integration

The application connects to a backend API for:
- User management (create, join pact)
- Pact CRUD operations
- Activity management
- Activity log tracking with images
- Progress calculation

Set the `NEXT_PUBLIC_API_URL` environment variable to point to your backend API.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)

## License

[Add your license here]
