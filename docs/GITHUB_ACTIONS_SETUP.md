# GitHub Actions Deployment Setup

This guide will help you set up automatic deployment to Vercel using GitHub Actions.

## 🚀 Quick Setup

### 1. Create GitHub Repository

1. **Create a new repository** on GitHub
2. **Push your code** to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

### 2. Set up Vercel Project

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Get your Vercel credentials**:
   ```bash
   vercel env ls
   # Note down the ORG_ID and PROJECT_ID from the output
   ```

### 3. Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | Run `vercel token` in terminal |
| `VERCEL_ORG_ID` | Your Vercel organization ID | From `vercel link` output or dashboard |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | From `vercel link` output or dashboard |
| `NEON_DATABASE_URL` | Your Neon database connection string | From your Neon dashboard |

### 4. Get Vercel Credentials

#### Method 1: Using Vercel CLI
```bash
# Get token
vercel token

# Get org and project IDs
vercel link
# This will show you the ORG_ID and PROJECT_ID
```

#### Method 2: From Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Go to **Settings** → **General**
3. Find **Project ID** and **Team ID** (ORG_ID)

## 🔧 Workflow Files

This repository includes three workflow files:

### 1. `deploy.yml` - Full Deployment Workflow
- ✅ Builds React app
- ✅ Deploys to Vercel
- ✅ Comments on PRs with deployment URLs
- ✅ Uses Vercel CLI for deployment

### 2. `deploy-simple.yml` - Simple Deployment Workflow
- ✅ Uses Vercel Action for easier setup
- ✅ Builds and deploys
- ✅ Comments on PRs

### 3. `test.yml` - Testing Workflow
- ✅ Runs tests and builds
- ✅ Uploads build artifacts
- ✅ Validates code before deployment

## 🎯 Choose Your Workflow

### Option A: Use Simple Deployment (Recommended for beginners)

1. **Delete the complex workflow**:
   ```bash
   rm .github/workflows/deploy.yml
   ```

2. **Keep the simple one**:
   - `deploy-simple.yml` will be used automatically

### Option B: Use Full Deployment (More features)

1. **Delete the simple workflow**:
   ```bash
   rm .github/workflows/deploy-simple.yml
   ```

2. **Keep the full one**:
   - `deploy.yml` will be used automatically

## 🚀 How It Works

### Automatic Deployment Triggers

- **Push to main/master**: Deploys to production
- **Pull Request**: Creates preview deployment
- **Push to other branches**: No automatic deployment

### Deployment Process

1. **Code is pushed** to GitHub
2. **GitHub Actions triggers** the workflow
3. **Dependencies are installed**
4. **React app is built**
5. **App is deployed** to Vercel
6. **PR gets commented** with deployment URL (for PRs)

## 🔍 Monitoring Deployments

### GitHub Actions Tab
- Go to your repository → **Actions** tab
- See all workflow runs and their status
- Click on a run to see detailed logs

### Vercel Dashboard
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- See all deployments and their status
- Monitor performance and logs

## 🐛 Troubleshooting

### Common Issues

1. **"Vercel token not found"**
   - Make sure `VERCEL_TOKEN` secret is set correctly
   - Generate a new token: `vercel token`

2. **"Project not found"**
   - Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` secrets
   - Run `vercel link` to get correct IDs

3. **"Database connection failed"**
   - Verify `NEON_DATABASE_URL` secret is set
   - Check your Neon database is active

4. **"Build failed"**
   - Check the Actions logs for specific errors
   - Ensure all dependencies are in package.json

### Debug Commands

```bash
# Test locally
npm run build

# Check Vercel connection
vercel whoami

# Test deployment locally
vercel --prod
```

## 📋 Checklist

Before your first deployment:

- [ ] GitHub repository created and code pushed
- [ ] Vercel project linked (`vercel link`)
- [ ] All GitHub secrets configured
- [ ] Neon database created and connection string obtained
- [ ] Workflow file chosen (simple or full)
- [ ] First push to main branch

## 🎉 Success!

Once everything is set up:

1. **Push to main branch** → Automatic production deployment
2. **Create a PR** → Automatic preview deployment
3. **Check Actions tab** → See deployment status
4. **Visit your app** → https://your-app-name.vercel.app

## 🔄 Updating Your App

After the initial setup, updating is simple:

1. **Make changes** to your code
2. **Commit and push** to GitHub
3. **Deployment happens automatically**
4. **Check Actions tab** for status

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Neon Documentation](https://neon.tech/docs)

## 🆘 Support

If you encounter issues:

1. Check the GitHub Actions logs
2. Verify all secrets are set correctly
3. Test deployment locally with `vercel --prod`
4. Check Vercel dashboard for deployment status
