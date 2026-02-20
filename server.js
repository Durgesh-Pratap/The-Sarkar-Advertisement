const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('.'));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('✓ Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS userdata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      data TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Create default admin
  const adminHash = bcryptjs.hashSync('admin123', 10);
  db.run(
    `INSERT OR IGNORE INTO users (username, email, password, isAdmin, createdAt) 
     VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
    ['admin', 'admin@sarkar.com', adminHash],
    (err) => {
      if (!err) console.log('✓ Default admin created (username: admin, password: admin123)');
    }
  );
});

// Routes

// 1. USER REGISTRATION
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  db.run(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    [username, email, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({ success: false, message: 'Username or email already exists' });
      }
      res.json({ success: true, message: 'Registration successful', userId: this.lastID });
    }
  );
});

// 2. USER LOGIN
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  db.get(
    `SELECT id, username, email, isAdmin FROM users WHERE username = ?`,
    [username],
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      db.get(
        `SELECT password FROM users WHERE username = ?`,
        [username],
        (err, row) => {
          if (err || !bcryptjs.compareSync(password, row.password)) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
          }

          res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin }
          });
        }
      );
    }
  );
});

// 3. SAVE USER DATA
app.post('/api/userdata', (req, res) => {
  const { userId, title, description, data } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ success: false, message: 'UserId and title required' });
  }

  db.run(
    `INSERT INTO userdata (userId, title, description, data) VALUES (?, ?, ?, ?)`,
    [userId, title, description, JSON.stringify(data)],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error saving data' });
      }
      res.json({ success: true, message: 'Data saved successfully', id: this.lastID });
    }
  );
});

// 4. GET USER DATA
app.get('/api/userdata/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT * FROM userdata WHERE userId = ? ORDER BY createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching data' });
      }
      res.json({ success: true, data: rows });
    }
  );
});

// 5. UPDATE USER DATA
app.put('/api/userdata/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, data } = req.body;

  db.run(
    `UPDATE userdata SET title = ?, description = ?, data = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [title, description, JSON.stringify(data), id],
    (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating data' });
      }
      res.json({ success: true, message: 'Data updated successfully' });
    }
  );
});

// 6. DELETE USER DATA
app.delete('/api/userdata/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM userdata WHERE id = ?`,
    [id],
    (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error deleting data' });
      }
      res.json({ success: true, message: 'Data deleted successfully' });
    }
  );
});

// 7. ADMIN: GET ALL USERS WITH THEIR DATA
app.get('/api/admin/users', (req, res) => {
  db.all(
    `SELECT id, username, email, createdAt FROM users WHERE isAdmin = 0`,
    (err, users) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching users' });
      }

      // Get data for each user
      let userList = [];
      let processed = 0;

      if (users.length === 0) {
        return res.json({ success: true, users: [] });
      }

      users.forEach((user) => {
        db.all(
          `SELECT id, title, description, data, createdAt, updatedAt FROM userdata WHERE userId = ?`,
          [user.id],
          (err, data) => {
            userList.push({
              ...user,
              data: data || []
            });
            processed++;

            if (processed === users.length) {
              res.json({ success: true, users: userList });
            }
          }
        );
      });
    }
  );
});

// 8. ADMIN: GET SPECIFIC USER DATA
app.get('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;

  db.get(
    `SELECT id, username, email, createdAt FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      db.all(
        `SELECT * FROM userdata WHERE userId = ? ORDER BY createdAt DESC`,
        [userId],
        (err, data) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching data' });
          }
          res.json({ success: true, user: { ...user, data: data || [] } });
        }
      );
    }
  );
});

// 9. ADMIN: DELETE USER
app.delete('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;

  db.run(`DELETE FROM userdata WHERE userId = ?`, [userId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error deleting user data' });
    }

    db.run(`DELETE FROM users WHERE id = ?`, [userId], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error deleting user' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📱 Open your browser and go to http://localhost:${PORT}/login.html`);
  console.log(`\nDefault Admin Credentials:`);
  console.log(`  Username: admin`);
  console.log(`  Password: admin123\n`);
});
