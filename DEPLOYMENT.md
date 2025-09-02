# Deployment Guide

## Vercel Deployment (Frontend)

### Prerequisites

- Vercel account
- GitHub repository connected to Vercel

### Steps

1. **Connect Repository to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Build Settings**

   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**
   Add these environment variables in Vercel dashboard:

   ```
   VITE_API_URL=https://classbookmanagementfullstack.onrender.com
   VITE_APP_NAME=ClassBook Management
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Important Files for Vercel

- `vercel.json` - Configuration for routing and headers
- `_redirects` - Fallback routing (in public folder)
- `vite.config.ts` - Build configuration

## Render Deployment (Backend)

### Prerequisites

- Render account
- GitHub repository

### Steps

1. **Create New Web Service**

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**

   - **Name**: `classbook-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Environment Variables**
   Add these environment variables:

   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   CORS_ORIGIN_DEV=http://localhost:3000
   API_URL=https://your-backend-domain.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your backend

## Troubleshooting

### 404 Errors on Direct URL Access

If you get 404 errors when accessing routes directly (like `/login`), ensure:

1. `vercel.json` is in the root directory
2. `_redirects` file is in the `public` folder
3. The build completed successfully

### CORS Errors

If you get CORS errors:

1. Update `CORS_ORIGIN` in backend environment variables
2. Ensure the frontend URL is correctly set
3. Check that both services are deployed and accessible

### Build Failures

If builds fail:

1. Check that all dependencies are in `package.json`
2. Ensure TypeScript compilation passes
3. Verify environment variables are set correctly
