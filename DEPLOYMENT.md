# Deployment Guide

## Prerequisites
- GitHub account
- MongoDB Atlas account (free tier)
- Vercel/Netlify account (free tier)

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for development
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/timetracking
   ```

## Step 2: Deploy to Vercel

### Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings (auto-detected)
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A random secure string (use a password generator)

### Environment Variables in Vercel
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timetracking
JWT_SECRET=your-super-secret-random-string-min-32-chars
```

5. Deploy!

## Step 3: Deploy to Netlify

### Using Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Using Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.svelte-kit/netlify`
4. Add environment variables (same as Vercel)
5. Deploy!

## Step 4: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub repo
4. Add environment variables
5. Railway will auto-detect and deploy

## Step 5: Verify Deployment

After deployment:
1. Visit your deployment URL
2. Create a test account
3. Create a task
4. Start/stop timer
5. Check summary page

## Environment Variables Reference

### Development (.env file)
```env
MONGODB_URI=mongodb://localhost:27017/timetracking
JWT_SECRET=dev-secret-key-change-in-production
```

### Production (Deployment Platform)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timetracking
JWT_SECRET=use-a-secure-random-string-at-least-32-characters-long
```

## Generate Secure JWT Secret

### Using Node.js
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Using OpenSSL
```bash
openssl rand -hex 32
```

## Common Issues

### MongoDB Connection Error
- Check if IP is whitelisted (use 0.0.0.0/0 for testing)
- Verify connection string format
- Ensure database user has read/write permissions

### Build Fails
- Ensure all dependencies are in package.json
- Check Node.js version compatibility
- Review build logs for specific errors

### Timer Not Persisting
- Verify MongoDB connection
- Check browser cookies are enabled
- Ensure JWT_SECRET is set correctly

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test login/logout
- [ ] Create tasks
- [ ] Start/stop timers
- [ ] Verify timer persistence on refresh
- [ ] Check daily summary
- [ ] Test on mobile device
- [ ] Verify completed tasks are frozen

## Updating Deployment

### Vercel
Automatic deployment on git push to main branch

### Netlify
Automatic deployment on git push to main branch

### Manual Deploy
```bash
git add .
git commit -m "Update: description"
git push origin main
```

## Security Recommendations

1. **Never commit .env file** (already in .gitignore)
2. **Use strong JWT secret** (32+ characters)
3. **Limit MongoDB IP access** in production
4. **Enable HTTPS** (automatic on Vercel/Netlify)
5. **Regular dependency updates**: `npm audit fix`

## Monitoring

### Vercel Analytics
- Enable in project settings
- Monitor page views and performance

### MongoDB Atlas Monitoring
- Check database metrics
- Monitor connection count
- Review query performance

## Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test MongoDB connection
4. Review browser console errors

---

**Happy Deploying! 🚀**
