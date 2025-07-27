const matchModel = require("../models/matchModel");

const CreateMatch = async (req, res) => {
  const {player1_id, player2_id, player1_score, player2_score } = req.body;

  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح بالدخول' });
    }
    // Validate required fields
   if (
   player1_id === undefined || player2_id === undefined ||
   player1_score === undefined || player2_score === undefined
   ) {
  return res.status(400).json({ message: "جميع الحقول مطلوبة" });
   }

   // Create the match
   await matchModel.createMatch({
      player1_id,
      player2_id,
      player1_score,
      player2_score,
      created_by: userId,
    });
    
 
    return res.status(201).json({ message: "تم إنشاء المباراة بنجاح" });
  } catch (error) {
    console.error("Error creating match:", error);
    return res.status(500).json({ message: "في إنشاء المباراة." });
  }
};

const getSentPendingMatches = async (req, res) => {
  try {
    const userId = req.user.userId;
    const matches = await matchModel.getPendingSentMatches(userId);
    if(matches){
      return res.json({ user: matches || []});
    }
  } catch (err) {
    console.error("Error fetching sent matches:", err);
    res.status(500).json({ message: "فشل في جلب المباريات المرسلة" });//
  }
};

const getReceivedPendingMatches = async (req, res) => {
  try {
     const userId = req.user.userId;
    const matches = await matchModel.getPendingReceivedMatches(userId);
    if(matches){
      return res.json({ user: matches || [] });
    }
  } catch (err) {
    console.error("Error fetching received matches:", err);
    res.status(500).json({ message: "فشل في جلب المباريات الواردة" });
  }
};

const acceptMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.user.userId;

    const match = await matchModel.getMatchById(matchId);
    if (!match) return res.status(404).json({ message: "المباراة غير موجودة" });

    if (match.player2_id !== userId) {
      return res.status(403).json({ message: "غير مصرح لك بقبول هذه المباراة" });
    }

    await matchModel.acceptMatch(match.id);

    return res.json({ message: "تم قبول المباراة" });
  } catch (error) {
    console.error("Error accepting match:", error);
    return res.status(500).json({ message: "فشل في قبول المباراة" });
  }
};

const rejectMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.user.userId;

    const match = await matchModel.getMatchById(matchId);

    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }

    if (match.player2_id !== userId) {
      return res.status(403).json({ message: "غير مصرح لك برفض هذه المباراة" });
    }

    await matchModel.rejectMatch(matchId);

    return res.json({ message: "تم رفض المباراة" });
  } catch (error) {
    console.error("Error rejecting match:", error);
    return res.status(500).json({ message: "فشل في رفض المباراة" });
  }
};

const cancelMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.user.userId;

    const match = await matchModel.getMatchById(matchId);

    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }

    if (match.player1_id !== userId) {
      return res.status(403).json({ message: "غير مصرح لك بإلغاء هذه المباراة" });
    }

    await matchModel.cancelMatch(matchId);
  } catch (error) {
    console.error("Error canceling match:", error);
    return res.status(500).json({ message: "فشل في إلغاء المباراة" });
  }
};

const getRejectedSentMatches = async (req, res) => {
  try {
    const userId = req.user.userId;
    const matches = await matchModel.getrejectedsentmatches(userId);
    if(matches){
      return res.json({ user: matches || []});
    }
  } catch (err) {
    console.error("Error fetching rejected matches:", err);
    res.status(500).json({ message: "خطأ في جلب المباريات المرفوضة" });//
  }
};

const resendMatchRequest = async (req, res) => {
  const matchId = req.params.matchId;
  const userId = req.user.userId;
  try {

    const match = await matchModel.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }
    if (match.created_by !== userId) {
      return res.status(403).json({ message: "غير مصرح لك بإعادة إرسال هذه المباراة" });
    }

    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }
    
   await matchModel.resendmatchrequest(matchId);
   return res.json({ message: "تم إعادة إرسال المباراة بنجاح" });
  } catch (err) {
    console.error("Error resending match:", err);
    res.status(500).json({ message: "فشل في إعادة إرسال المباراة" });
  }
};

const cancelRejectedMatch = async (req, res) => {
  const matchId = req.params.id;
  const userId = req.user.userId;
  try {
  const match = await matchModel.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }
    if (match.player2_id !== userId) {
      return res.status(403).json({ message: "غير مصرح لك بإزالة رفض هذه المباراة" });
    }
   await matchModel.cancelrejectedmatch(matchId);

   return res.json({ message: "تمت إزالة الرفض بنجاح"});
  } catch (err) {
    console.error("Error cancel reject match:", err);
    res.status(500).json({ message: "فشل في إزالة الرفض" });
  }
};

const getMatchesBetweenFriends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const friendId = req.params.friendId;
    const matches = await matchModel.getMatchesBetweenUsers(userId, friendId);
    return res.json({ matches: matches || [] });
  } catch (err) {
    console.error("Error fetching matches between friends:", err);
    res.status(500).json({ message: "فشل في جلب المباريات بين الأصدقاء" });
  }
};

const removeMatch = async (req, res) => {
  const matchId = req.params.matchId;
  const userId = req.user.userId;
  
  try {
    const match = await matchModel.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }
    
    if (match.player1_id !== userId && match.player2_id !== userId) {
      return res.status(403).json({ message: "غير مصرح لك بإزالة هذه المباراة" });
    }

    await matchModel.removematche(matchId, userId);
    return res.json({ message: "تم إرسال طلب إزالة المباراة" });
  } catch (err) {
    console.error("Error removing match:", err);
    return res.status(500).json({ message: "فشل في إزالة المباراة" });
  }
};

const acceptRemoveMatch = async (req, res) => {
  const matchId = req.params.matchId;
  const userId = req.user.userId;
  
  try {
    const match = await matchModel.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }
    
    if (match.player1_id !== userId && match.player2_id !== userId) {
      return res.status(403).json({ message: "غير مصرح لك بقبول إزالة هذه المباراة" });
    }

    await matchModel.acceptRemoveMatch(matchId);
    return res.json({ message: "تم قبول إزالة المباراة" });
  } catch (err) {
    console.error("Error accepting remove match:", err);
    return res.status(500).json({ message: "فشل في قبول إزالة المباراة" });
  }
};

const rejectRemoveMatch = async (req, res) => {
  const matchId = req.params.matchId;
  const userId = req.user.userId;
  
  try {
    const match = await matchModel.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }
    
    if (match.player1_id !== userId && match.player2_id !== userId) {
      return res.status(403).json({ message: "غير مصرح لك برفض إزالة هذه المباراة" });
    }

    await matchModel.rejectRemoveMatch(matchId);
    return res.json({ message: "تم رفض إزالة المباراة" });
  } catch (err) {
    console.error("Error rejecting remove match:", err);
    return res.status(500).json({ message: "فشل في رفض إزالة المباراة" });
  }
};

const cancelRemoveMatch = async (req, res) => {
  const matchId = req.params.matchId;
  const userId = req.user.userId;
  
  try {
    const match = await matchModel.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }
    
    // Check if user is one of the players
    if (match.player1_id !== userId && match.player2_id !== userId) {
      return res.status(403).json({ message: "غير مصرح لك بإلغاء إزالة هذه المباراة" });
    }

    if (match.removed !== 'pending_remove') {
      return res.status(400).json({ message: "المباراة ليست في حالة طلب الإزالة" });
    }

    await matchModel.cancelRemoveMatch(matchId);
    return res.json({ message: "تم إلغاء طلب إزالة المباراة بنجاح" });
  } catch (err) {
    console.error("Error canceling remove match:", err);
    return res.status(500).json({ message: "فشل في إلغاء طلب إزالة المباراة" });
  }
};

module.exports = {
  CreateMatch,
  getSentPendingMatches,
  getReceivedPendingMatches,
  acceptMatch,
  rejectMatch,
  cancelMatch,
  getRejectedSentMatches,
  resendMatchRequest,
  cancelRejectedMatch,
  getMatchesBetweenFriends,
  removeMatch,
  cancelRemoveMatch,
  acceptRemoveMatch,
  rejectRemoveMatch
};