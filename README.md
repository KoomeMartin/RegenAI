# RegenAI

A comprehensive mental health and wellness platform built with modern web technologies. RegenAI provides AI-powered support, therapy booking, group sessions, and personalized learning resources.

## Features

- **AI Chat Support** - Real-time AI-powered conversations for mental health guidance
- **Therapy Booking** - Connect with licensed therapists and schedule sessions
- **Group Sessions** - Join community-driven support groups and discussions
- **Assessments** - Complete mental health assessments and track progress
- **Journaling** - Private journaling with progress insights
- **Learning Hub** - Educational content on mental health and wellness topics
- **Referral System** - Share and track referrals within the platform
- **Analytics** - Personal health metrics and progress tracking
- **User Dashboard** - Centralized hub for managing all activities
- **Notifications** - Real-time updates on sessions and messages

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for file uploads)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd RegenAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
app/
├── api/              # API routes
├── dashboard/        # Main dashboard
├── therapy/          # Therapy booking
├── group-sessions/   # Group sessions
├── assessments/      # Health assessments
├── learn/            # Learning hub
├── journal/          # Journal section
├── ai-support/       # AI chat interface
└── profile/          # User profile

components/
├── ui/              # Shadcn/UI components
└── [feature]/       # Feature-specific components

lib/
├── auth.ts          # Authentication utilities
├── db.ts            # Database utilities
└── types.ts         # TypeScript types
```

## Database Schema

The application uses Prisma with PostgreSQL. Key models include:
- **User** - User accounts with roles (user, therapist, admin)
- **AISession** - AI chat conversations
- **TherapyBooking** - Therapy session bookings
- **GroupSession** - Community group sessions
- **Assessment** - Health assessments
- **Journal** - User journal entries
- **Notification** - User notifications

## Contributing

Contributions are welcome! Please ensure code follows the project's ESLint configuration.

## License

Private project. All rights reserved.
