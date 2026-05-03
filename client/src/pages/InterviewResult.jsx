import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { interviewAPI } from "../services/api";
import {
  Trophy,
  Target,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Award,
  BookOpen,
  Lightbulb,
  MessageCircle,
  Star,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const gradeColors = {
  "A+": "text-emerald-500",
  A: "text-emerald-500",
  "B+": "text-blue-500",
  B: "text-blue-500",
  "C+": "text-amber-500",
  C: "text-amber-500",
  D: "text-orange-500",
  F: "text-red-500",
};

// Helper to compute average subscores from answers
const computeAverageSubScores = (answers, roundType) => {
  const subScoreFields = {
    technical: [
      "technicalAccuracy",
      "problemSolvingApproach",
      "codeQuality",
      "communicationClarity",
    ],
    managerial: [
      "situationalJudgment",
      "leadershipIndicators",
      "conflictResolution",
      "decisionMaking",
    ],
    hr: [
      "culturalFit",
      "selfAwareness",
      "motivationClarity",
      "communicationStyle",
    ],
  };

  const fields = subScoreFields[roundType] || [];
  const axisLabels = {
    technical: [
      "Technical Accuracy",
      "Problem Solving",
      "Code Quality",
      "Communication",
    ],
    managerial: [
      "Situational Judgment",
      "Leadership",
      "Conflict Resolution",
      "Decision Making",
    ],
    hr: [
      "Cultural Fit",
      "Self-Awareness",
      "Motivation Clarity",
      "Communication",
    ],
  };

  const labels = axisLabels[roundType] || [];
  const data = labels.map((label, idx) => {
    const fieldName = fields[idx];
    const scores = answers
      .filter((a) => a.subScores && a.subScores[fieldName] !== undefined)
      .map((a) => a.subScores[fieldName]);

    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    return { axis: label, value: avg };
  });

  return data;
};

export default function InterviewResult() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await interviewAPI.getById(id);
        setInterview(data.interview);
      } catch (error) {
        console.error("Failed to load result:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)]">Result not found.</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-flex">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/history" className="btn-ghost text-sm mb-4 inline-flex">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to History
        </Link>
        <h1 className="text-display-sm">Interview Result</h1>
        <p className="text-[var(--color-text-secondary)] capitalize">
          {interview.category} Interview — {interview.subcategory}
        </p>
      </motion.div>

      {/* Score Card */}
      <motion.div
        className="card text-center py-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-6">
          <div
            className={`text-7xl font-bold ${gradeColors[interview.grade] || "text-surface-500"}`}
          >
            {interview.grade || "-"}
          </div>
          <p className="text-[var(--color-text-tertiary)] text-sm mt-2">
            Grade
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-2xl font-bold">
              <Target className="w-5 h-5 text-primary-500" />
              {interview.percentage}%
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              Score
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-2xl font-bold">
              <Trophy className="w-5 h-5 text-amber-500" />
              {interview.totalScore}/{interview.maxScore}
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              Points
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-2xl font-bold">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              {interview.questionsAnswered}/{interview.totalQuestions}
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              Answered
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-2xl font-bold">
              <Clock className="w-5 h-5 text-surface-400" />
              {formatDuration(interview.duration || 0)}
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              Duration
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overall Feedback */}
      {interview.overallFeedback && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-3">Overall Feedback</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {interview.overallFeedback}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            {interview.strengths?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Strengths
                </h3>
                <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                  {interview.strengths.map((s, i) => (
                    <li key={i}>✓ {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {interview.areasForImprovement?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Areas to Improve
                </h3>
                <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                  {interview.areasForImprovement.map((s, i) => (
                    <li key={i}>→ {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {interview.recommendations?.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/20">
              <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">
                Recommendations
              </h3>
              <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                {interview.recommendations.map((r, i) => (
                  <li key={i}>💡 {r}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Round-Specific Sections */}
      {interview.roundType && (
        <>
          {/* Radar Chart for SubScores */}
          {interview.roundType !== "aptitude" &&
            interview.answers?.some((a) => a.subScores) && (
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold mb-6">
                  Performance Breakdown
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={computeAverageSubScores(
                      interview.answers,
                      interview.roundType,
                    )}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="axis" />
                    <Radar
                      name="Average Score"
                      dataKey="value"
                      fill="#6366f1"
                      fillOpacity={0.5}
                    />
                    <Tooltip formatter={(value) => value.toFixed(1)} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

          {/* Red Flags Alert */}
          {interview.answers?.some((a) => a.redFlags?.length > 0) && (
            <motion.div
              className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                    Red Flags
                  </h3>
                  <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                    {[
                      ...new Set(
                        interview.answers.flatMap((a) => a.redFlags || []),
                      ),
                    ].map((flag, i) => (
                      <li key={i}>⚠️ {flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Green Flags (HR Only) */}
          {interview.roundType === "hr" &&
            interview.answers?.some((a) => a.greenFlags?.length > 0) && (
              <motion.div
                className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                      Green Flags
                    </h3>
                    <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
                      {[
                        ...new Set(
                          interview.answers.flatMap((a) => a.greenFlags || []),
                        ),
                      ].map((flag, i) => (
                        <li key={i}>✨ {flag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

          {/* STAR Compliance (Managerial Only) */}
          {interview.roundType === "managerial" && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
            >
              <h2 className="text-lg font-semibold mb-4">
                STAR Method Compliance
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { letter: "S", label: "Situation" },
                  { letter: "T", label: "Task" },
                  { letter: "A", label: "Action" },
                  { letter: "R", label: "Result" },
                ].map((item, idx) => {
                  const starData = interview.answers?.[0]?.starCompliance;
                  const hasItem =
                    starData?.[
                      ["hasSituation", "hasTask", "hasAction", "hasResult"][idx]
                    ];
                  return (
                    <div
                      key={item.letter}
                      className={`p-3 rounded-lg text-center ${
                        hasItem
                          ? "bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-700"
                          : "bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600"
                      }`}
                    >
                      <div
                        className={`font-bold text-lg ${
                          hasItem
                            ? "text-green-700 dark:text-green-300"
                            : "text-surface-400"
                        }`}
                      >
                        {item.letter}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              {interview.answers?.[0]?.starCompliance?.starScore && (
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                  <p className="text-sm font-medium">
                    STAR Score: {interview.answers[0].starCompliance.starScore}
                    /4
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tone Analysis (HR Only) */}
          {interview.roundType === "hr" &&
            interview.answers?.some((a) => a.toneAnalysis) && (
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44 }}
              >
                <h2 className="text-lg font-semibold mb-4">
                  Communication Tone
                </h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...new Set(
                      interview.answers
                        .filter((a) => a.toneAnalysis)
                        .map((a) => a.toneAnalysis),
                    ),
                  ].map((tone, i) => {
                    const toneColor = {
                      Professional:
                        "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
                      Balanced:
                        "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300",
                      Nervous:
                        "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300",
                      Overconfident:
                        "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300",
                      Casual:
                        "bg-surface-100 dark:bg-surface-800 text-[var(--color-text-secondary)]",
                    };
                    return (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${toneColor[tone] || toneColor.Casual}`}
                      >
                        {tone}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}

          {/* Follow-Up Suggestions */}
          {interview.answers?.some(
            (a) => a.followUpSuggestions?.length > 0,
          ) && (
            <motion.div
              className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46 }}
            >
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                    What Interviewers Would Ask Next
                  </h3>
                  <ul className="space-y-1 text-sm text-indigo-600 dark:text-indigo-400">
                    {[
                      ...new Set(
                        interview.answers.flatMap(
                          (a) => a.followUpSuggestions || [],
                        ),
                      ),
                    ].map((q, i) => (
                      <li key={i} className="italic">
                        "{q}"
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Study Plan */}
          {interview.studyPlan?.length > 0 && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" /> Study Plan
              </h2>
              <div className="space-y-3">
                {interview.studyPlan.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 border border-surface-200 dark:border-surface-800 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.topic}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                          Priority:{" "}
                          <span
                            className={`font-semibold ${
                              item.priority === "High"
                                ? "text-red-600"
                                : item.priority === "Medium"
                                  ? "text-amber-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          📚 {item.resource}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Next Step Advice */}
          {interview.nextStepAdvice && (
            <motion.div
              className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
                    Next Step
                  </h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                    {interview.nextStepAdvice}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Detailed Answers */}

      <div>
        <h2 className="text-heading mb-4">Question Breakdown</h2>
        <div className="space-y-3">
          {interview.answers?.map((ans, i) => (
            <motion.div
              key={i}
              className="card p-0 overflow-hidden"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <button
                onClick={() =>
                  setExpandedAnswer(expandedAnswer === i ? null : i)
                }
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    ans.skipped
                      ? "bg-surface-100 dark:bg-surface-800"
                      : ans.score >= 7
                        ? "bg-emerald-100 dark:bg-emerald-950/30"
                        : ans.score >= 4
                          ? "bg-amber-100 dark:bg-amber-950/30"
                          : "bg-red-100 dark:bg-red-950/30"
                  }`}
                >
                  {ans.skipped ? (
                    <span className="text-xs text-surface-400">—</span>
                  ) : ans.score >= 7 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Q{i + 1}: {ans.questionText}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-sm">{ans.score}/10</span>
                  {expandedAnswer === i ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {expandedAnswer === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-surface-100 dark:border-surface-800 p-4 bg-surface-50/50 dark:bg-surface-800/30"
                >
                  {ans.userAnswer && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">
                        Your Answer
                      </p>
                      <p className="text-sm">{ans.userAnswer}</p>
                    </div>
                  )}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">
                      Feedback
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {ans.feedback?.trim() ||
                        "Feedback unavailable for this response."}
                    </p>
                  </div>
                  {ans.strengths?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-emerald-600 mb-1">
                        Strengths
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ans.strengths.map((s, j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {ans.improvements?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 mb-1">
                        Improvements
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ans.improvements.map((s, j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Round-specific answer details */}
                  {interview.roundType && (
                    <>
                      {/* Red Flags */}
                      {ans.redFlags?.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                            ⚠️ Red Flags
                          </p>
                          <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                            {ans.redFlags.map((flag, j) => (
                              <li key={j}>• {flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Green Flags (HR) */}
                      {interview.roundType === "hr" &&
                        ans.greenFlags?.length > 0 && (
                          <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                              ✨ Green Flags
                            </p>
                            <ul className="text-xs text-green-600 dark:text-green-400 space-y-0.5">
                              {ans.greenFlags.map((flag, j) => (
                                <li key={j}>• {flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* STAR Compliance (Managerial) */}
                      {interview.roundType === "managerial" &&
                        ans.starCompliance && (
                          <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded border border-indigo-200 dark:border-indigo-800">
                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                              STAR Compliance
                            </p>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { field: "hasSituation", label: "S" },
                                { field: "hasTask", label: "T" },
                                { field: "hasAction", label: "A" },
                                { field: "hasResult", label: "R" },
                              ].map((item) => (
                                <div
                                  key={item.field}
                                  className={`text-center py-1 rounded text-xs font-bold ${
                                    ans.starCompliance[item.field]
                                      ? "bg-green-200 dark:bg-green-700 text-green-900"
                                      : "bg-surface-200 dark:bg-surface-700 text-surface-500"
                                  }`}
                                >
                                  {item.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Tone Analysis (HR) */}
                      {interview.roundType === "hr" && ans.toneAnalysis && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            <span className="font-medium">Tone:</span>{" "}
                            {ans.toneAnalysis}
                          </p>
                        </div>
                      )}

                      {/* Follow-Up Suggestions */}
                      {ans.followUpSuggestions?.length > 0 && (
                        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
                            Next question interviewer would ask:
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                            "{ans.followUpSuggestions[0]}"
                          </p>
                        </div>
                      )}

                      {/* Ideal Answer Hint */}
                      {ans.idealAnswerHint && (
                        <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                            💡 Model Answer Outline
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {ans.idealAnswerHint}
                          </p>
                        </div>
                      )}

                      {/* SubScores */}
                      {ans.subScores && (
                        <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                          <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">
                            Detailed Scores
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(ans.subScores)
                              .filter(([, v]) => typeof v === "number")
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-[var(--color-text-tertiary)]">
                                    {key
                                      .replace(/([A-Z])/g, " $1")
                                      .trim()
                                      .replace(/^./, (c) => c.toUpperCase())}
                                  </span>
                                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                                    {value}/10
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link to="/interview/setup" className="btn-primary">
          Practice Again <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
        <Link to="/dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
