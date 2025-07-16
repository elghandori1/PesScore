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
  return res.status(400).json({ message: "جميع الحقول مطلوبة." });
}
    // Create the match
    await matchModel.createMatch({
      player1_id,
      player2_id,
      player1_score,
      player2_score,
      created_by: userId,
    });

    return res.status(201).json({ message: "تم إنشاء المباراة بنجاح." });
  } catch (error) {
    console.error("Error creating match:", error);
    return res.status(500).json({ message: "في إنشاء المباراة." });
  }
};

const getSentPendingMatches = async (req, res) => {
  try {
        const userId = req.user.userId;
    const matches = await matchModel.getPendingSentMatches(userId);
    res.json({ user: matches });
  } catch (err) {
    console.error("Error fetching sent matches:", err);
    res.status(500).json({ message: "فشل في جلب المباريات المرسلة" });
  }
};

const getReceivedPendingMatches = async (req, res) => {
  try {
     const userId = req.user.userId;
    const matches = await matchModel.getPendingReceivedMatches(userId);
    res.json({ user: matches });
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

    if (!match) {
      return res.status(404).json({ message: "المباراة غير موجودة" });
    }

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

    return res.json({ message: "تم إلغاء المباراة" });
  } catch (error) {
    console.error("Error canceling match:", error);
    return res.status(500).json({ message: "فشل في إلغاء المباراة" });
  }
};

module.exports = {
  CreateMatch,
  getSentPendingMatches,
  getReceivedPendingMatches,
  acceptMatch,
  rejectMatch,
  cancelMatch,
};
