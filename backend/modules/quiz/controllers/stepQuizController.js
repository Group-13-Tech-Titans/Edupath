/**
 * STEP QUIZ CONTROLLER
 * Handles fetching, tracking, and evaluating quizzes linked to specific pathway steps.
 */

const StepQuiz = require("../models/StepQuiz");
const Pathway = require("../../pathway/models/Pathway");

// --- CONFIGURATION CONSTANTS ---
const PASSING_SCORE_THRESHOLD = 50;
const STATUS_COMPLETED = "completed";
const STATUS_IN_PROGRESS = "in-progress";

// --- Helper functions -----

// Calculates the percentage score of a quiz attempt.
const calculateQuizScore = (questions, answers) => {
  let correctCount = 0;
  questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswerIndex) {
      correctCount++;
    }
  });
  return (correctCount / questions.length) * 100;
};

// Handles the state transition of unlocking the next step in the curriculum.
const unlockNextPathwayStep = async (pathwayId, userId, stepOrder) => {
  const pathway = await Pathway.findOne({ _id: pathwayId, userId });
  if (!pathway) return;

  const currentStep = pathway.steps.find(s => s.order === stepOrder);
  if (currentStep) currentStep.isCompleted = true;

  const nextStep = pathway.steps.find(s => s.order === stepOrder + 1);
  if (nextStep) nextStep.isUnlocked = true;

  const isFullyComplete = pathway.steps.every(s => s.isCompleted === true);
  pathway.status = isFullyComplete ? STATUS_COMPLETED : STATUS_IN_PROGRESS;

  await pathway.save();
};

// ------------------------------------


// Generates a quiz attempt by pulling the questions directly from the saved Pathway data.
exports.generateStepQuiz = async (req, res) => {
  try {
    const { pathwayId, stepOrder } = req.body;

    if (!pathwayId || stepOrder == null) {
      return res.status(400).json({ success: false, message: "Missing required fields: pathwayId or stepOrder" });
    }

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      userId: req.user._id,
      isTemplate: false
    });

    if (!pathway) return res.status(404).json({ success: false, message: "Pathway not found" });

    const step = pathway.steps.find(s => s.order === stepOrder);

    if (!step) return res.status(404).json({ success: false, message: "Step not found" });
    
    if (!step.quiz || step.quiz.length === 0) {
        return res.status(400).json({ success: false, message: "No assessment exists for this step." });
    }

    const lastQuiz = await StepQuiz.findOne({
      userId: req.user._id,
      pathwayId,
      stepOrder
    }).sort({ createdAt: -1 });

    const attemptNumber = lastQuiz ? lastQuiz.attempt + 1 : 1;

    const quizAttempt = await StepQuiz.create({
      userId: req.user._id,
      pathwayId,
      stepOrder,
      questions: step.quiz,
      attempt: attemptNumber
    });

    // Strip correct answers before sending to the frontend to prevent cheating
    const secureQuestions = quizAttempt.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options
    }));

    res.status(201).json({
      success: true,
      message: "Quiz attempt initialized.",
      quiz: {
          _id: quizAttempt._id,
          attempt: quizAttempt.attempt,
          questions: secureQuestions
      }
    });

  } catch (err) {
    console.error("Error generating quiz:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Evaluates the student's answers, calculates the score, and unlocks the next step if passed.

exports.submitStepQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Invalid payload provided." });
    }

    const quizAttempt = await StepQuiz.findOne({
      _id: quizId,
      userId: req.user._id
    });

    if (!quizAttempt) return res.status(404).json({ success: false, message: "Quiz attempt not found" });

    // Delegated to helper function
    const calculatedScore = calculateQuizScore(quizAttempt.questions, answers);
    const isPassed = calculatedScore >= PASSING_SCORE_THRESHOLD;

    quizAttempt.userAnswers = answers;
    quizAttempt.score = calculatedScore;
    quizAttempt.isPassed = isPassed;
    await quizAttempt.save();

    // Delegated to helper function
    if (isPassed) {
      await unlockNextPathwayStep(quizAttempt.pathwayId, req.user._id, quizAttempt.stepOrder);
    }

    res.status(200).json({
      success: true,
      score: calculatedScore,
      isPassed,
      message: isPassed ? "Passed 🎉" : "Failed - Retake quiz"
    });

  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};