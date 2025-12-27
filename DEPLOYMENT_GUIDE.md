# DFS Elite Study Planner - Deployment Guide

## Quick Start with Expo Go

### What is Expo Go?
Expo Go is a free app that lets you test your React Native app on your phone without building an APK or IPA file. It's perfect for development and testing.

### Step 1: Install Expo Go
- **iOS**: Search for "Expo Go" on the App Store and install it
- **Android**: Search for "Expo Go" on Google Play and install it

### Step 2: Scan the QR Code
1. Open the Expo Go app on your phone
2. Tap the "Scan QR Code" button
3. Point your camera at the QR code displayed in the Preview panel
4. The app will load on your phone

### Step 3: Test the App
- Sign in with your Clerk account
- Explore all features: flashcards, lessons, quizzes, AI tutors, notifications, profile
- Test offline functionality by turning off WiFi/mobile data
- Try voice features (requires ElevenLabs API key)

---

## Building for Production

### Option 1: Expo Application Services (EAS)

#### Prerequisites
- Expo account (free at expo.dev)
- EAS CLI installed: `npm install -g eas-cli`

#### Build for iOS
```bash
eas build --platform ios
```

#### Build for Android
```bash
eas build --platform android
```

#### Submit to App Stores
```bash
eas submit --platform ios
eas submit --platform android
```

### Option 2: Self-Hosted Build

#### Build APK (Android)
```bash
eas build --platform android --local
```

#### Build IPA (iOS)
Requires macOS with Xcode installed:
```bash
eas build --platform ios --local
```

---

## Environment Variables Required

Before deploying, ensure these are set:

| Variable | Purpose | Where to Get |
|----------|---------|-------------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | User authentication | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Backend auth | Clerk Dashboard |
| `DATABASE_URL` | Neon database | Neon Console |
| `NEON_DATABASE_URL` | Backup database URL | Neon Console |
| `EXPO_PUBLIC_ELEVENLABS_API_KEY` | Voice synthesis | ElevenLabs Dashboard |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | Subscription billing | RevenueCat Dashboard |

---

## Testing Checklist

### Authentication
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Password reset flow

### Core Features
- [ ] View dashboard with metrics
- [ ] Review flashcards (iFlash)
- [ ] Take quizzes
- [ ] View lessons
- [ ] Chat with AI tutors
- [ ] View profile and achievements

### Offline Features
- [ ] Turn off internet
- [ ] Submit flashcard reviews (should queue)
- [ ] Submit quiz answers (should queue)
- [ ] Turn on internet
- [ ] Verify queued actions sync

### Notifications
- [ ] Enable daily reminders
- [ ] Set reminder time
- [ ] Receive test notification

### Voice Features
- [ ] Record voice input
- [ ] Hear AI tutor responses
- [ ] Play/pause/stop audio

### Monetization
- [ ] View paywall
- [ ] Start free trial (if configured)
- [ ] View subscription options

---

## Troubleshooting

### App Won't Load
- Ensure all environment variables are set
- Check internet connection
- Clear Expo cache: `expo cache clean`
- Restart Expo Go app

### Authentication Fails
- Verify Clerk keys are correct
- Check Clerk dashboard for API limits
- Ensure user exists in Clerk

### Database Connection Error
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure SSL mode is enabled

### Voice Not Working
- Verify ElevenLabs API key is set
- Check internet connection
- Ensure audio permissions are granted
- Test with different voice ID

### Notifications Not Received
- Check notification permissions are granted
- Verify push token is registered
- Check notification service is initialized
- Test with manual notification trigger

---

## Performance Optimization

### Bundle Size
```bash
# Analyze bundle size
npx expo-bundle-analyzer
```

### Runtime Performance
- Use React DevTools Profiler
- Monitor network requests
- Check memory usage on low-end devices

### Caching Strategy
- Flashcard reviews cached locally
- Voice responses cached for 7 days
- Database queries cached for 5 minutes

---

## Security Checklist

- [ ] All API keys stored as environment variables
- [ ] SSL/TLS enabled for database
- [ ] Clerk authentication enabled
- [ ] User data encrypted in transit
- [ ] No sensitive data logged
- [ ] Rate limiting enabled on API
- [ ] Input validation on all forms

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in Expo CLI
3. Check Clerk, Neon, and ElevenLabs dashboards
4. Contact support for the respective service

---

## Next Steps

1. **Set up RevenueCat**: Create subscription products in RevenueCat dashboard
2. **Configure ElevenLabs**: Set up voice IDs and test text-to-speech
3. **Test on devices**: Use Expo Go to test on real iOS and Android devices
4. **Submit to app stores**: Use EAS to build and submit to App Store and Google Play
