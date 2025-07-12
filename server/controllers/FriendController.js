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

const ReceivedFriends = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح بالدخول' });
    }

    const requests = await friendModel.received_friends(userId);
    res.status(200).json({user:requests});

  } catch (error) {
    console.error('Received friends error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const AcceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح بالدخول' });
    }

    const request = await friendModel.accept_friend_request(userId, id);

    if (!request) {
      return res.status(404).json({ message: 'طلب الصداقة غير موجود أو تم قبوله مسبقًا' });
    }

    return res.status(200).json({ message: 'تم قبول طلب الصداقة بنجاح' });

  } catch (error) {
    console.error('Accept request error:', error);
    return res.status(500).json({ message: error.message || 'حدث خطأ في الخادم' });
  }
};

const RejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح بالدخول' });
    }

    const result = await friendModel.reject_friend_request(userId, id);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: 'طلب الصداقة غير موجود أو تم رفضه مسبقًا' });
    }

    return res.status(200).json({ message: 'تم رفض طلب الصداقة بنجاح' });

  }catch(error) {
    console.error('Reject request error:', error);
    return res.status(500).json({ message: error.message || 'حدث خطأ في الخادم' });
  }
}

const getFriends = async (req, res) => {
  try { 
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح بالدخول' });
    }

    const friends = await friendModel.getFriends(userId);
    res.status(200).json({ friends });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
}

const RemoveFriend = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح بالدخول' });
    }

    if(id === userId) {
      return res.status(400).json({ message: 'لا يمكنك إزالة نفسك كصديق' });
    }

    const result = await friendModel.removeFriend(userId, id);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: 'الصديق غير موجود أو تم إزالته مسبقًا' });
    }

    return res.status(200).json({ message: 'تم إزالة الصديق بنجاح' });

  } catch (error) {
    console.error('Remove friend error:', error);
    return res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
}

module.exports = { 
  SearchFriend,
  requestFriend, 
  PendingRequests, 
  cancelFriendRequest, 
  ReceivedFriends,
  AcceptFriendRequest,
  RejectFriendRequest,
  getFriends,
  RemoveFriend
};
