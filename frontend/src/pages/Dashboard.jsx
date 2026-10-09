import { useEffect, useMemo, useState } from "react";

import RubberSegment from "../components/RubberSegment";
import SpringCheck from "../components/SpringCheck";

import { getTasks, updateTaskStatus } from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [period, setPeriod] = useState("Week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks();

      setTasks(data);
    } catch (err) {
      console.error(err);

      setError("Unable to load your work.");
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

  const upcoming = useMemo(() => {
    return [...activeTasks]
      .filter((task) => task.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  }, [activeTasks]);

  function formatDate(date) {
    if (!date) return "No date";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

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

          <p>Here's what needs your attention.</p>
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
          <span>Open work</span>

          <strong>{activeTasks.length}</strong>

          <small>tasks remaining</small>
        </div>

        <div className="overview-card">
          <span>Assignments</span>

          <strong>{assignments.length}</strong>

          <small>academic submissions</small>
        </div>

        <div className="overview-card">
          <span>Projects</span>

          <strong>{projects.length}</strong>

          <small>active projects</small>
        </div>

        <div className="overview-card">
          <span>Completed</span>

          <strong>{completedTasks.length}</strong>

          <small>finished tasks</small>
        </div>
      </section>

      <section className="dashboard-columns">
        <div className="dashboard-panel tasks-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Work</span>

              <h2>Things to finish</h2>
            </div>

            <span className="panel-count">{activeTasks.length}</span>
          </div>

          {loading ? (
            <div className="task-loading">
              <div />
              <div />
              <div />
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="empty-state">
              <strong>Nothing waiting.</strong>

              <p>Your task list is clear.</p>
            </div>
          ) : (
            <div className="todo-list">
              {activeTasks.slice(0, 6).map((task) => (
                <SpringCheck
                  key={task.id}
                  label={task.title}
                  defaultChecked={task.status === "completed"}
                  onChange={(checked) => handleTaskChange(task, checked)}
                  color="#20221f"
                  fillColor="#20221f"
                  checkColor="#f4f1ea"
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
              <span className="panel-kicker">Schedule</span>

              <h2>Coming up</h2>
            </div>
          </div>

          {upcoming.length === 0 ? (
            <div className="empty-state">
              <strong>No deadlines yet.</strong>

              <p>Add work with a due date to see it here.</p>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcoming.map((task, index) => (
                <div className="upcoming-item" key={task.id}>
                  <div className="date-column">
                    <span>{formatDate(task.due_date)}</span>
                  </div>

                  <div className="upcoming-content">
                    <strong>{task.title}</strong>

                    <span>{task.subject || task.task_type}</span>
                  </div>

                  <span className={`priority priority-${task.priority}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="dashboard-panel progress-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Overview</span>

              <h2>Work distribution</h2>
            </div>
          </div>

          <div className="distribution">
            <DistributionRow
              label="Assignments"
              count={assignments.length}
              total={tasks.length}
            />

            <DistributionRow
              label="Projects"
              count={projects.length}
              total={tasks.length}
            />

            <DistributionRow
              label="Personal"
              count={personal.length}
              total={tasks.length}
            />
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

          <p>open items across your academic and personal work.</p>

          <div className="focus-line">
            <span />
          </div>

          <div className="focus-meta">
            <span>{completedTasks.length} completed</span>

            <span>{tasks.length} total</span>
          </div>
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
