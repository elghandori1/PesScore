const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3000;

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
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    res.status(200).json({ success: true });
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
    res.status(200).json({ success: true });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});