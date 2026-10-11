import { useEffect, useMemo, useState } from "react";

import RubberSegment from "../components/RubberSegment";
import SwipeRow from "../components/SwipeRow";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../services/api";

import "./Work.css";

const FILTERS = [
  "All",
  "Assignments",
  "Projects",
  "Personal",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  task_type: "assignment",
  subject: "",
  priority: "medium",
  due_date: "",
};

export default function Work() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] =
    useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

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

  function openCreateForm() {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEditForm(task) {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      task_type: task.task_type || "assignment",
      subject: task.subject || "",
      priority: task.priority || "medium",
      due_date: task.due_date || "",
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingTask(null);
    setForm(EMPTY_FORM);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim() || null,
        task_type: form.task_type,
        subject:
          form.subject.trim() || null,
        priority: form.priority,
        due_date: form.due_date || null,
      };

      if (editingTask) {
        const updated = await updateTask(
          editingTask.id,
          payload
        );

        setTasks((current) =>
          current.map((task) =>
            task.id === updated.id
              ? updated
              : task
          )
        );
      } else {
        const created =
          await createTask(payload);

        setTasks((current) => [
          created,
          ...current,
        ]);
      }

      closeForm();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Could not save the work."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteTask(task.id);

      setTasks((current) =>
        current.filter(
          (item) => item.id !== task.id
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Could not delete the work."
      );
    }
  }

  async function handleStatusChange(
    task,
    status
  ) {
    try {
      setError("");

      const updated =
        await updateTaskStatus(
          task.id,
          status
        );

      setTasks((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not update the status."
      );
    }
  }

  const filteredTasks = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return [...tasks]
      .filter((task) => {
        if (filter === "All") return true;

        if (filter === "Assignments") {
          return task.task_type === "assignment";
        }

        if (filter === "Projects") {
          return task.task_type === "project";
        }

        if (filter === "Personal") {
          return task.task_type === "personal";
        }

        return true;
      })
      .filter((task) => {
        if (!normalizedSearch) return true;

        return [
          task.title,
          task.description,
          task.subject,
          task.task_type,
        ]
          .filter(Boolean)
          .some((value) =>
            value
              .toLowerCase()
              .includes(normalizedSearch)
          );
      })
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;

        return (
          new Date(a.due_date) -
          new Date(b.due_date)
        );
      });
  }, [tasks, filter, search]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      assignments: tasks.filter(
        (task) =>
          task.task_type === "assignment"
      ).length,
      projects: tasks.filter(
        (task) =>
          task.task_type === "project"
      ).length,
      personal: tasks.filter(
        (task) =>
          task.task_type === "personal"
      ).length,
    }),
    [tasks]
  );

  return (
    <section className="work-page">
      <header className="work-header">
        <div>
          <span className="eyebrow">Acadex</span>

          <h1>Work</h1>

          <p>
            Manage assignments, projects and
            personal work.
          </p>
        </div>

        <button
          type="button"
          className="work-add-button"
          onClick={openCreateForm}
        >
          <span>+</span>
          Add work
        </button>
      </header>

      {error && (
        <div className="work-error">
          {error}
        </div>
      )}

      <section className="work-toolbar">
        <div className="work-filter">
          <RubberSegment
            items={FILTERS}
            ariaLabel="Filter work"
            defaultValue={filter}
            onChange={setFilter}
            trackColor="var(--segment-track)"
            thumbColor="var(--segment-thumb)"
            textColor="var(--segment-text)"
            activeTextColor="var(--segment-active-text)"
            size="md"
            radius={9}
            inset={3}
            equalSlots
            stretch={100}
            squash={3}
            speed={1}
            glide={75}
            draggable
          />
        </div>

        <div className="work-search">
          <input
            type="search"
            placeholder="Search work..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </section>

      <section className="work-summary">
        <span>
          {counts.all} total
        </span>

        <span>
          {counts.assignments} assignments
        </span>

        <span>
          {counts.projects} projects
        </span>

        <span>
          {counts.personal} personal
        </span>
      </section>

      <section className="work-list">
        {loading ? (
          <WorkLoading />
        ) : filteredTasks.length === 0 ? (
          <EmptyWork
            search={search}
            filter={filter}
            onAdd={openCreateForm}
          />
        ) : (
          filteredTasks.map((task) => (
            <WorkItem
              key={task.id}
              task={task}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onStatusChange={
                handleStatusChange
              }
            />
          ))
        )}
      </section>

      {showForm && (
        <TaskModal
          form={form}
          editingTask={editingTask}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </section>
  );
}

function WorkItem({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const completed =
    task.status === "completed";

  return (
    <SwipeRow
      actions={[
        { id: "edit", label: "Edit", icon: "✎" },
        { id: "delete", label: "Delete", icon: "⌫" },
      ]}
      onAction={(action) => {
        if (action.id === "edit") {
          onEdit(task);
          return;
        }

        onDelete(task);
      }}
      actionColor={completed ? "#ef4444" : "#2563eb"}
      drawerColor="#111827"
      rowColor="var(--work-card-background)"
      textColor="#111827"
      height={104}
      radius={18}
      actionWidth={92}
      direction="left"
      commitAt={0.45}
      collapseMs={180}
    >
      <article
        className={`work-item ${
          completed ? "completed" : ""
        }`}
      >
        <button
          type="button"
          className="work-status"
          aria-label={
            completed
              ? "Mark as incomplete"
              : "Mark as completed"
          }
          onClick={() =>
            onStatusChange(
              task,
              completed ? "todo" : "completed"
            )
          }
        >
          <span
            className={
              completed ? "status-dot checked" : "status-dot"
            }
          >
            {completed ? "✓" : ""}
          </span>
        </button>

        <div className="work-main">
          <div className="work-item-top">
            <div className="work-title-group">
              <h3>{task.title}</h3>

              <div className="work-meta">
                <span>
                  {formatTaskType(task.task_type)}
                </span>

                {task.subject && (
                  <>
                    <span className="meta-divider">
                      /
                    </span>

                    <span>{task.subject}</span>
                  </>
                )}
              </div>
            </div>

            <span
              className={`priority-badge priority-${task.priority}`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="work-description">
              {task.description}
            </p>
          )}

          <div className="work-item-bottom">
            <span className="work-due">
              {task.due_date
                ? `Due ${formatDate(
                    task.due_date
                  )}`
                : "No due date"}
            </span>

            <div className="work-actions">
              <button
                type="button"
                onClick={() => onEdit(task)}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(task)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </article>
    </SwipeRow>
  );
}

function TaskModal({
  form,
  editingTask,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="task-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="task-modal">
        <div className="task-modal-header">
          <div>
            <span className="panel-kicker">
              Work
            </span>

            <h2>
              {editingTask
                ? "Edit work"
                : "Add work"}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="title">
              Title
            </label>

            <input
              id="title"
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="e.g. DBMS Assignment"
              autoFocus
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Optional details..."
              rows="3"
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="task_type">
                Type
              </label>

              <select
                id="task_type"
                name="task_type"
                value={form.task_type}
                onChange={onChange}
              >
                <option value="assignment">
                  Assignment
                </option>

                <option value="project">
                  Project
                </option>

                <option value="personal">
                  Personal
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="priority">
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={onChange}
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="subject">
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={onChange}
                placeholder="e.g. DBMS"
              />
            </div>

            <div className="form-field">
              <label htmlFor="due_date">
                Due date
              </label>

              <input
                id="due_date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="task-modal-footer">
            <button
              type="button"
              className="modal-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="modal-save"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingTask
                ? "Save changes"
                : "Create work"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WorkLoading() {
  return (
    <div className="work-loading">
      <div />
      <div />
      <div />
    </div>
  );
}

function EmptyWork({
  search,
  filter,
  onAdd,
}) {
  const filtered =
    filter !== "All" || search.trim();

  return (
    <div className="work-empty">
      <span className="work-empty-line" />

      <h2>
        {filtered
          ? "Nothing matches."
          : "No work yet."}
      </h2>

      <p>
        {filtered
          ? "Try another search or filter."
          : "Add your first assignment, project or personal task."}
      </p>

      {!filtered && (
        <button
          type="button"
          onClick={onAdd}
        >
          Add your first work
        </button>
      )}
    </div>
  );
}

function formatTaskType(type) {
  if (type === "assignment") {
    return "Assignment";
  }

  if (type === "project") {
    return "Project";
  }

  return "Personal";
}

function formatDate(date) {
  if (!date) return "No date";

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
