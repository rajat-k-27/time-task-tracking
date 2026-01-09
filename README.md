# 🕐 Task & Time Tracking App

A full-stack task and time tracking application built with **SvelteKit** and **MongoDB**. Track your tasks, monitor time spent, and view daily productivity summaries with a clean, modern interface.

![Time Tracker](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

**Tech Stack:** SvelteKit • MongoDB • JWT Authentication • bcryptjs • Custom CSS

## **🚀 Live App Link:** https://time-task-tracking.vercel.app/

**🔗 Deployed App:** https://time-task-tracking.vercel.app/

> Replace with your actual deployment URL after deploying to Vercel, Netlify, or Railway

## 📸 Screenshots

![Auth page](<Screenshot 2026-01-09 215051.jpg>)
![Task page](<Screenshot 2026-01-09 215316.jpg>)
![Task timer](<Screenshot 2026-01-09 215338.jpg>)
![Summary Page](<Screenshot 2026-01-09 215452.jpg>)
![Time Logs](<Screenshot 2026-01-09 215508.jpg>)


## � Demo Video

Demo Video : https://drive.google.com/file/d/1na9wkkXq1TjW2ynXNsq0zKJCER6x65yu/view?usp=drive_link


## 🧪 Test Credentials (Optional)
After deployment, you can provide test credentials in your README:

```
Email: test@gmail.com
Password: test1234
```


## 🛠️ Tech Stack

**Frontend:**
- SvelteKit (JavaScript)
- Custom CSS (no frameworks)
- Responsive design

**Backend:**
- SvelteKit Server Routes
- MongoDB (Database)
- JWT (Authentication)
- bcryptjs (Password hashing)

**Deployment Ready:**
- Vercel / Netlify / Railway compatible


## �🌟 Features

### 🔐 **Authentication**
- Secure user signup and login
- JWT-based authentication with httpOnly cookies
- Password hashing with bcryptjs
- Protected routes and API endpoints

### ✅ **Task Management**
- Create tasks with title and description
- View, edit, update, and delete tasks
- Task status: Pending, In Progress, Completed
- Completed tasks can be deleted
- User-specific task isolation
- Chat-style sticky input at bottom

### ⏱️ **Real-Time Time Tracking**
- Start/stop timer for individual tasks
- **Multiple timers can run simultaneously** for different tasks
- Timer updates in real-time every second (HH:MM:SS format)
- **Timer persists across page refreshes, browser tabs, and navigation**
- **Status and delete buttons disabled while timer is active**
- Time log sessions stored in database
- View total time per task (including active timer time)
- **View all time log sessions per task**
- Expandable time logs with start/end times and duration
- **Timer state fully synchronized between database and UI**

### 📊 **Daily Summary**
- Select any date to view summary
- Total time tracked for the day
- **Shows all tasks created on selected date** (even without time logs)
- **Pending tasks properly displayed in summary**
- Complete time log history with sessions
- Visual statistics (Completed/In Progress/Pending)
- Time breakdown by task status

### 🎨 **Modern UI/UX**
- Clean, responsive design
- Mobile-friendly interface
- Dashboard with scrollable tasks
- **Sticky input at bottom (chat-app style)**
- **Individual timer display on each active task**
- Visual distinction for active/completed tasks
- Gradient backgrounds and smooth animations
- **Active timer count badge in header**
- **Expandable time logs per task**
- **Real-time UI updates with proper Svelte reactivity**

## ✨ Key Technical Highlights

### Timer Persistence Implementation
- **Database-driven state**: Timer state stored in MongoDB with `endTime: null` for active timers
- **Automatic recovery**: On page load, active timers are fetched and restored
- **Real-time sync**: Timer displays update every second using `setInterval`
- **Svelte reactivity**: Proper object reassignment ensures UI updates trigger correctly
- **Multiple timers**: Each task can have its own independent timer running simultaneously

### UI/UX Optimizations
- **Sticky input**: Bottom-fixed input container like modern chat apps (WhatsApp, Slack)
- **Reactive badges**: Timer count badge updates automatically via Svelte `$:` syntax
- **Conditional controls**: Status/delete buttons intelligently disable during active timers
- **Visual feedback**: Active tasks highlighted with gradient backgrounds and timer displays

### Data Architecture
- **Session-based tracking**: Each timer start/stop creates a time log entry
- **Cumulative totals**: Total time calculated from all completed sessions + active timer
- **User isolation**: All data scoped to authenticated user via JWT
- **Date-based summaries**: Efficient MongoDB queries for daily statistics


## � Quick Start

```bash
# Clone the repository
git clone https://github.com/rajat-k-27/time-task-tracking
cd time-tracking

# Install dependencies
npm install

# Set up environment variables
# Create .env file with MONGODB_URI and JWT_SECRET

# Run development server
npm run dev

# Visit http://localhost:5173
```

## 📦 Installation & Setup (Detailed)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/rajat-k-27/time-task-tracking
cd time-tracking
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/timetracking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timetracking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**

2. **Visit [Vercel](https://vercel.com)** and sign in

3. **Import your repository**

4. **Configure environment variables:**
   - Add `MONGODB_URI` (your MongoDB Atlas connection string)
   - Add `JWT_SECRET` (generate a secure random string)

5. **Deploy!** Vercel will automatically build and deploy your app


## 📁 Project Structure

```
time-tracking/
├── src/
│   ├── lib/
│   │   ├── models/
│   │   │   ├── User.js          # User model
│   │   │   ├── Task.js          # Task model
│   │   │   └── TimeLog.js       # TimeLog model
│   │   ├── db.js                # MongoDB connection
│   │   └── auth.js              # Authentication utilities
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signup/+server.js
│   │   │   │   ├── login/+server.js
│   │   │   │   └── logout/+server.js
│   │   │   ├── tasks/
│   │   │   │   ├── +server.js
│   │   │   │   └── [id]/+server.js
│   │   │   ├── timer/
│   │   │   │   ├── start/+server.js
│   │   │   │   ├── stop/+server.js
│   │   │   │   └── active/+server.js
│   │   │   ├── timelogs/
│   │   │   │   └── [taskId]/+server.js
│   │   │   └── summary/+server.js
│   │   ├── dashboard/+page.svelte
│   │   ├── summary/+page.svelte
│   │   ├── +page.svelte         # Login/Signup page
│   │   └── +layout.svelte
│   └── app.html
├── .env.example
├── package.json
└── README.md
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Timer
- `POST /api/timer/start` - Start timer for task
- `POST /api/timer/stop` - Stop active timer (accepts taskId)
- `GET /api/timer/active` - Get all active timers

### Time Logs & Summary
- `GET /api/timelogs/:taskId` - Get time logs for task
- `GET /api/summary?date=YYYY-MM-DD` - Get daily summary

## 🎯 Usage

### 1. **Sign Up / Login**
- Create an account or login with existing credentials
- Minimum password length: 6 characters

### 2. **Create Tasks**
- Enter task title and optional description in the sticky input at bottom
- Task is created with "Pending" status by default

### 3. **Start Timer**
- Click "▶ Start Timer" on any task
- Multiple timers can run simultaneously for different tasks
- Timer runs in real-time and **persists across page refreshes**
- Task status automatically changes to "In Progress"
- **Status dropdown and delete button are disabled while timer is active**

### 4. **View Time Logs**
- Click on "▶ X sessions" button to expand time logs
- View all tracking sessions with start/end times and duration
- See total time spent at a glance (including active time)

### 5. **Manage Tasks**
- Change status using dropdown **(disabled during active timer)**
- Delete any task including completed ones **(disabled during active timer)**
- Complete tasks to mark them as done
- All task operations are user-specific and secure

### 6. **View Summary**
- Click "Summary" in header
- Select date to view statistics
- See all tasks created on that date (even without time logs)
- View Pending, In Progress, and Completed task counts
- Complete time log history with session details

## 🔒 Security Features

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt
- User-specific data isolation
- Protected API routes
- Input validation on all endpoints

## 📱 Responsive Design

- Mobile-friendly layout
- Touch-optimized controls
- Adaptive grid system
- Compact navigation

## 🌐 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the .netlify folder
```

### Railway / Render
- Connect your GitHub repository
- Set environment variables
- Deploy automatically

**Important:** Make sure to set environment variables in your deployment platform:
- `MONGODB_URI`
- `JWT_SECRET`



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 👨‍💻 Author

Built as a demonstration of full-stack SvelteKit development with MongoDB.

---

**Live Demo:** https://time-task-tracking.vercel.app/

**Note:** Remember to update MongoDB URI and JWT secret for production use!
