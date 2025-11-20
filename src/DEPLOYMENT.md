# SYMBI Synergy Platform - Deployment Guide

This guide provides comprehensive instructions for deploying the SYMBI Synergy Analytics Platform to various hosting providers.

## 🚀 Quick Deploy Options

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/s8ken/symbi-resonate)

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/s8ken/symbi-resonate)

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/SYMBI-Synergy)

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Supabase Account** - [Sign up at supabase.com](https://supabase.com)
2. **Git Repository** - Your code in a Git repository (GitHub, GitLab, etc.)
3. **Node.js 18+** - For local development and building

## 🔧 Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project name: `symbi-synergy-platform`
5. Set database password (save this securely)
6. Choose region closest to your users
7. Click "Create new project"

### 2. Configure Database

The platform uses a key-value store table. This is automatically created by the backend on first run, but you can manually create it:

```sql
-- This table is automatically created by the backend
-- No manual setup required for the KV store
```

### 3. Deploy Edge Function

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy the edge function:
   ```bash
   supabase functions deploy server
   ```

### 4. Get Project Credentials

1. Go to Project Settings → API
2. Copy your:
   - **Project URL** (e.g., `https://kpxjcstlivtkormpdnve.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **Service Role Key** (for backend functions)

## 🌐 Frontend Deployment

### Option 1: Vercel Deployment

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add these in Vercel environment settings:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Option 2: Netlify Deployment

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your Git provider and repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   Go to Site settings → Environment variables:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `https://your-app.netlify.app`

### Option 3: Manual Build & Deploy

1. **Build locally**
   ```bash
   npm install
   npm run build
   ```

2. **Upload dist folder**
   Upload the `dist` folder to any static hosting provider:
   - GitHub Pages
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Static Web Apps

## ⚙️ Configuration

### Update Supabase Configuration

After deployment, update your Supabase configuration:

1. Edit `/utils/supabase/info.tsx`:
   ```typescript
   export const projectId = "your-project-ref"
   export const publicAnonKey = "your-anon-key"
   ```

2. Or use environment variables (recommended):
   ```typescript
   export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "your-project-ref"
   export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key"
   ```

### Environment Variables

For production deployments, set these environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# For backend edge functions
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔒 Security Considerations

1. **Never expose Service Role Key** to the frontend
2. **Use Row Level Security (RLS)** for sensitive data
3. **Configure CORS** properly in Supabase
4. **Use HTTPS** for all deployments
5. **Rotate keys regularly** in production

## 📊 Monitoring & Analytics

### Health Checks

The backend provides health check endpoints:
- `GET /make-server-f9ece59c/health` - API health status
- Monitor response times and error rates

### Performance Monitoring

Consider adding:
- **Vercel Analytics** for frontend performance
- **Supabase Metrics** for backend monitoring
- **Error tracking** with Sentry or similar

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase CORS settings
   - Verify domain is whitelisted

2. **API Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Confirm edge function deployment

3. **Build Failures**
   - Check Node.js version (18+ required)
   - Clear npm cache: `npm cache clean --force`
   - Verify all dependencies are installed

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Verify API endpoints** in Network tab
3. **Test backend directly** using curl or Postman
4. **Check Supabase logs** in dashboard

## 📧 Support

For deployment issues:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Open an issue in the repository
4. Contact the development team

---

**Ready to deploy?** Choose your preferred hosting provider and follow the steps above to get SYMBI Synergy live!
