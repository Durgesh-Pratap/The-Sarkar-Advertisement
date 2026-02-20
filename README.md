# 🎯 Sarkar Advertisement - User Login & Admin Dashboard System

A complete full-stack web application with user authentication, data management, and admin dashboard.

## ✨ Features

### User Features
- ✅ User Registration & Login
- ✅ Save data online (create, read, update, delete)
- ✅ Secure password storage with bcryptjs
- ✅ Session management

### Admin Features
- ✅ View all users
- ✅ See each user's data entries
- ✅ Search users by username or email
- ✅ View detailed user information
- ✅ Delete users and their data
- ✅ Dashboard with statistics

### Backend
- ✅ Express.js REST API
- ✅ SQLite database
- ✅ User authentication endpoints
- ✅ Data management endpoints
- ✅ Admin endpoints

## 📁 Project Structure

```
/workspaces/The-Sarkar-Advertisement/
├── server.js                    # Express backend server
├── package.json                 # Node dependencies
├── database.db                  # SQLite database (auto-created)
├── login.html                   # Login & Register page
├── dashboard.html               # User data management page
├── admin.html                   # Admin dashboard
└── README.md                    # This file
```

## 🚀 Setup & Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 3: Open in Browser

- **Login Page**: http://localhost:3000/login.html
- **User Dashboard**: http://localhost:3000/dashboard.html
- **Admin Dashboard**: http://localhost:3000/admin.html

## 👥 Default Admin Account

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change this admin password after first login!

## 💻 How to Use

### For Users

1. **Register**: Click "Register" button and create a new account
2. **Login**: Use your credentials to login
3. **Add Data**: Fill in the form with:
   - Title (required)
   - Description (optional)
   - Data Content (JSON, text, etc.)
4. **Manage Data**: Edit or delete your entries
5. **Logout**: Click logout when done

### For Admin

1. **Login**: Use admin account (admin/admin123)
2. **View All Users**: See a list of all registered users
3. **Search Users**: Find specific users by username or email
4. **View User Details**: Click "View Details" to see user's data
5. **Manage Users**: Delete users and their data
6. **Statistics**: View total users and data entries

## 🔗 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### User Data
- `POST /api/userdata` - Save new data
- `GET /api/userdata/:userId` - Get user's data
- `PUT /api/userdata/:id` - Update data entry
- `DELETE /api/userdata/:id` - Delete data entry

### Admin
- `GET /api/admin/users` - Get all users with their data
- `GET /api/admin/users/:userId` - Get specific user details
- `DELETE /api/admin/users/:userId` - Delete user and their data

## 🗄️ Database Schema

### Users Table
```sql
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password (hashed)
- isAdmin (0 or 1)
- createdAt (timestamp)
```

### UserData Table
```sql
- id (PRIMARY KEY)
- userId (FOREIGN KEY)
- title
- description
- data (JSON format)
- createdAt (timestamp)
- updatedAt (timestamp)
```

## 🔒 Security Features

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ SQLite database for reliable data storage
- ✅ Input validation on both frontend and backend
- ✅ CORS enabled for API access
- ✅ XSS prevention with HTML escaping

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Security**: bcryptjs, CORS
- **API**: RESTful JSON API

## 📝 Environment Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🐛 Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Delete `database.db` if corrupted
- Run `npm install` again

### Login fails
- Ensure server is running on `http://localhost:3000`
- Check browser console for errors
- Try the default admin account first

### CORS errors
- CORS is enabled on backend
- Clear browser cache
- Try a different browser

## 📞 Support

For issues or questions, please check:
1. Browser console (F12) for error messages
2. Server terminal for logs
3. Verify all files are in place

## 📄 License

This project is for educational purposes.

---

**Version**: 1.0.0  
**Last Updated**: February 2026
