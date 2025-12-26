# Project TODO

## Completed (Initial Build)
- [x] Configure theme colors to match DFS Elite Learning Platform
- [x] Update tab bar with 5 tabs (Home, Goals, Tasks, Guides, Settings)
- [x] Build Home screen with dashboard stats and progress cards
- [x] Build Goals screen with goal setting functionality
- [x] Build Tasks screen with animated to-do list
- [x] Build Guides screen with instructional content
- [x] Build Settings screen with theme toggle
- [x] Add icon mappings for all tab icons
- [x] Generate custom app logo
- [x] Update app.config.ts with branding
- [x] Add celebration animations for task completion
- [x] Add haptic feedback for interactions

## Phase 1: Authentication & API Infrastructure
- [x] Install and configure @clerk/clerk-expo
- [x] Create sign-in screen with Clerk
- [x] Create sign-up screen with Clerk
- [x] Implement auth state persistence
- [x] Create auth layout wrapper
- [x] Build API client for backend integration
- [x] Configure API base URL (dfselitelearningplatform.vercel.app)

## Phase 2: API Hooks & Data Layer
- [x] Create useProgress hook for dashboard metrics
- [x] Create useFlashcards hook for iFlash system
- [x] Create useLessons hook for lessons browser
- [x] Create useAgentChat hook for AI tutoring
- [x] Create useExams hook for quiz/exam mode
- [x] Set up TanStack Query for API state management
- [x] Create storage helpers for AsyncStorage

## Phase 3: iFlash Flashcard System (CORE)
- [x] Build FlashCard base component
- [x] Build MCQCard component (multiple choice)
- [x] Build TermCard component (flip cards)
- [x] Implement SRS algorithm (difficulty, interval, reviewCount)
- [x] Create flashcard review flow
- [x] Add swipe gestures for navigation
- [x] Add card flip animations
- [ ] Implement Voice Q&A button
- [x] Track session stats (correct/incorrect, streak)
- [x] Update flashcards tab to use real API

## Phase 4: AI Tutoring Chat (CORE)
- [x] Build AgentChat component
- [x] Create agent selector (CoachBot, StudyBuddy, ProctorBot)
- [x] Implement message thread UI
- [x] Add typing indicators
- [ ] Show citation badges for source lessons
- [x] Add suggested prompts for each agent
- [x] Persist conversations to local storage
- [ ] Sync conversations with API
- [x] Add timestamps to messages

## Phase 5: Lessons Browser
- [x] Create lessons list screen grouped by Track/Module
- [x] Build LessonCard component
- [x] Create lesson detail view (lesson/[slug].tsx)
- [ ] Render lesson content (markdown)
- [x] Show checkpoints/sections
- [x] Track lesson progress
- [x] Display duration estimate and CE hours

## Phase 6: Dashboard with Real API Data
- [x] Fetch user metrics from /api/dashboard/user-metrics
- [x] Fetch course progress from /api/courses/progress
- [x] Display real overall progress percentage
- [x] Display real study streak
- [x] Display real iFlash cards due count
- [x] Display real CE hours (X/24)
- [ ] Show this week's activity from API

## Phase 7: Quiz/Exam Mode
- [x] Create exam screen (exam/[bankId].tsx)
- [x] Fetch question banks from API
- [x] Implement exam session start
- [x] Build question navigation
- [x] Add flag questions for review
- [x] Implement timed exam sessions
- [x] Show results summary with topic breakdown
- [x] Allow review of incorrect answers

## Phase 8: RevenueCat Monetization
- [ ] Install RevenueCat SDK
- [ ] Configure entitlements for "premium" access
- [ ] Define products (Monthly, Annual subscription)
- [ ] Create paywall component (placeholder UI)
- [ ] Implement entitlement checks
- [ ] Wire infrastructure (don't gate features yet)

## Phase 9: Offline Support & Polish
- [ ] Cache flashcards for offline review
- [ ] Queue API calls when offline
- [ ] Sync when back online
- [ ] Show offline indicator
- [x] Polish animations with Reanimated
- [ ] Add glassmorphism effects to cards
- [ ] Implement premium fonts (Cinzel headers, Geist body)

## Phase 10: Profile Screen
- [x] Build profile screen with user info
- [x] Show user progress summary
- [x] Add settings/preferences
- [x] Add sign out functionality

