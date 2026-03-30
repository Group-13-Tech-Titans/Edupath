const Quiz = require("../models/Quiz");
const User = require("../../auth/models/User");

exports.submitQuiz = async (req, res) => {
  try {
    const { answers, selectedPath } = req.body;

    // ✅ Prevent re-submission
    if (req.user.quizCompleted) {
      return res.status(400).json({
        message: "Quiz already completed",
      });
    }

    // ✅ Calculate score
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0);

    // ✅ Determine level
    let level = "Beginner";
    if (totalScore > 70) level = "Advanced";
    else if (totalScore > 40) level = "Intermediate";

    // ✅ Save quiz data
    await Quiz.create({
      userId: req.user._id,
      answers,
      selectedPath,
      totalScore,
      level,
    });

    // ✅ Update user (ONLY ONCE)
    await User.findByIdAndUpdate(req.user._id, {
      learningPath: selectedPath,
      level: level,
      quizCompleted: true,
    });

    res.json({
      message: "Quiz submitted successfully",
      level,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};