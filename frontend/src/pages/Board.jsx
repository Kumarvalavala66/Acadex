import { useEffect, useMemo, useState } from "react";
import RubberSegment from "../components/RubberSegment";
import {
  getTasks,
  updateTaskStatus,
} from "../services/api";
import "./Board.css";

const COLUMNS = [
  {
    key: "todo",
    title: "To Do",
    description: "Not started yet",
  },
  {
    key: "in_progress",
    title: "In Progress",
    description: "Currently working on",
  },
  {
    key: "completed",
    title: "Completed",
    description: "Finished work",
  },
];

const FILTERS = ["All", "Assignments", "Projects", "Personal"];

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [error, setError] = useState("");

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
      setError(err.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = useMemo(() => {
    if (filter === "All") return tasks;

    const typeMap = {
      Assignments: "assignment",
      Projects: "project",
      Personal: "personal",
    };

    return tasks.filter(
      (task) => task.task_type === typeMap[filter]
    );
  }, [tasks, filter]);

  function getColumnTasks(status) {
    return filteredTasks.filter(
      (task) => task.status === status
    );
  }

  function handleDragStart(event, task) {
    setDraggedTask(task);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(task.id));
  }

  function handleDragEnd() {
    setDraggedTask(null);
    setDragOverColumn(null);
  }

  function handleDragOver(event, column) {
    event.preventDefault();

    if (!draggedTask) return;

    setDragOverColumn(column);
    event.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(event, status) {
    event.preventDefault();

    if (!draggedTask) return;

    const task = draggedTask;

    setDraggedTask(null);
    setDragOverColumn(null);

    if (task.status === status) return;

    const previousTasks = [...tasks];

    // Optimistic update
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, status }
          : item
      )
    );

    try {
      const updatedTask = await updateTaskStatus(
        task.id,
        status
      );

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id
            ? updatedTask
            : item
        )
      );
    } catch (err) {
      setTasks(previousTasks);
      setError(
        err.message || "Failed to update task status."
      );
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "No deadline";

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function isOverdue(dateString, status) {
    if (!dateString || status === "completed") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(`${dateString}T00:00:00`);

    return due < today;
  }

  return (
    <section className="page-container board-page">
      <div className="board-header">
        <div>
          <span className="eyebrow">WORKFLOW</span>
          <h1>Board</h1>
          <p>
            Move your work through each stage as you make progress.
          </p>
        </div>

        <div className="board-stats">
          <span>{tasks.length} total</span>
          <span>
            {tasks.filter((task) => task.status === "completed").length}{" "}
            completed
          </span>
        </div>
      </div>

      <div className="board-toolbar">
        <div className="board-filter">
          <RubberSegment
            items={FILTERS}
            ariaLabel="Filter tasks"
            defaultValue={filter}
            onChange={setFilter}
            trackColor="var(--segment-track)"
            thumbColor="var(--segment-thumb)"
            textColor="var(--segment-text)"
            activeTextColor="var(--segment-active-text)"
            size="md"
            radius={10}
            inset={3}
          />
        </div>
      </div>

      {error && (
        <div className="board-error">
          <span>{error}</span>
          <button type="button" onClick={loadTasks}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="board-loading">
          <div />
          <div />
          <div />
        </div>
      ) : (
        <div className="board-columns">
          {COLUMNS.map((column) => {
            const columnTasks = getColumnTasks(column.key);

            return (
              <div
                key={column.key}
                className={`board-column ${
                  dragOverColumn === column.key
                    ? "drag-over"
                    : ""
                }`}
                onDragOver={(event) =>
                  handleDragOver(event, column.key)
                }
                onDrop={(event) =>
                  handleDrop(event, column.key)
                }
              >
                <div className="board-column-header">
                  <div>
                    <div className="board-column-title">
                      <span
                        className={`board-status-dot ${column.key}`}
                      />
                      <h2>{column.title}</h2>
                    </div>

                    <p>{column.description}</p>
                  </div>

                  <span className="board-count">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="board-card-list">
                  {columnTasks.length === 0 ? (
                    <div className="board-empty-column">
                      <span>
                        {draggedTask
                          ? "Drop work here"
                          : "Nothing here"}
                      </span>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <article
                        key={task.id}
                        className={`board-card ${
                          draggedTask?.id === task.id
                            ? "is-dragging"
                            : ""
                        }`}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, task)
                        }
                        onDragEnd={handleDragEnd}
                      >
                        <div className="board-card-top">
                          <span
                            className={`board-type ${task.task_type}`}
                          >
                            {task.task_type}
                          </span>

                          <span
                            className={`board-priority ${task.priority}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h3>{task.title}</h3>

                        {task.description && (
                          <p className="board-card-description">
                            {task.description}
                          </p>
                        )}

                        <div className="board-card-meta">
                          {task.subject && (
                            <span>{task.subject}</span>
                          )}

                          <span
                            className={
                              isOverdue(
                                task.due_date,
                                task.status
                              )
                                ? "overdue"
                                : ""
                            }
                          >
                            {formatDate(task.due_date)}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
