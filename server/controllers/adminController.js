const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'يجب ملء جميع الحقول' });
    }

    const admin = await AdminModel.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صالحة' });
    }

    const isValidPassword = await AdminModel.comparePasswords(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صالحة' });
    }

    const token = jwt.sign({ adminId: admin.id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 2 * 3600000
    });

    res.json({ message: 'تم تسجيل الدخول بنجاح', admin: { id: admin.id, username: admin.username }, token });
  } catch (error) {
    console.error('Admin login error:', error.stack || error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'يجب ملء جميع الحقول' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }

    const existingAdmin = await AdminModel.findByUsername(username);
    if (existingAdmin) {
      return res.status(400).json({ message: 'اسم المستخدم مستخدم مسبقًا' });
    }

    await AdminModel.createAdmin(username, password);
    res.status(201).json({ message: 'تم إنشاء حساب الإدارة بنجاح' });
  } catch (error) {
    console.error('Admin register error:', error.stack || error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const checkAdminExists = async (req, res) => {
  try {
    const adminExists = await AdminModel.checkAdminExists();
    res.json({ adminExists });
  } catch (error) {
    console.error('Check admin exists error:', error.stack || error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await AdminModel.getAllUsers();
    const totalUsers = await AdminModel.getUserCount();
    res.json({ users, total: totalUsers });
  } catch (error) {
    console.error('Get users error:', error.stack || error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = { adminLogin, registerAdmin, checkAdminExists, getAllUsers };
