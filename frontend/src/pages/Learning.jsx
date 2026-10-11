import { useEffect, useState } from "react";
import "./Learning.css";
import RubberSegment from "../components/RubberSegment";
import {
  getLearningTasks,
  createLearningTask,
  updateLearningTask,
  deleteLearningTask,
  getDiaryEntries,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  getLearningProgress,
} from "../services/api";

function Learning() {
  const [tasks, setTasks] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [progress, setProgress] = useState(null);

  const [activeTab, setActiveTab] = useState("tasks");

  const [taskForm, setTaskForm] = useState({
    title: "",
    subject: "",
    priority: "medium",
    due_date: "",
    estimated_minutes: "",
  });

  const [diaryForm, setDiaryForm] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    studied: "",
    completed: "",
    difficulties: "",
    tomorrow_plan: "",
    progress: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [tasksData, diaryData, progressData] = await Promise.all([
        getLearningTasks(),
        getDiaryEntries(),
        getLearningProgress(),
      ]);

      setTasks(tasksData);
      setDiaryEntries(diaryData);
      setProgress(progressData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load learning data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateTask(event) {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      return;
    }

    try {
      setSaving(true);

      await createLearningTask({
        title: taskForm.title,
        subject: taskForm.subject || null,
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        estimated_minutes: taskForm.estimated_minutes
          ? Number(taskForm.estimated_minutes)
          : null,
        status: "todo",
      });

      setTaskForm({
        title: "",
        subject: "",
        priority: "medium",
        due_date: "",
        estimated_minutes: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task, status) {
    try {
      await updateLearningTask(task.id, {
        status,
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("Delete this learning task?")) {
      return;
    }

    try {
      await deleteLearningTask(taskId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateDiary(event) {
    event.preventDefault();

    if (!diaryForm.studied.trim()) {
      return;
    }

    try {
      setSaving(true);

      await createDiaryEntry({
        ...diaryForm,
        progress: Number(diaryForm.progress),
      });

      setDiaryForm({
        entry_date: new Date().toISOString().split("T")[0],
        studied: "",
        completed: "",
        difficulties: "",
        tomorrow_plan: "",
        progress: 0,
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDiary(entryId) {
    if (!window.confirm("Delete this diary entry?")) {
      return;
    }

    try {
      await deleteDiaryEntry(entryId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-loading">Loading Learning...</div>
      </div>
    );
  }

  return (
    <div className="learning-page">
      {/* HEADER */}

      <div className="learning-header">
        <div>
          <h1>Learning</h1>
          <p>
            Organize your study tasks, track progress, and reflect on your
            learning.
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="learning-error">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* PROGRESS CARDS */}

      {progress && (
        <div className="learning-progress-grid">
          <div className="learning-stat-card">
            <span className="stat-label">Today's Tasks</span>

            <strong>
              {progress.today.completed}
              <small> / {progress.today.total}</small>
            </strong>

            <span className="stat-subtext">
              {progress.today.remaining} remaining
            </span>
          </div>

          <div className="learning-stat-card">
            <span className="stat-label">Today's Completion</span>

            <strong>{progress.today.completion_percent}%</strong>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress.today.completion_percent}%`,
                }}
              />
            </div>
          </div>

          <div className="learning-stat-card">
            <span className="stat-label">Weekly Completion</span>

            <strong>{progress.week.completion_percent}%</strong>

            <span className="stat-subtext">
              {progress.week.completed} of {progress.week.total} tasks
            </span>
          </div>

          <div className="learning-stat-card">
            <span className="stat-label">Diary Entries</span>

            <strong>{diaryEntries.length}</strong>

            <span className="stat-subtext">Learning reflections</span>
          </div>
        </div>
      )}

      {/* TABS */}

      <div className="learning-tabs">
        <RubberSegment
          items={["Tasks", "Diary", "Progress"]}
          ariaLabel="Learning sections"
          defaultValue={
            activeTab === "tasks"
              ? "Tasks"
              : activeTab === "diary"
                ? "Diary"
                : "Progress"
          }
          onChange={(value) => {
            if (value === "Tasks") {
              setActiveTab("tasks");
            } else if (value === "Diary") {
              setActiveTab("diary");
            } else if (value === "Progress") {
              setActiveTab("progress");
            }
          }}
          trackColor="var(--segment-track)"
          thumbColor="var(--segment-thumb)"
          textColor="var(--segment-text)"
          activeTextColor="var(--segment-active-text)"
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

      {/* ================================================= */}
      {/* TASKS */}
      {/* ================================================= */}

      {activeTab === "tasks" && (
        <div className="learning-section">
          <div className="learning-form-card">
            <h2>Add Learning Task</h2>

            <form onSubmit={handleCreateTask}>
              <div className="form-row">
                <div className="form-field form-wide">
                  <label>Task</label>

                  <input
                    type="text"
                    placeholder="e.g. Study SQL Joins"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Subject</label>

                  <input
                    type="text"
                    placeholder="DBMS"
                    value={taskForm.subject}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Priority</label>

                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Due Date</label>

                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Estimated Minutes</label>

                  <input
                    type="number"
                    min="1"
                    placeholder="60"
                    value={taskForm.estimated_minutes}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        estimated_minutes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving ? "Adding..." : "+ Add Learning Task"}
              </button>
            </form>
          </div>

          {/* TASK LIST */}

          <div className="learning-list-card">
            <div className="section-heading">
              <div>
                <h2>Your Learning Tasks</h2>
                <p>{tasks.length} total tasks</p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No learning tasks yet</h3>
                <p>Add your first study task above.</p>
              </div>
            ) : (
              <div className="learning-task-list">
                {tasks.map((task) => (
                  <div
                    className={`learning-task ${
                      task.status === "completed" ? "task-completed" : ""
                    }`}
                    key={task.id}
                  >
                    <div className="task-check">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={(e) =>
                          handleStatusChange(
                            task,
                            e.target.checked ? "completed" : "todo",
                          )
                        }
                      />
                    </div>

                    <div className="task-main">
                      <h3>{task.title}</h3>

                      <div className="task-meta">
                        {task.subject && <span>📘 {task.subject}</span>}

                        {task.due_date && <span>📅 {task.due_date}</span>}

                        {task.estimated_minutes && (
                          <span>⏱ {task.estimated_minutes} min</span>
                        )}
                      </div>
                    </div>

                    <span className={`priority priority-${task.priority}`}>
                      {task.priority}
                    </span>

                    <select
                      className="status-select"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                    >
                      <option value="todo">Todo</option>

                      <option value="in_progress">In Progress</option>

                      <option value="completed">Done</option>
                    </select>

                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* DIARY */}
      {/* ================================================= */}

      {activeTab === "diary" && (
        <div className="learning-section">
          <div className="learning-form-card">
            <h2>Learning Diary</h2>

            <p className="form-description">
              Record what you studied and how your day went.
            </p>

            <form onSubmit={handleCreateDiary}>
              <div className="form-row">
                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    value={diaryForm.entry_date}
                    onChange={(e) =>
                      setDiaryForm({
                        ...diaryForm,
                        entry_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Progress</label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={diaryForm.progress}
                    onChange={(e) =>
                      setDiaryForm({
                        ...diaryForm,
                        progress: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>What did you study?</label>

                <textarea
                  rows="3"
                  placeholder="Example: Studied normalization and functional dependencies..."
                  value={diaryForm.studied}
                  onChange={(e) =>
                    setDiaryForm({
                      ...diaryForm,
                      studied: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>What did you complete?</label>

                <textarea
                  rows="3"
                  placeholder="What topics, exercises, or assignments did you finish?"
                  value={diaryForm.completed}
                  onChange={(e) =>
                    setDiaryForm({
                      ...diaryForm,
                      completed: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Difficulties</label>

                <textarea
                  rows="3"
                  placeholder="What was difficult or confusing?"
                  value={diaryForm.difficulties}
                  onChange={(e) =>
                    setDiaryForm({
                      ...diaryForm,
                      difficulties: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Tomorrow's Plan</label>

                <textarea
                  rows="3"
                  placeholder="What do you want to study tomorrow?"
                  value={diaryForm.tomorrow_plan}
                  onChange={(e) =>
                    setDiaryForm({
                      ...diaryForm,
                      tomorrow_plan: e.target.value,
                    })
                  }
                />
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Diary Entry"}
              </button>
            </form>
          </div>

          {/* DIARY HISTORY */}

          <div className="learning-list-card">
            <div className="section-heading">
              <div>
                <h2>Diary History</h2>
                <p>Your recent learning reflections</p>
              </div>
            </div>

            {diaryEntries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3>No diary entries yet</h3>
                <p>Your learning reflections will appear here.</p>
              </div>
            ) : (
              <div className="diary-list">
                {diaryEntries.map((entry) => (
                  <div className="diary-entry" key={entry.id}>
                    <div className="diary-date">
                      <strong>{entry.entry_date}</strong>

                      <span>{entry.progress}% progress</span>
                    </div>

                    <div className="diary-content">
                      <div>
                        <strong>Studied</strong>

                        <p>{entry.studied}</p>
                      </div>

                      {entry.completed && (
                        <div>
                          <strong>Completed</strong>

                          <p>{entry.completed}</p>
                        </div>
                      )}

                      {entry.difficulties && (
                        <div>
                          <strong>Difficulties</strong>

                          <p>{entry.difficulties}</p>
                        </div>
                      )}

                      {entry.tomorrow_plan && (
                        <div>
                          <strong>Tomorrow</strong>

                          <p>{entry.tomorrow_plan}</p>
                        </div>
                      )}
                    </div>

                    <button
                      className="delete-button"
                      onClick={() => handleDeleteDiary(entry.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* PROGRESS */}
      {/* ================================================= */}

      {activeTab === "progress" && progress && (
        <div className="learning-section">
          <div className="learning-list-card">
            <div className="section-heading">
              <div>
                <h2>Subject Progress</h2>
                <p>See how you're progressing across subjects.</p>
              </div>
            </div>

            {progress.subject_breakdown.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No subject data yet</h3>
                <p>Add learning tasks with subjects to see progress.</p>
              </div>
            ) : (
              <div className="subject-progress-list">
                {progress.subject_breakdown.map((subject) => (
                  <div className="subject-progress" key={subject.subject}>
                    <div className="subject-header">
                      <strong>{subject.subject}</strong>

                      <span>
                        {subject.completed} / {subject.total}
                      </span>
                    </div>

                    <div className="progress-bar large">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${subject.completion_percent}%`,
                        }}
                      />
                    </div>

                    <span className="subject-percent">
                      {subject.completion_percent}% complete
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="learning-list-card">
            <div className="section-heading">
              <div>
                <h2>Recent Diary Progress</h2>
                <p>Your last few learning days.</p>
              </div>
            </div>

            <div className="diary-progress-list">
              {progress.recent_diary.length === 0 ? (
                <div className="empty-state">No diary progress yet.</div>
              ) : (
                progress.recent_diary.map((entry) => (
                  <div className="diary-progress-item" key={entry.id}>
                    <div>
                      <strong>{entry.entry_date}</strong>

                      <p>{entry.studied}</p>
                    </div>

                    <strong>{entry.progress}%</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Learning;
