const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database!');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}
testConnection();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './Home/index.html'));
});

app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'./Home/login.html'))
})

app.post('/login', [
    body('email').isEmail().normalizeEmail().trim().escape().withMessage('Invalid email format'),
    body('password').notEmpty().trim().escape().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                errors: [{ 
                    path: 'email', 
                    msg: 'User not found' 
                }] 
            });
        }
        const user = users[0];
        if (password !== user.password) {
            return res.status(401).json({ 
                errors: [{ 
                    path: 'password', 
                    msg: 'Incorrect password' 
                }] 
            });
        }
        res.status(200).json({ 
            success: true,
            message: 'Login successful'
        });

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            errors: [{ 
                path: 'database', 
                msg: 'Login failed. Please try again.' 
            }] 
        });
    }
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname,'./Home/register.html'))
});

app.post('/register', [
    body('name').notEmpty().trim().escape().withMessage('Name is required'),
    body('account_name').notEmpty().trim().escape().withMessage('Account name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, account_name, email, password } = req.body;

    try {
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                errors: [{ 
                    path: 'email', 
                    msg: 'Email already in use' 
                }] 
            });
        }

        const hashedPassword = password;
        const [result] = await pool.query(
            'INSERT INTO users (name, account_name, email, password) VALUES (?, ?, ?, ?)',
            [name, account_name, email, hashedPassword]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Registration successful',
            userId: result.insertId 
        });

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            errors: [{ 
                path: 'database', 
                msg: 'Registration failed. Please try again.' 
            }] 
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});