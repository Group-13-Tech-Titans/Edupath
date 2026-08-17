const StepQuiz = require("../models/StepQuiz");
const Pathway = require("../../pathway/models/Pathway");
const { generateQuiz } = require("../../../services/aiQuizService");

exports.generateStepQuiz = async (req, res) => {
  try {
    const { pathwayId, stepOrder } = req.body;

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      userId: req.user._id,
    });

    if (!pathway) {
      return res.status(404).json({ message: "Pathway not found" });
    }

    const step = pathway.steps.find(s => s.order === stepOrder);

    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    // 🔥 Count previous attempts
    const lastQuiz = await StepQuiz.findOne({
      userId: req.user._id,
      pathwayId,
      stepOrder
    }).sort({ createdAt: -1 });

    const attempt = lastQuiz ? lastQuiz.attempt + 1 : 1;

    // 🔥 Generate AI quiz
    const questions = await generateQuiz({
      stepTitle: step.title,
      level: pathway.level
    });

    const quiz = await StepQuiz.create({
      userId: req.user._id,
      pathwayId,
      stepOrder,
      questions,
      attempt
    });

    res.json({
      message: "Quiz generated",
      quiz
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.submitStepQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await StepQuiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // 🔥 Calculate score
    let correct = 0;

    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });

    const score = (correct / quiz.questions.length) * 100;

    const isPassed = score >= 80;

    quiz.userAnswers = answers;
    quiz.score = score;
    quiz.isPassed = isPassed;

    await quiz.save();

    // 🔥 If passed → unlock next step
    if (isPassed) {
      const pathway = await Pathway.findById(quiz.pathwayId);

      const step = pathway.steps.find(s => s.order === quiz.stepOrder);
      step.isCompleted = true;

      const nextStep = pathway.steps.find(s => s.order === quiz.stepOrder + 1);
      if (nextStep) nextStep.isUnlocked = true;

      await pathway.save();
    }

    res.json({
      score,
      isPassed,
      message: isPassed ? "Passed 🎉" : "Failed - Retake quiz"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};