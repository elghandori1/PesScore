const jwt = require('jsonwebtoken');
const AuthModel = require('../models/authModel');

const register = async (req, res) => {
  try {
    const { name_account, id_account, email, password } = req.body;

    if (!name_account || !id_account || !email || !password) {
      return res.status(400).json({ message: 'يجب ملء جميع الحقول' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'صيغة البريد الإلكتروني غير صالحة' });
    }

    if (name_account.length < 3 || name_account.length > 16) {
      return res.status(400).json({ message: 'اسم الحساب يجب أن يكون من 3 إلى 16 حرفًا' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }

  if (id_account.length !== 16) {
    return res.status(400).json({ message: 'معرف الحساب يجب أن يكون 16 حرفاً بصيغة XXXX-DDD-DDD-DDD' });
   }

   const idAccountRegex = /^[A-Z]{4}-\d{3}-\d{3}-\d{3}$/;
   if (!idAccountRegex.test(id_account)) {
    return res.status(400).json({ message: 'صيغة معرف الحساب غير صحيحة. الصيغة المطلوبة: XXXX-DDD-DDD-DDD' });
   }

    const existingUser = await AuthModel.findByID_Compte(id_account);
    if (existingUser) {
      return res.status(400).json({ message: 'معرف المستخدم مستخدم مسبقًا' });
    }

    const existingEmail = await AuthModel.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم مسبقًا' });
    } 

    await AuthModel.createUser(name_account, id_account, email, password);
    res.status(201).json({ message: 'تم إنشاء الحساب بنجاح' });
  } catch (error) {
    console.error('Register error:', error.stack || error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

const login = async (req, res) => {
  try {
    const { id_account, password } = req.body;

    if (!id_account || !password) {
      return res.status(400).json({ message: 'يجب ملء جميع الحقول' });
    }

    const user = await AuthModel.findByID_Compte(id_account);
    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }

    const isValidPassword = await AuthModel.comparePasswords(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صالحة' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // true for production https
      sameSite: 'strict',
      maxAge: 3600000,
    });

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name_account } });
  } catch (error) {
    console.error('Login error:', error.stack || error);
    res.status(500).json({ message: 'Server error' });
  }
};

const connectUser = async (req, res) => {
  try {
    const user = await AuthModel.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error.stack || error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, connectUser, logout };
