import { useEffect, useMemo, useState } from "react";

import RubberSegment from "../components/RubberSegment";
import SpringCheck from "../components/SpringCheck";

import {
  getDiaryEntries,
  getExamResults,
  getLearningProgress,
  getTasks,
  updateTaskStatus,
} from "../services/api";
import "./Dashboard.css";

function formatDate(date) {
  if (!date) return "No date";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function timeRangeFor(period) {
  const dayMs = 24 * 60 * 60 * 1000;

  switch (period) {
    case "Day":
      return dayMs;
    case "Week":
      return 7 * dayMs;
    case "Month":
      return 30 * dayMs;
    case "Year":
      return 365 * dayMs;
    default:
      return 7 * dayMs;
  }
}

function isTaskWithinPeriod(task, period) {
  if (!task.due_date) return true;

  const dueDate = new Date(`${task.due_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = dueDate.getTime() - today.getTime();
  const range = timeRangeFor(period);

  return diff >= 0 && diff <= range;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [learningProgress, setLearningProgress] = useState(null);
  const [period, setPeriod] = useState("Week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [taskData, resultsData, diaryData, progressData] = await Promise.all([
        getTasks(),
        getExamResults(),
        getDiaryEntries(),
        getLearningProgress(),
      ]);

      setTasks(taskData);
      setExamResults(resultsData);
      setDiaryEntries(diaryData);
      setLearningProgress(progressData);
    } catch (err) {
      console.error(err);
      setError("Unable to load your dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTaskChange(task, checked) {
    try {
      const updated = await updateTaskStatus(
        task.id,
        checked ? "completed" : "todo",
      );

      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      console.error(err);
      setError("Could not update the task.");
    }
  }

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== "completed"),
    [tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed"),
    [tasks],
  );

  const assignments = useMemo(
    () => tasks.filter((task) => task.task_type === "assignment"),
    [tasks],
  );

  const projects = useMemo(
    () => tasks.filter((task) => task.task_type === "project"),
    [tasks],
  );

  const personal = useMemo(
    () => tasks.filter((task) => task.task_type === "personal"),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => isTaskWithinPeriod(task, period));
  }, [period, tasks]);

  const activeFilteredTasks = useMemo(
    () => filteredTasks.filter((task) => task.status !== "completed"),
    [filteredTasks],
  );

  const upcoming = useMemo(() => {
    return [...tasks]
      .filter((task) => task.status !== "completed" && task.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [completedTasks.length, tasks.length]);

  const averageStudyProgress = useMemo(() => {
    if (!diaryEntries.length) return 0;

    const total = diaryEntries.reduce((sum, entry) => sum + Number(entry.progress || 0), 0);
    return Math.round(total / diaryEntries.length);
  }, [diaryEntries]);

  const averageExamScore = useMemo(() => {
    if (!examResults.length) return 0;

    const scoredResults = examResults.filter((result) => Number.isFinite(Number(result.marks_obtained)));

    if (!scoredResults.length) return 0;

    const total = scoredResults.reduce((sum, result) => sum + Number(result.marks_obtained), 0);
    return Math.round(total / scoredResults.length);
  }, [examResults]);

  const recentActivity = useMemo(() => {
    const items = [];

    tasks.forEach((task) => {
      items.push({
        id: `task-${task.id}`,
        label: task.title,
        note: task.status === "completed" ? "Completed" : "Updated",
        date: task.due_date || task.created_at,
        type: "task",
      });
    });

    diaryEntries.forEach((entry) => {
      items.push({
        id: `diary-${entry.id}`,
        label: `${entry.progress}% study progress`,
        note: "Study reflection",
        date: entry.entry_date,
        type: "study",
      });
    });

    examResults.forEach((result) => {
      items.push({
        id: `exam-${result.id}`,
        label: `Exam result recorded`,
        note: `${result.marks_obtained} marks`,
        date: result.created_at || result.updated_at,
        type: "exam",
      });
    });

    return items
      .sort((a, b) => {
        const aDate = a.date ? new Date(`${a.date}T00:00:00`).getTime() : 0;
        const bDate = b.date ? new Date(`${b.date}T00:00:00`).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [diaryEntries, examResults, tasks]);

  const goalMetrics = useMemo(() => {
    return [
      {
        label: "Assignments",
        count: assignments.length,
        total: Math.max(tasks.length, 1),
      },
      {
        label: "Projects",
        count: projects.length,
        total: Math.max(tasks.length, 1),
      },
      {
        label: "Learning",
        count: diaryEntries.length,
        total: Math.max(5, diaryEntries.length + 1),
      },
    ];
  }, [assignments.length, diaryEntries.length, projects.length, tasks.length]);

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Acadex</span>

          <h1>
            {getGreeting()}, {user.name || "Student"}.
          </h1>

          <p>Here is your performance pulse for the current cycle.</p>
        </div>

        <div className="period-control">
          <RubberSegment
            items={["Day", "Week", "Month", "Year"]}
            defaultValue={period}
            onChange={(value) => setPeriod(value)}
            trackColor="#27272a"
            thumbColor="#fafafa"
            textColor="#fafafa"
            activeTextColor="#18181b"
            size="md"
            radius={10}
            inset={3}
            equalSlots
            stretch={100}
            squash={3}
            speed={1}
            glide={75}
            draggable
            preset="periods"
            disabled={false}
          />
        </div>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="overview-grid">
        <div className="overview-card">
          <span>Completion</span>
          <strong>{completionRate}%</strong>
          <small>{completedTasks.length} of {tasks.length} tasks finished</small>
        </div>

        <div className="overview-card">
          <span>Study momentum</span>
          <strong>{averageStudyProgress}%</strong>
          <small>average reflection progress</small>
        </div>

        <div className="overview-card">
          <span>Average score</span>
          <strong>{averageExamScore}</strong>
          <small>marks across results</small>
        </div>

        <div className="overview-card">
          <span>Next deadline</span>
          <strong>{upcoming[0] ? formatDate(upcoming[0].due_date) : "—"}</strong>
          <small>{upcoming[0] ? upcoming[0].title : "No active deadlines"}</small>
        </div>
      </section>

      <section className="dashboard-columns">
        <div className="dashboard-panel tasks-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Work</span>
              <h2>Things to finish</h2>
            </div>
            <span className="panel-count">{activeFilteredTasks.length}</span>
          </div>

          {loading ? (
            <div className="task-loading">
              <div />
              <div />
              <div />
            </div>
          ) : activeFilteredTasks.length === 0 ? (
            <div className="empty-state">
              <strong>No tasks in range.</strong>
              <p>Try another period or add more work.</p>
            </div>
          ) : (
            <div className="todo-list">
              {activeFilteredTasks.slice(0, 6).map((task) => (
                <SpringCheck
                  key={task.id}
                  label={task.title}
                  defaultChecked={task.status === "completed"}
                  onChange={(checked) => handleTaskChange(task, checked)}
                  color="var(--ink)"
                  fillColor="var(--accent)"
                  checkColor="var(--button-text)"
                  boxSize={28}
                  boxRadius={9}
                  fontSize={14}
                  bounce={0.2}
                  strikeLag={0.12}
                  doneOpacity={0.42}
                  strike="left"
                  disabled={false}
                />
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel upcoming-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Trends</span>
              <h2>Recent activity</h2>
            </div>
          </div>

          <div className="timeline-list">
            {recentActivity.map((item) => (
              <div className="timeline-item" key={item.id}>
                <span className={`timeline-dot timeline-${item.type}`} />
                <div className="timeline-copy">
                  <strong>{item.label}</strong>
                  <span>{item.note}</span>
                </div>
                <time>{formatDate(item.date)}</time>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="dashboard-panel progress-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Overview</span>
              <h2>Goal tracker</h2>
            </div>
          </div>

          <div className="distribution">
            {goalMetrics.map((goal) => (
              <DistributionRow
                key={goal.label}
                label={goal.label}
                count={goal.count}
                total={goal.total}
              />
            ))}
          </div>
        </div>

        <div className="dashboard-panel focus-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Focus</span>
              <h2>Current workload</h2>
            </div>
          </div>

          <div className="focus-number">{activeTasks.length}</div>

          <p>Open items across your course, study, and personal work.</p>

          <div className="focus-line">
            <span style={{ width: `${Math.min(completionRate, 100)}%` }} />
          </div>

          <div className="focus-meta">
            <span>{completedTasks.length} completed</span>
            <span>{tasks.length} total</span>
          </div>

          {learningProgress && (
            <div className="focus-meta detail-row">
              <span>{learningProgress.today.completed} today</span>
              <span>{learningProgress.week.completion_percent}% weekly completion</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DistributionRow({ label, count, total }) {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <div className="distribution-row">
      <div className="distribution-top">
        <span>{label}</span>
        <strong>{count}</strong>
      </div>

      <div className="distribution-track">
        <div
          className="distribution-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}
