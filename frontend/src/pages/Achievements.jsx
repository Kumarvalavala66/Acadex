import { useEffect, useMemo, useState } from "react";

import {
  getDiaryEntries,
  getExamResults,
  getExamSchedule,
  getLearningTasks,
  getTasks,
} from "../services/api";
import "./Achievements.css";

function formatDate(dateString) {
  if (!dateString) return "No date";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatPercent(value) {
  if (Number.isNaN(value) || value === null || value === undefined) {
    return "0%";
  }

  return `${Math.round(value)}%`;
}

function getStudyStreak(entries) {
  if (!entries.length) return 0;

  const dates = new Set(
    entries
      .map((entry) => entry.entry_date)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a)),
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const currentIso = cursor.toISOString().slice(0, 10);

    if (!dates.has(currentIso)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function Achievements() {
  const [tasks, setTasks] = useState([]);
  const [learningTasks, setLearningTasks] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [examSchedule, setExamSchedule] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [taskData, learningData, resultData, scheduleData, diaryData] =
        await Promise.all([
          getTasks(),
          getLearningTasks(),
          getExamResults(),
          getExamSchedule(),
          getDiaryEntries(),
        ]);

      setTasks(taskData);
      setLearningTasks(learningData);
      setExamResults(resultData);
      setExamSchedule(scheduleData);
      setDiaryEntries(diaryData);
    } catch (err) {
      setError(err.message || "Failed to load achievements data.");
    } finally {
      setLoading(false);
    }
  }

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed"),
    [tasks],
  );

  const completedLearningTasks = useMemo(
    () => learningTasks.filter((task) => task.status === "completed"),
    [learningTasks],
  );

  const scoreMap = useMemo(() => {
    return new Map(
      examSchedule.map((exam) => [exam.id, exam.max_marks || null]),
    );
  }, [examSchedule]);

  const examPerformance = useMemo(() => {
    const scoredResults = examResults
      .map((result) => {
        const maxMarks = scoreMap.get(result.exam_id);

        if (maxMarks == null || Number(maxMarks) === 0) {
          return null;
        }

        return {
          ...result,
          score: (Number(result.marks_obtained) / Number(maxMarks)) * 100,
          maxMarks,
        };
      })
      .filter(Boolean);

    if (!scoredResults.length) {
      return 0;
    }

    return (
      scoredResults.reduce((total, result) => total + result.score, 0) /
      scoredResults.length
    );
  }, [examResults, scoreMap]);

  const newestStudyEntry = useMemo(() => {
    if (!diaryEntries.length) return null;

    return [...diaryEntries].sort(
      (a, b) => new Date(b.entry_date) - new Date(a.entry_date),
    )[0];
  }, [diaryEntries]);

  const studyStreak = useMemo(() => getStudyStreak(diaryEntries), [diaryEntries]);

  const completionRate = useMemo(() => {
    if (!tasks.length) return 0;
    return (completedTasks.length / tasks.length) * 100;
  }, [completedTasks.length, tasks.length]);

  const pointsEarned = useMemo(() => {
    const taskPoints = completedTasks.length * 20;
    const learningPoints = completedLearningTasks.length * 18;
    const examPoints = examResults.length * 25;
    const diaryPoints = diaryEntries.length * 10;

    return taskPoints + learningPoints + examPoints + diaryPoints;
  }, [completedLearningTasks.length, completedTasks.length, diaryEntries.length, examResults.length]);

  const achievements = useMemo(
    () => [
      {
        id: "task-finisher",
        label: "Task finisher",
        description: "Close out your weekly work and build momentum.",
        unlocked: completedTasks.length >= 5,
        progress: Math.min((completedTasks.length / 5) * 100, 100),
        value: `${completedTasks.length}/5 tasks`,
      },
      {
        id: "focus-flow",
        label: "Focus flow",
        description: "Keep your completion rate high enough to stay on pace.",
        unlocked: completionRate >= 70,
        progress: Math.min(completionRate, 100),
        value: `${formatPercent(completionRate)} completion`,
      },
      {
        id: "study-streak",
        label: "Study streak",
        description: "Maintain a consistent learning habit across consecutive days.",
        unlocked: studyStreak >= 3,
        progress: Math.min((studyStreak / 3) * 100, 100),
        value: `${studyStreak}/3 day streak`,
      },
      {
        id: "exam-focus",
        label: "Exam focus",
        description: "Turn strong exam performance into a steady academic rhythm.",
        unlocked: examPerformance >= 75,
        progress: Math.min(examPerformance, 100),
        value: `${formatPercent(examPerformance)} average score`,
      },
      {
        id: "learning-keeper",
        label: "Learning keeper",
        description: "Stay active with your study plan and reflective journal.",
        unlocked: completedLearningTasks.length >= 3 || diaryEntries.length >= 3,
        progress: Math.min(
          ((completedLearningTasks.length + diaryEntries.length) / 6) * 100,
          100,
        ),
        value: `${completedLearningTasks.length + diaryEntries.length}/6 momentum`,
      },
    ],
    [completedLearningTasks.length, completedTasks.length, completionRate, diaryEntries.length, examPerformance, studyStreak],
  );

  const rewardLedger = useMemo(() => {
    const items = [];

    if (completedTasks.length) {
      items.push({
        label: "Completed tasks",
        value: `${completedTasks.length} wins`,
        detail: "From your active task list",
      });
    }

    if (examResults.length) {
      const bestResult = [...examResults]
        .map((result) => {
          const maxMarks = scoreMap.get(result.exam_id);
          const percent = maxMarks ? (Number(result.marks_obtained) / Number(maxMarks)) * 100 : 0;

          return { ...result, percent };
        })
        .sort((a, b) => b.percent - a.percent)[0];

      items.push({
        label: "Top score",
        value: `${formatPercent(bestResult?.percent || 0)}`,
        detail: bestResult ? `Exam #${bestResult.exam_id}` : "Awaiting results",
      });
    }

    if (newestStudyEntry) {
      items.push({
        label: "Latest study reflection",
        value: `${newestStudyEntry.progress}% progress`,
        detail: formatDate(newestStudyEntry.entry_date),
      });
    }

    if (!items.length) {
      return [
        {
          label: "Momentum",
          value: "0",
          detail: "Add tasks and study entries to build your reward ledger.",
        },
      ];
    }

    return items;
  }, [completedTasks.length, examResults, newestStudyEntry, scoreMap]);

  if (loading) {
    return (
      <div className="achievements-page">
        <div className="achievements-loading">Loading achievements…</div>
      </div>
    );
  }

  return (
    <div className="achievements-page">
      <header className="achievements-header">
        <div>
          <span className="eyebrow">Rewards</span>
          <h1>Achievements &amp; rewards</h1>
          <p>
            Your milestones are derived directly from your real work, study activity,
            and exam results.
          </p>
        </div>

        <div className="reward-score">
          <span>Reward score</span>
          <strong>{pointsEarned}</strong>
        </div>
      </header>

      {error && <div className="achievements-error">{error}</div>}

      <section className="achievement-strip">
        <div className="achievement-stat">
          <span>Completion rate</span>
          <strong>{formatPercent(completionRate)}</strong>
        </div>

        <div className="achievement-stat">
          <span>Study streak</span>
          <strong>{studyStreak}d</strong>
        </div>

        <div className="achievement-stat">
          <span>Average score</span>
          <strong>{formatPercent(examPerformance)}</strong>
        </div>

        <div className="achievement-stat">
          <span>Active rewards</span>
          <strong>{achievements.filter((item) => item.unlocked).length}</strong>
        </div>
      </section>

      <section className="achievement-grid">
        {achievements.map((achievement) => (
          <article
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? "unlocked" : "locked"}`}
          >
            <div className="achievement-header">
              <span className="achievement-pill">
                {achievement.unlocked ? "Unlocked" : "Locked"}
              </span>
            </div>

            <h2>{achievement.label}</h2>
            <p>{achievement.description}</p>

            <div className="achievement-progress">
              <div
                className="achievement-bar"
                style={{ width: `${achievement.progress}%` }}
              />
            </div>

            <div className="achievement-meta">
              <strong>{achievement.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="achievement-panels">
        <div className="achievement-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Ledger</span>
              <h2>Reward ledger</h2>
            </div>
          </div>

          <div className="ledger-list">
            {rewardLedger.map((item) => (
              <div className="ledger-item" key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
                <span className="ledger-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="achievement-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Momentum</span>
              <h2>Recent wins</h2>
            </div>
          </div>

          <div className="momentum-list">
            {diaryEntries.slice(0, 3).map((entry) => (
              <div className="momentum-item" key={entry.id}>
                <span className="momentum-date">{formatDate(entry.entry_date)}</span>
                <strong>{entry.progress}% study progress</strong>
                <p>{entry.studied || "Study reflection added."}</p>
              </div>
            ))}

            {!diaryEntries.length && (
              <div className="empty-state compact">
                <strong>No study reflections yet.</strong>
                <p>Add your next learning diary entry to build momentum.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
