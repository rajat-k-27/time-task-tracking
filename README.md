# 🕐 Task & Time Tracking App

A full-stack task and time tracking application built with **SvelteKit** and **MongoDB**. Track your tasks, monitor time spent, and view daily productivity summaries with a clean, modern interface.

![Time Tracker](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

## 🌟 Features

### 🔐 **Authentication**
- Secure user signup and login
- JWT-based authentication with httpOnly cookies
- Password hashing with bcryptjs
- Protected routes and API endpoints

### ✅ **Task Management**
- Create tasks with natural language input
- View, edit, update, and delete tasks
- Task status: Pending, In Progress, Completed
- Completed tasks are frozen (no edit/delete)
- User-specific task isolation

### ⏱️ **Real-Time Time Tracking**
- Start/stop timer for each task
- Timer updates in real-time (HH:MM:SS format)
- Timer persists across page refreshes
- Only one active timer at a time
- Time log sessions stored in database
- View total time per task

### 📊 **Daily Summary**
- Select any date to view summary
- Total time tracked for the day
- Tasks worked on with status breakdown
- Complete time log history
- Visual statistics (Completed/In Progress/Pending)

### 🎨 **Modern UI/UX**
- Clean, responsive design
- Mobile-friendly interface
- Dashboard with scrollable tasks
- Compact input (chat-style at bottom)
- Real-time timer display
- Visual distinction for completed tasks
- Gradient backgrounds and smooth animations

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

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone <your-repo-url>
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
- `POST /api/timer/stop` - Stop active timer
- `GET /api/timer/active` - Get active timer

### Time Logs & Summary
- `GET /api/timelogs/:taskId` - Get time logs for task
- `GET /api/summary?date=YYYY-MM-DD` - Get daily summary

## 🎯 Usage

### 1. **Sign Up / Login**
- Create an account or login with existing credentials
- Minimum password length: 6 characters

### 2. **Create Tasks**
- Enter task title in the input at the bottom
- Task is created with "Pending" status

### 3. **Start Timer**
- Click "Start Timer" on any task
- Timer runs in real-time and persists on refresh
- Task status automatically changes to "In Progress"

### 4. **Manage Tasks**
- Change status using dropdown
- Delete tasks (only non-completed)
- Complete tasks (they become frozen)

### 5. **View Summary**
- Click "Summary" in header
- Select date to view statistics
- See all time logs and task breakdown

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

## 🧪 Test Credentials (Optional)
After deployment, you can provide test credentials in your README:

```
Email: demo@example.com
Password: demo123
```

## 📝 Commit History

This project follows conventional commit messages:
- `feat:` - New features
- `ui:` - UI changes
- `fix:` - Bug fixes
- `docs:` - Documentation
- `refactor:` - Code refactoring

Each feature was committed separately for clear project history.

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

**Live Demo:** [Add your deployment URL here]

**Note:** Remember to update MongoDB URI and JWT secret for production use!
