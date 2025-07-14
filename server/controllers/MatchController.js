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

module.exports = { CreateMatch };
