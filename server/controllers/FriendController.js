const friendModel = require('../models/friendModel');

const SearchFriend = async (req, res) => {
  try {
    const query = req.query.query.trim();
    const userId = req.user.userId;
    if (!query) {
      return res.status(400).json({ message: 'يجب إدخال عبارة البحث' });
    }

    const results = await friendModel.searchFriend(userId, query);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.status(200).json({ users: results });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const requestFriend = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || isNaN(receiverId)) {
      return res.status(400).json({ message: 'يجب تحديد معرف المستخدم المستلم' });
    }

    if (!senderId) {
      return res.status(401).json({ message: 'غير مصرح بالدخول' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'لا يمكنك' });
    }

    const result = await friendModel.addFriend(senderId, receiverId);

    return res.status(200).json({
      message: 'تم إرسال طلب الصداقة بنجاح',
      name: result.name
    });

  } catch (error) {
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }
  console.error('Request error:', error);
  res.status(500).json({ message: 'Internal server error' });
}
}

const PendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح بالدخول' });
    }

    const requests = await friendModel.pending_requests(userId);

    res.status(200).json({user:requests});

  } catch (error) {
    console.error('Pending requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const cancelFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await friendModel.cancel_Request(userId, id);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: 'طلب الصداقة غير موجود' });
    }

    return res.status(200).json({ message: 'تم إلغاء طلب الصداقة بنجاح' });
  } catch (error) {
    console.error('Cancel error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const listFriends = async (req, res) => {

};

module.exports = { SearchFriend, requestFriend, PendingRequests, cancelFriendRequest, listFriends };