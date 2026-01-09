# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/timetracking
JWT_SECRET=your-secret-key-min-32-characters
```

### Step 3: Start MongoDB
If using local MongoDB:
```bash
# macOS/Linux
mongod

# Windows
mongod.exe
```

Or use MongoDB Atlas (cloud - free tier):
1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Use it in your .env file

### Step 4: Run the App
```bash
npm run dev
```

Visit: http://localhost:5173

### Step 5: Create Your First Account
1. Click "Sign Up"
2. Enter your name, email, and password
3. You'll be redirected to the dashboard

### Step 6: Create a Task
1. Type a task name in the input box at the bottom
2. Click "Add Task"
3. Your task appears in the list

### Step 7: Start Tracking Time
1. Click "Start Timer" on any task
2. Watch the timer run in real-time
3. Click "Stop Timer" when done
4. The time is automatically saved

### Step 8: View Your Summary
1. Click "Summary" in the header
2. See your daily statistics
3. View all time logs
4. Select different dates to view past activity

## 📱 Features to Try

### Task Management
- ✅ Create tasks
- ✅ Change task status (Pending → In Progress → Completed)
- ✅ Delete tasks (only non-completed ones)
- ✅ Completed tasks are frozen

### Time Tracking
- ⏱️ Start/stop timer for any task
- ⏱️ Only one timer can run at a time
- ⏱️ Timer persists on page refresh
- ⏱️ View total time per task

### Summary
- 📊 Daily time statistics
- 📊 Task status breakdown
- 📊 Complete time log history
- 📊 Select any date to view

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Port Already in Use
```
Port 5173 is already in use
```
**Solution:** Stop the existing process or use a different port
```bash
npm run dev -- --port 3000
```

### Login Not Working
**Solution:** 
1. Check MongoDB connection
2. Clear browser cookies
3. Verify .env file is loaded

## 📖 Next Steps

1. **Deploy to Production**
   - See DEPLOYMENT.md for full guide
   - Use Vercel, Netlify, or Railway

2. **Customize the App**
   - Modify colors in Svelte components
   - Add more task fields
   - Create weekly/monthly summaries

3. **Add Features**
   - Task categories/tags
   - Export to CSV
   - Productivity charts
   - Email reminders

## 💡 Tips

- **Timer Persistence**: The timer state is stored in MongoDB, so it persists even if you close the browser
- **Completed Tasks**: Once marked as completed, tasks cannot be edited or deleted
- **Auto Status Update**: Starting a timer automatically changes task status to "In Progress"
- **Date Selection**: Use the summary page to view activity from any past date

## 🆘 Need Help?

- Check the full README.md for detailed documentation
- Review DEPLOYMENT.md for deployment instructions
- Check the API endpoints in README.md
- Look at commit history for implementation details

---

**Happy Time Tracking! ⏰✨**
