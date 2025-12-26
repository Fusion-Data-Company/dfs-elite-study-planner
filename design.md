# DFS Elite Study Planner - Mobile App Design Document

## Overview

This mobile app serves as a study planning companion for the DFS Elite Learning Platform. It helps users set learning goals, break them into manageable tasks, track progress, and provides instructions on how to use the main platform's features (flashcards, AI tutors, quizzes).

## Design Philosophy

The app follows Apple Human Interface Guidelines (HIG) and matches the existing DFS Elite Learning Platform's dark futuristic aesthetic with glassmorphic UI elements.

## Screen List

| Screen | Purpose |
|--------|---------|
| Home (Dashboard) | Overview of progress, stats, quick actions |
| Goals | Set and manage learning goals |
| Tasks | Daily/weekly task breakdown with animated checklist |
| Guides | Instructions for flashcards, AI tutors, tests |
| Settings | App preferences and theme toggle |

## Primary Content and Functionality

### Home Screen
The home screen displays overall progress percentage in a circular indicator, study streak counter with flame icon, iFlash cards due today, CE hours progress bar (X/24), quick action buttons for Goals, Tasks, and Guides, and recent activity summary.

### Goals Screen
Users can set target exam date, daily study time goals, weekly lesson completion targets, and CE hour milestones. Goals are displayed as cards with progress indicators.

### Tasks Screen
This screen shows an animated to-do list with daily tasks including lessons to complete, flashcards to review, and quizzes to take. Features swipe-to-complete gestures, celebration animations on completion, and priority indicators with color coding.

### Guides Screen
Provides instructional content organized as expandable cards covering how to use iFlash flashcards, AI tutor guide (CoachBot, StudyBuddy, ProctorBot), practice quiz tips, timed exam preparation, and CE tracking walkthrough.

### Settings Screen
Contains theme toggle (dark/light), notification preferences, and links to the main web platform.

## Key User Flows

### Setting a New Goal
User taps Goals tab, then taps "Add Goal" button, selects goal type (exam date, study time, lessons), enters target value and deadline, and confirms. Goal appears in list with progress indicator.

### Completing a Task
User views Tasks tab with daily checklist, taps or swipes task to mark complete, celebration animation plays, progress updates across app, and streak counter increments if daily goal met.

### Viewing Instructions
User taps Guides tab, selects topic (e.g., "Using Flashcards"), expandable card shows step-by-step instructions with tips and best practices.

## Color System

| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Background | #ffffff | #0a0b0f (hsl 222, 18%, 4%) |
| Surface | #f5f5f5 | #0f1114 (hsl 222, 22%, 6%) |
| Primary | #0ea5e9 | #00d4ff (hsl 195, 100%, 55%) |
| Secondary | #10b981 | #00e5a0 (hsl 167, 90%, 48%) |
| Accent | #f97316 | #e67635 (hsl 25, 85%, 50%) |
| Foreground | #11181C | #ecedee |
| Muted | #687076 | #9ba1a6 |
| Border | #e5e7eb | #1f2937 |
| Success | #22c55e | #4ade80 |
| Warning | #f59e0b | #fbbf24 |
| Error | #ef4444 | #f87171 |

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Screen Titles | System (SF Pro) | Bold | 28px |
| Section Headers | System (SF Pro) | Semibold | 20px |
| Card Titles | System (SF Pro) | Semibold | 17px |
| Body Text | System (SF Pro) | Regular | 15px |
| Captions | System (SF Pro) | Regular | 13px |

## Component Patterns

### Stat Cards
Rounded corners (16px), glassmorphic background with subtle border, icon with gradient background, large value text, and small label text.

### Task Items
Full-width with left checkbox, task title and subtitle, swipe actions for complete/delete, and animated state transitions.

### Progress Indicators
Circular progress for overall stats, horizontal bars for goal progress, and animated fill on value change.

### Action Buttons
Primary buttons use gradient background (cyan to teal), secondary buttons use surface background with border, and all buttons have haptic feedback on press.

## Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Task completion | 300ms | ease-out |
| Card press | 100ms | ease-in-out |
| Progress fill | 500ms | ease-out |
| Screen transition | 250ms | ease-in-out |
| Celebration confetti | 1000ms | spring |

## Tab Bar Configuration

| Tab | Icon | Label |
|-----|------|-------|
| Home | house.fill | Home |
| Goals | target | Goals |
| Tasks | checklist | Tasks |
| Guides | book.fill | Guides |
| Settings | gearshape.fill | Settings |
