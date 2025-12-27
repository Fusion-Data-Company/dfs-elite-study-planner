# DFS Elite Study Planner - Complete Mobile App

A comprehensive mobile learning platform for insurance professionals preparing for certification exams. Built with React Native, Expo, and integrated with your existing DFS Elite Learning Platform backend.

## Overview

DFS Elite Study Planner is a full-featured mobile app that brings your web platform to iOS and Android devices. Users can study on-the-go with flashcards, lessons, quizzes, and AI tutors, with full offline support and progress syncing.

## Key Features

### Core Learning Features
- **iFlash Spaced Repetition System** - 487+ flashcards with intelligent review scheduling
- **Interactive Lessons** - 100+ structured lessons with CE credit tracking
- **Practice Quizzes** - 8 question banks with detailed performance analytics
- **AI Tutoring** - Three specialized tutors (CoachBot, StudyBuddy, ProctorBot)
- **Voice Q&A** - Text-to-speech responses and voice input recording (Premium)

### User Experience
- **Dark Futuristic Theme** - Matches your web platform design
- **Offline Mode** - Study without internet, sync when reconnected
- **Achievement System** - 7 unlockable badges for motivation
- **Daily Reminders** - Customizable notifications to maintain study streak
- **Progress Tracking** - Detailed analytics and performance metrics

### Technical Features
- **Clerk Authentication** - Shared user accounts with web platform
- **Neon Database Integration** - Real-time data sync
- **RevenueCat Monetization** - Subscription billing infrastructure
- **Expo Push Notifications** - Daily study reminders
- **Offline Queue System** - Automatic sync when reconnected

## Architecture

### Tech Stack
- **Frontend**: React Native 0.81 + Expo SDK 54
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL
- **API**: Express.js backend (shared with web app)
- **Monetization**: RevenueCat
- **Voice**: ElevenLabs text-to-speech
- **Notifications**: Expo Push Notifications
- **State Management**: React Context + AsyncStorage

## Features Documentation

### iFlash Flashcards
- Spaced repetition algorithm optimizes review intervals
- Multiple card types: MCQ, flip cards, fill-in-the-blank
- Rating system: Again, Hard, Good, Easy
- Local review history tracking
- Offline support with sync on reconnect

### AI Tutors
- **CoachBot**: Study planning and goal setting
- **StudyBuddy**: Concept explanation and Q&A
- **ProctorBot**: Exam simulation and feedback
- Voice responses with ElevenLabs text-to-speech
- Chat history persistence
- Typing indicators and animations

### Lessons
- 100+ structured lessons organized by module
- Progress tracking per lesson
- CE credit hours display
- Checkpoint quizzes
- Offline content caching

### Quizzes & Exams
- 8 question banks
- Timed and untimed modes
- Question flagging/bookmarking
- Topic-based performance breakdown
- Detailed results and analytics
- Exam history tracking

### Offline Mode
- All content cached locally
- Queue system for reviews and submissions
- Automatic sync on reconnect
- Offline indicator in UI
- Works with all features

### Achievements
- 7 unlockable badges
- First Step, Card Master, Streak Warrior, Lesson Learner, Exam Passer, Perfect Score, CE Certified

### Notifications
- Daily study reminders
- Customizable reminder time
- Achievement notifications
- Quiz result notifications
- Streak update notifications

### Monetization
- Free tier with limited daily quizzes
- Premium monthly: $9.99/month
- Premium annual: $79.99/year (33% savings)
- 7-day free trial
- RevenueCat integration for billing

## Testing

### Run All Tests
```bash
pnpm test
```

### Test Coverage
- 37 tests passing
- Clerk authentication tests
- Neon database tests
- Component tests
- Hook tests

## Deployment

### Expo Go (Development)
```bash
pnpm dev
```

### EAS Build (Production)
```bash
eas build --platform ios
eas build --platform android
```

### App Store Submission
```bash
eas submit --platform ios
eas submit --platform android
```

## Documentation

- **USER_GUIDE.md** - Complete user documentation
- **DEPLOYMENT_GUIDE.md** - Deployment and testing guide
- **APP_STORE_METADATA.md** - App store descriptions and screenshots
- **design.md** - UI/UX design specifications

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | User authentication |
| `CLERK_SECRET_KEY` | Backend auth |
| `DATABASE_URL` | Neon database |
| `NEON_DATABASE_URL` | Backup database URL |
| `EXPO_PUBLIC_ELEVENLABS_API_KEY` | Voice synthesis |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | Subscription billing |

## Support

- **Documentation**: See docs/ folder
- **Email**: support@dfselitelearning.com
- **In-App Help**: Tap ? icon in any screen

---

**Version**: 1.0.0  
**Status**: Production Ready
