# GitHub & Vercel Setup Guide

This guide will help you set up the DFS Elite Study Planner mobile app on GitHub and Vercel for continuous deployment.

## What's Already Done

✅ Mobile app code pushed to GitHub  
✅ Vercel configuration file created  
✅ GitHub Actions CI/CD workflow configured  
✅ All tests passing (37 tests)

## Step 1: Connect GitHub to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your account
3. Click "Add New" → "Project"
4. Click "Import Git Repository"
5. Search for "dfs-elite-study-planner"
6. Click "Import"
7. Configure project settings (see Step 2)

### Option B: Using Vercel CLI

```bash
cd /home/ubuntu/dfs-elite-study-planner
vercel --prod
```

## Step 2: Configure Environment Variables in Vercel

In Vercel dashboard, go to your project settings and add these environment variables:

| Variable | Value | Source |
|----------|-------|--------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk key | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Your Clerk secret | Clerk Dashboard |
| `DATABASE_URL` | Your Neon URL | Neon Console |
| `NEON_DATABASE_URL` | Your Neon URL | Neon Console |
| `EXPO_PUBLIC_ELEVENLABS_API_KEY` | Your ElevenLabs key | ElevenLabs Dashboard |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | Your RevenueCat key | RevenueCat Dashboard |

## Step 3: Set Up GitHub Secrets for CI/CD

For automatic deployment on push, add these secrets to your GitHub repository:

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-key>
CLERK_SECRET_KEY=<your-clerk-secret>
DATABASE_URL=<your-neon-url>
NEON_DATABASE_URL=<your-neon-url>
EXPO_PUBLIC_ELEVENLABS_API_KEY=<your-elevenlabs-key>
EXPO_PUBLIC_REVENUECAT_API_KEY=<your-revenuecat-key>
```

### Getting Vercel Secrets

1. **VERCEL_TOKEN**: 
   - Go to vercel.com → Settings → Tokens
   - Create new token
   - Copy and save

2. **VERCEL_ORG_ID** & **VERCEL_PROJECT_ID**:
   - Go to your project in Vercel
   - Copy from URL: `vercel.com/<org-id>/<project-id>`
   - Or run: `vercel project list`

## Step 4: Verify Deployment

### Check GitHub Actions

1. Go to GitHub repo → Actions
2. You should see "Deploy to Vercel" workflow
3. On next push to main, it will:
   - Run all tests
   - Run type checking
   - Run linting
   - Deploy to Vercel if all pass

### Check Vercel Deployment

1. Go to vercel.com → Your Project
2. Click "Deployments"
3. You should see your deployment
4. Click to view live URL

## Step 5: Update Your DNS (Optional)

If you want a custom domain:

1. In Vercel project → Settings → Domains
2. Add your domain
3. Follow instructions to update DNS records
4. Vercel will verify and activate

## Understanding the Deployment

### What Gets Deployed?

- **Frontend**: React Native app (Expo)
- **Backend**: Express.js server
- **Database**: Connected to your Neon instance
- **Authentication**: Uses your Clerk project
- **Voice**: Uses your ElevenLabs API
- **Monetization**: Uses your RevenueCat account

### Deployment Flow

```
1. Push code to GitHub main branch
   ↓
2. GitHub Actions runs tests
   ↓
3. If tests pass, deploy to Vercel
   ↓
4. Vercel builds and deploys
   ↓
5. Live at your Vercel URL
```

### Environment Variables

- Vercel uses environment variables you set in dashboard
- GitHub Actions uses secrets you set in repository
- Both must have the same values for consistency

## Troubleshooting

### Deployment Failed

1. Check GitHub Actions logs:
   - Go to Actions → Latest workflow
   - Click on failed job
   - Read error message

2. Common issues:
   - Missing environment variables
   - Tests failing
   - Type errors
   - Linting errors

### Tests Failing

```bash
# Run tests locally
pnpm test

# Fix any failures
# Commit and push
git add .
git commit -m "Fix tests"
git push
```

### Environment Variables Not Working

1. Verify all variables are set in Vercel dashboard
2. Verify all variables are set in GitHub secrets
3. Redeploy: Go to Vercel → Deployments → Click redeploy button

### Can't Connect to Database

1. Check DATABASE_URL is correct
2. Verify Neon database is running
3. Check SSL mode is enabled
4. Test connection: `psql $DATABASE_URL`

## Monitoring Deployments

### Vercel Dashboard
- View deployment history
- Check build logs
- Monitor performance
- View analytics

### GitHub Actions
- View workflow runs
- Check test results
- Monitor deployment status
- View action logs

## Next Steps

1. ✅ Push to GitHub (done)
2. ✅ Configure Vercel (done)
3. ⏳ Set up environment variables
4. ⏳ Connect GitHub to Vercel
5. ⏳ Test first deployment
6. ⏳ Monitor deployments

## Useful Commands

```bash
# Test locally before pushing
pnpm test
pnpm check
pnpm lint

# Build locally
pnpm build

# Deploy to Vercel
vercel --prod

# View Vercel logs
vercel logs

# Check GitHub Actions
gh run list
gh run view <run-id>
```

## Documentation

- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Expo Deployment](https://docs.expo.dev/deploy/deploy-to-vercel/)

## Support

- **Vercel Support**: vercel.com/support
- **GitHub Support**: github.com/support
- **Email**: support@dfselitelearning.com

---

**Status**: Ready for deployment  
**Repository**: https://github.com/Fusion-Data-Company/dfs-elite-study-planner  
**Next**: Configure environment variables in Vercel dashboard
