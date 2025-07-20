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
   const newMatch = await matchModel.createMatch({
      player1_id,
      player2_id,
      player1_score,
      player2_score,
      created_by: userId,
    });

   const io = req.app.get("io");
    io.to(`user_${player2_id}`).emit("newMatchRequest", {
      matchId: newMatch.id,
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
      return res.json({ user: matches });
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
    res.status(500).json({ message: "فشل في جلب المباريات الواردة" });//
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

    // Emit WebSocket event
    const io = req.app.get("io"); // From index.js app.set("io", io)
    io.to(`user_${match.player1_id}`).emit("matchAccepted", {
      matchId: match.id,
      message: "تم قبول المباراة من الطرف الآخر",
    });

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

    // Emit WebSocket event
    const io = req.app.get("io");
    io.to(`user_${match.player1_id}`).emit("matchRejected", {
      matchId: match.id,
    });

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
    // Emit WebSocket event
    const io = req.app.get("io");
     io.to(`user_${match.player1_id}`).emit("matchCanceled", { matchId: match.id });
     io.to(`user_${match.player2_id}`).emit("matchCanceled", { matchId: match.id });

    return res.json({ message: "تم إلغاء المباراة بنجاح" });
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
    const io = req.app.get("io");
    io.to(`user_${match.player2_id}`).emit("matchResent", {
      matchId: match.id,
    });

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

   const io = req.app.get("io");
   io.to(`user_${match.player1_id}`).emit("rejectedMatchCanceled", {
      matchId: match.id,
   });

   return res.json({ message: "تمت إزالة الرفض بنجاح"});
  } catch (err) {
    console.error("Error cancel reject match:", err);
    res.status(500).json({ message: "فشل في إزالة الرفض" });
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
  cancelRejectedMatch
};