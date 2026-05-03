const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  questionText: String,
  questionCategory: String,
  questionType: String,
  userAnswer: {
    type: String,
    default: "",
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  feedback: {
    type: String,
    default: "",
  },
  strengths: [String],
  improvements: [String],
  timeSpent: {
    type: Number,
    default: 0,
  },
  skipped: {
    type: Boolean,
    default: false,
  },
  // NEW: Round-specific breakdown scores
  subScores: {
    // Technical round
    technicalAccuracy: { type: Number, min: 0, max: 10 },
    problemSolvingApproach: { type: Number, min: 0, max: 10 },
    codeQuality: { type: Number, min: 0, max: 10 },
    communicationClarity: { type: Number, min: 0, max: 10 },
    // Managerial round
    situationalJudgment: { type: Number, min: 0, max: 10 },
    leadershipIndicators: { type: Number, min: 0, max: 10 },
    conflictResolution: { type: Number, min: 0, max: 10 },
    decisionMaking: { type: Number, min: 0, max: 10 },
    // HR round
    culturalFit: { type: Number, min: 0, max: 10 },
    selfAwareness: { type: Number, min: 0, max: 10 },
    motivationClarity: { type: Number, min: 0, max: 10 },
    communicationStyle: { type: Number, min: 0, max: 10 },
  },
  // NEW: Specific concerns flagged by AI
  redFlags: [String],
  // NEW: Positive signals (HR round)
  greenFlags: [String],
  // NEW: STAR compliance tracking (Managerial round)
  starCompliance: {
    hasSituation: Boolean,
    hasTask: Boolean,
    hasAction: Boolean,
    hasResult: Boolean,
    starScore: { type: Number, min: 0, max: 4 },
  },
  // NEW: Tone analysis result (HR round)
  toneAnalysis: String,
  // NEW: What would the interviewer naturally ask next
  followUpSuggestions: [String],
  // NEW: Ideal answer outline
  idealAnswerHint: String,
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["aptitude", "technical", "hr", "managerial"],
    },
    branch: {
      type: String,
      default: "general",
      index: true,
    },
    roundType: {
      type: String,
      enum: ["technical", "managerial", "hr"],
      required: true,
      default: "technical",
    },
    subcategory: {
      type: String,
      default: "general",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "adaptive"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
    answers: [answerSchema],
    totalQuestions: {
      type: Number,
      default: 0,
    },
    questionsAnswered: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F", ""],
      default: "",
    },
    overallFeedback: {
      type: String,
      default: "",
    },
    strengths: [String],
    areasForImprovement: [String],
    recommendations: [String],
    // NEW: Extended feedback fields
    overallVerdict: {
      type: String,
      enum: ["Strong Hire", "Hire", "Maybe", "No Hire", ""],
      default: "",
    },
    executiveSummary: {
      type: String,
      default: "",
    },
    topStrengths: [String],
    criticalGaps: [String],
    studyPlan: [
      {
        topic: String,
        priority: { type: String, enum: ["High", "Medium", "Low"] },
        resource: String,
      },
    ],
    nextStepAdvice: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0, // total seconds
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

interviewSchema.index({ user: 1, category: 1, createdAt: -1 });
interviewSchema.index({ user: 1, status: 1 });

// Calculate grade based on percentage
interviewSchema.methods.calculateGrade = function () {
  const p = this.percentage;
  if (p >= 95) return "A+";
  if (p >= 85) return "A";
  if (p >= 75) return "B+";
  if (p >= 65) return "B";
  if (p >= 55) return "C+";
  if (p >= 45) return "C";
  if (p >= 35) return "D";
  return "F";
};

module.exports = mongoose.model("Interview", interviewSchema);
