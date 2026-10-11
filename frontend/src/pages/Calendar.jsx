import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  createTask,
  deleteTask,
  getExamSchedule,
  getLearningTasks,
  getPublicHolidays,
  getTasks,
  updateTask,
} from "../services/api";
import "./Calendar.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VIEWS = ["Month", "Week", "Day"];
const FILTERS = ["All", "Assignments", "Projects", "Personal", "Exams", "Learning", "Holidays"];
const TASK_TYPES = ["assignment", "project", "personal"];
const EVENT_LIMIT = 3;
const INITIAL_TODAY_KEY = getDateKey(new Date());
const INITIAL_TODAY = dateFromKey(INITIAL_TODAY_KEY);

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameDay(dateA, dateB) {
  return getDateKey(dateA) === getDateKey(dateB);
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateKey) {
  return dateFromKey(dateKey).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function makeDateRange(start, end) {
  const dates = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (cursor <= last) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function getTaskTypeLabel(type) {
  return {
    assignment: "Assignment",
    project: "Project",
    personal: "Personal",
  }[type] || "Task";
}

function getEventTypeLabel(event) {
  if (TASK_TYPES.includes(event.type)) return getTaskTypeLabel(event.type);
  return {
    exam: "Exam",
    learning: "Learning",
    holiday: "Holiday",
  }[event.type] || "Event";
}

function getEventMetaLabel(event) {
  if (TASK_TYPES.includes(event.type) || event.type === "learning") {
    return "Due date";
  }
  if (event.type === "exam") {
    return event.isTentative ? "Tentative exam" : "Exam";
  }
  return "Holiday";
}

const DEMO_EVENT_OPTIONS = {
  exam: [
    { title: "Biology midterm", subject: "Biology" },
    { title: "Calculus exam", subject: "Mathematics" },
    { title: "World history exam", subject: "History" },
    { title: "Chemistry test", subject: "Chemistry" },
  ],
  assignment: [
    { title: "Submit lab report", subject: "Biology" },
    { title: "Essay draft due", subject: "English" },
    { title: "Problem set due", subject: "Mathematics" },
    { title: "Reading response", subject: "History" },
  ],
  project: [
    { title: "Research project checkpoint", subject: "Science" },
    { title: "Group presentation", subject: "English" },
  ],
  personal: [
    { title: "Organize study notes", subject: "Personal" },
    { title: "Weekly planning", subject: "Personal" },
  ],
  learning: [
    { title: "Review lecture notes", subject: "Physics" },
    { title: "Practice vocabulary", subject: "Language" },
    { title: "Complete reading session", subject: "Literature" },
    { title: "Revise key concepts", subject: "Chemistry" },
  ],
};

const DEMO_EVENT_PLAN = [
  "exam",
  "assignment",
  "learning",
  "project",
  "exam",
  "learning",
  "assignment",
  "personal",
  "exam",
  "learning",
  "project",
  "assignment",
  "learning",
  "assignment",
];

function createDemoEvents(selectedDate, holidays) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  let randomState = (year * 100 + month + 1) >>> 0;

  function random() {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
  }

  const holidayDates = new Set(holidays.map((holiday) => holiday.date));
  const availableDates = makeDateRange(
    new Date(year, month, 1),
    new Date(year, month + 1, 0),
  ).filter((date) => !holidayDates.has(getDateKey(date)));

  return DEMO_EVENT_PLAN.flatMap((type, index) => {
    const eligibleIndices = availableDates.flatMap((date, dateIndex) =>
      type !== "exam" || (date.getDay() > 0 && date.getDay() < 6)
        ? [dateIndex]
        : [],
    );
    if (!eligibleIndices.length) return [];

    const selectedIndex =
      eligibleIndices[Math.floor(random() * eligibleIndices.length)];
    const [date] = availableDates.splice(selectedIndex, 1);
    const options = DEMO_EVENT_OPTIONS[type];
    const option = options[Math.floor(random() * options.length)];
    const dateKey = getDateKey(date);

    return [{
      id: `demo-${type}-${dateKey}-${index}`,
      type,
      kind: "demo",
      title: option.title,
      date: dateKey,
      status: null,
      subject: option.subject,
      priority: type === "exam" ? "high" : "medium",
      description: null,
      isTentative: false,
    }];
  });
}

function createEmptyForm(dateKey) {
  return {
    title: "",
    description: "",
    task_type: "assignment",
    subject: "",
    priority: "medium",
    due_date: dateKey,
  };
}

function taskAsEvent(task) {
  return {
    id: `task-${task.id}`,
    entityId: task.id,
    type: task.task_type,
    kind: "task",
    title: task.title,
    date: task.due_date,
    status: task.status,
    subject: task.subject,
    priority: task.priority,
    description: task.description,
  };
}

function learningTaskAsEvent(task) {
  return {
    id: `learning-${task.id}`,
    entityId: task.id,
    type: "learning",
    kind: "learning",
    title: task.title,
    date: task.due_date,
    status: task.status,
    subject: task.subject,
    priority: task.priority,
    description: null,
  };
}

function examAsEvent(exam) {
  return {
    id: `exam-${exam.id}`,
    entityId: exam.id,
    type: "exam",
    kind: "exam",
    title: exam.exam_name,
    date: exam.exam_date,
    status: null,
    subject: exam.subject,
    priority: "high",
    description: exam.notes,
    examType: exam.exam_type,
    isTentative: exam.is_tentative,
  };
}

function holidayAsEvent(holiday, index) {
  return {
    id: `holiday-${holiday.date}-${holiday.name}-${index}`,
    type: "holiday",
    kind: "holiday",
    title: holiday.name,
    date: holiday.date,
  };
}

function eventRoute(event) {
  if (event.type === "exam") return "/exams";
  if (event.type === "learning") return "/learning";
  if (TASK_TYPES.includes(event.type)) return "/work";
  return null;
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(
    dateFromKey(INITIAL_TODAY_KEY),
  );
  const [view, setView] = useState("Month");
  const [filter, setFilter] = useState("All");
  const [tasks, setTasks] = useState([]);
  const [learningTasks, setLearningTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [taskForm, setTaskForm] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [moreEventsDate, setMoreEventsDate] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [movingTaskId, setMovingTaskId] = useState(null);

  const loadCalendarData = useCallback(async () => {
    try {
      const [taskData, learningData, examData, holidayData] = await Promise.all([
        getTasks(),
        getLearningTasks(),
        getExamSchedule(),
        getPublicHolidays(),
      ]);
      setTasks(taskData || []);
      setLearningTasks(learningData || []);
      setExams(examData || []);
      setHolidays(holidayData || []);
    } catch (err) {
      console.error("Calendar loading error:", err);
      setError(err.message || "Failed to load calendar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  const demoEvents = useMemo(() => {
    if (loading || error || tasks.length || learningTasks.length || exams.length) {
      return [];
    }
    return createDemoEvents(selectedDate, holidays);
  }, [error, exams.length, holidays, learningTasks.length, loading, selectedDate, tasks.length]);

  const visibleDates = useMemo(() => {
    if (view === "Day") return [new Date(selectedDate)];
    if (view === "Week") {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return makeDateRange(weekStart, weekEnd);
    }

    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    return makeDateRange(gridStart, new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + 41));
  }, [selectedDate, view]);

  const eventsByDate = useMemo(() => {
    const grouped = new Map();
    const add = (event) => {
      if (!event.date) return;
      const list = grouped.get(event.date) || [];
      list.push(event);
      grouped.set(event.date, list);
    };

    tasks.forEach((task) => add(taskAsEvent(task)));
    learningTasks.forEach((task) => add(learningTaskAsEvent(task)));
    exams.forEach((exam) => add(examAsEvent(exam)));
    holidays.forEach((holiday, index) => add(holidayAsEvent(holiday, index)));
    demoEvents.forEach(add);

    for (const [dateKey, events] of grouped) {
      grouped.set(
        dateKey,
        events.sort((a, b) => {
          const typeOrder = { exam: 0, assignment: 1, project: 2, personal: 3, learning: 4, holiday: 5 };
          return typeOrder[a.type] - typeOrder[b.type] || a.title.localeCompare(b.title);
        }),
      );
    }
    return grouped;
  }, [demoEvents, exams, holidays, learningTasks, tasks]);

  const selectedKey = getDateKey(selectedDate);

  const filteredEventsByDate = useMemo(() => {
    const filtered = new Map();
    for (const [dateKey, events] of eventsByDate) {
      const result = filter === "All"
        ? events
        : events.filter((event) => {
            if (filter === "Assignments") return event.type === "assignment";
            if (filter === "Projects") return event.type === "project";
            if (filter === "Personal") return event.type === "personal";
            if (filter === "Exams") return event.type === "exam";
            if (filter === "Learning") return event.type === "learning";
            return event.type === "holiday";
          });
      filtered.set(dateKey, result);
    }
    return filtered;
  }, [eventsByDate, filter]);

  const selectedEvents = filteredEventsByDate.get(selectedKey) || [];

  const upcomingEvents = useMemo(() => {
    const windowEnd = new Date(selectedDate);
    windowEnd.setDate(windowEnd.getDate() + 13);
    const endKey = getDateKey(windowEnd);

    return [...filteredEventsByDate.entries()]
      .filter(([dateKey]) => dateKey >= selectedKey && dateKey <= endKey)
      .flatMap(([, events]) => events)
      .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  }, [filteredEventsByDate, selectedDate, selectedKey]);

  const title = useMemo(() => {
    if (view === "Month") {
      return selectedDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }
    if (view === "Day") return formatDate(selectedDate);
    const first = visibleDates[0];
    const last = visibleDates[visibleDates.length - 1];
    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString(undefined, { month: "long" })} ${first.getDate()}–${last.getDate()}, ${last.getFullYear()}`;
    }
    return `${first.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${last.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }, [selectedDate, view, visibleDates]);

  function navigatePeriod(direction) {
    const next = new Date(selectedDate);
    if (view === "Month") {
      setSelectedDate(new Date(next.getFullYear(), next.getMonth() + direction, 1));
      return;
    }
    else if (view === "Week") next.setDate(next.getDate() + direction * 7);
    else next.setDate(next.getDate() + direction);
    setSelectedDate(next);
  }

  function goToToday() {
    const today = new Date();
    setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  function selectDate(date) {
    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    setMoreEventsDate(null);
  }

  function openCreateForm(dateKey = selectedKey) {
    setFormError("");
    setEditingTask(null);
    setTaskForm(createEmptyForm(dateKey));
  }

  function openEditForm(event) {
    const task = tasks.find((item) => item.id === event.entityId);
    if (!task) return;
    setFormError("");
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      task_type: task.task_type,
      subject: task.subject || "",
      priority: task.priority || "medium",
      due_date: task.due_date || selectedKey,
    });
  }

  async function saveTask(event) {
    event.preventDefault();
    const titleText = taskForm.title.trim();
    if (!titleText) {
      setFormError("Enter a title for the scheduled task.");
      return;
    }
    if (!taskForm.due_date) {
      setFormError("Choose a due date for the scheduled task.");
      return;
    }

    const payload = {
      ...taskForm,
      title: titleText,
      description: taskForm.description.trim() || null,
      subject: taskForm.subject.trim() || null,
      due_date: taskForm.due_date,
    };

    try {
      setSaving(true);
      setError("");
      setFormError("");
      const savedTask = editingTask
        ? await updateTask(editingTask.id, payload)
        : await createTask(payload);
      setTasks((current) =>
        editingTask
          ? current.map((task) => (task.id === savedTask.id ? savedTask : task))
          : [...current, savedTask],
      );
      selectDate(dateFromKey(savedTask.due_date));
      setTaskForm(null);
      setEditingTask(null);
    } catch (err) {
      const message = err.message || "Unable to save this schedule item.";
      setFormError(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(task) {
    if (!window.confirm(`Delete "${task.title}" from your schedule?`)) return;
    try {
      setError("");
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (err) {
      setError(err.message || "Unable to delete this task.");
    }
  }

  async function moveTask(task, dateKey) {
    if (task.due_date === dateKey || movingTaskId) return;
    const previousTasks = tasks;
    selectDate(dateFromKey(dateKey));
    setTasks((current) =>
      current.map((item) => item.id === task.id ? { ...item, due_date: dateKey } : item),
    );
    setMovingTaskId(task.id);
    setError("");
    try {
      const updated = await updateTask(task.id, { due_date: dateKey });
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message || "Couldn't move the task to the new date.");
    } finally {
      setMovingTaskId(null);
      setDraggedTask(null);
      setDragOverDate(null);
    }
  }

  function getFilteredEvents(dateKey) {
    return filteredEventsByDate.get(dateKey) || [];
  }

  function handleDateKeyDown(event, date) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDate(date);
      return;
    }

    let dayDelta = 0;
    if (event.key === "ArrowLeft") dayDelta = -1;
    if (event.key === "ArrowRight") dayDelta = 1;
    if (event.key === "ArrowUp") dayDelta = -7;
    if (event.key === "ArrowDown") dayDelta = 7;
    if (!dayDelta) return;
    event.preventDefault();
    const next = new Date(date);
    next.setDate(next.getDate() + dayDelta);
    selectDate(next);
  }

  return (
    <section className="page-container calendar-page">
      <header className="calendar-header">
        <div>
          <p className="calendar-eyebrow">Your planner</p>
          <h1>Calendar</h1>
          <p className="calendar-subtitle">Your academic schedule, at a glance.</p>
        </div>
        <div className="calendar-header-actions">
          <button type="button" className="calendar-today-button" onClick={goToToday}>Today</button>
          <button type="button" className="calendar-add-button" onClick={() => openCreateForm()}>
            <span aria-hidden="true">+</span> Add schedule
          </button>
        </div>
      </header>

      <div className="calendar-legend" aria-label="Schedule categories">
        {[
          ["assignment", "Tasks"],
          ["exam", "Exams"],
          ["learning", "Learning"],
          ["holiday", "Holidays"],
        ].map(([type, label]) => (
          <span key={type}><i className={`calendar-legend-dot ${type}`} />{label}</span>
        ))}
        {demoEvents.length > 0 && (
          <span className="calendar-demo-note" role="status">
            Sample timetable · preview data
          </span>
        )}
        <label className="calendar-filter-control">
          <span className="sr-only">Filter calendar events</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            {FILTERS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {error && (
        <div className="calendar-error" role="alert">
          <span>{error}</span>
          <button type="button" aria-label="Dismiss error" onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="calendar-workspace">
        <aside className="calendar-date-rail">
          <div className="calendar-rail-heading">
            <div className="calendar-period-control">
              <button type="button" aria-label="Previous period" onClick={() => navigatePeriod(-1)}>‹</button>
              <h2 aria-live="polite">{title}</h2>
              <button type="button" aria-label="Next period" onClick={() => navigatePeriod(1)}>›</button>
            </div>
            <div className="calendar-view-switch" role="group" aria-label="Calendar view">
              {VIEWS.map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={view === item}
                  className={view === item ? "active" : ""}
                  onClick={() => setView(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <section className={`calendar-card view-${view.toLowerCase()}`} aria-label={`${view} calendar`}>
          <div className="calendar-weekdays" style={{ "--calendar-columns": view === "Month" ? 7 : visibleDates.length }}>
            {(view === "Month" ? WEEKDAYS.map((day) => ({ day })) : visibleDates.map((date) => ({ date, day: WEEKDAYS[date.getDay()] }))).map(({ date, day }) => (
              <div className="calendar-weekday" key={date ? getDateKey(date) : day}>
                {view === "Month" ? day : (
                  <span>{day} <strong>{date.getDate()}</strong></span>
                )}
              </div>
            ))}
          </div>
          <div className="calendar-grid" style={{ "--calendar-columns": view === "Month" ? 7 : visibleDates.length }}>
            {visibleDates.map((date) => {
              const key = getDateKey(date);
              const events = getFilteredEvents(key);
              const currentMonth = date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
              return (
                <div
                  key={key}
                  role="group"
                  tabIndex={0}
                  className={[
                    "calendar-day",
                    !currentMonth && view === "Month" ? "outside-month" : "",
                    isSameDay(date, INITIAL_TODAY) ? "today" : "",
                    isSameDay(date, selectedDate) ? "selected" : "",
                    dragOverDate === key ? "drag-over" : "",
                  ].filter(Boolean).join(" ")}
                  aria-label={`${formatDate(date)}, ${events.length} scheduled ${events.length === 1 ? "item" : "items"}${isSameDay(date, selectedDate) ? ", selected" : ""}`}
                  aria-current={key === INITIAL_TODAY_KEY ? "date" : undefined}
                  onClick={() => selectDate(date)}
                  onKeyDown={(event) => handleDateKeyDown(event, date)}
                  onDragOver={(event) => {
                    if (!draggedTask) return;
                    event.preventDefault();
                    setDragOverDate(key);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedTask) moveTask(draggedTask, key);
                  }}
                >
                  <span className="calendar-day-number">{date.getDate()}</span>
                  <span className="calendar-day-events">
                    {events.slice(0, EVENT_LIMIT).map((item) => (
                      <span
                        className={`calendar-event-chip ${item.type} ${item.status === "completed" ? "completed" : ""} ${draggedTask?.id === item.entityId ? "is-dragging" : ""}`}
                        key={item.id}
                        draggable={item.kind === "task" && movingTaskId !== item.entityId}
                        title={`${item.title} · ${getEventTypeLabel(item)}${TASK_TYPES.includes(item.type) || item.type === "learning" ? " due" : ""}`}
                        onDragStart={(event) => {
                          if (item.kind !== "task") return;
                          setDraggedTask(tasks.find((task) => task.id === item.entityId));
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", String(item.entityId));
                        }}
                        onDragEnd={() => {
                          setDraggedTask(null);
                          setDragOverDate(null);
                        }}
                      >
                        <i />
                        <span>{item.title}</span>
                      </span>
                    ))}
                    {events.length > EVENT_LIMIT && (
                      <button type="button" className="calendar-more" onClick={(event) => {
                        event.stopPropagation();
                        selectDate(date);
                        setMoreEventsDate(key);
                      }}>
                        +{events.length - EVENT_LIMIT} more
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          {loading && <div className="calendar-loading" role="status">Loading your schedule…</div>}
          {!loading && visibleDates.every((date) => getFilteredEvents(getDateKey(date)).length === 0) && (
            <div className="calendar-month-empty">
              <strong>No items in this period.</strong>
              <span>New task deadlines and exam dates will appear here.</span>
            </div>
          )}
          </section>
        </aside>

        <section className="calendar-schedule-pane">
          <div className="calendar-schedule-heading">
            <span className="calendar-section-kicker">Next two weeks</span>
            <h2>Schedule</h2>
            <p>Items from {selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} onward</p>
          </div>
          <div className="calendar-schedule-list">
            {upcomingEvents.map((item, index) => {
              const route = eventRoute(item);
              const showDate = index === 0 || upcomingEvents[index - 1].date !== item.date;
              return (
                <article className={`calendar-schedule-item ${item.type}`} key={item.id}>
                  {showDate && (
                    <div className="calendar-schedule-date">
                      <span>{dateFromKey(item.date).toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}</span>
                      <strong>{dateFromKey(item.date).getDate()}</strong>
                    </div>
                  )}
                  {!showDate && <div className="calendar-schedule-date-spacer" />}
                  <i className="calendar-schedule-marker" />
                  <div className="calendar-schedule-copy">
                    <span className="calendar-schedule-type">{getEventTypeLabel(item)}</span>
                    <strong>{route ? <Link to={route}>{item.title}</Link> : item.title}</strong>
                    {item.subject && <span className="calendar-schedule-subject">{item.subject}</span>}
                    <span className="calendar-schedule-meta">
                      {getEventMetaLabel(item)}
                      {item.status ? ` · ${item.status.replace("_", " ")}` : ""}
                    </span>
                  </div>
                </article>
              );
            })}
            {!upcomingEvents.length && (
              <div className="calendar-schedule-empty">
                <strong>Nothing coming up yet.</strong>
                <p>Add a task with a due date, or keep your learning plan updated.</p>
                <button type="button" className="calendar-inline-action" onClick={() => openCreateForm(selectedKey)}>Add a schedule item</button>
              </div>
            )}
          </div>
        </section>

        <aside className="calendar-agenda">
          <div className="calendar-agenda-header">
            <div>
              <span className="calendar-section-kicker">Selected day</span>
              <h2>{formatDate(selectedDate)}</h2>
              <p>{selectedEvents.length} {selectedEvents.length === 1 ? "scheduled item" : "scheduled items"}</p>
            </div>
            <button type="button" className="calendar-icon-action" aria-label="Add schedule item on selected date" onClick={() => openCreateForm(selectedKey)}>+</button>
          </div>

          <div className="calendar-agenda-list">
            {selectedEvents.map((item) => {
              const route = eventRoute(item);
              const task = item.kind === "task" ? tasks.find((entry) => entry.id === item.entityId) : null;
              return (
                <article className={`calendar-agenda-item ${item.type}`} key={item.id}>
                  <i className="calendar-agenda-marker" />
                  <div className="calendar-agenda-copy">
                    <span className="calendar-agenda-type">{getEventTypeLabel(item)}</span>
                    <strong>{route ? <Link to={route}>{item.title}</Link> : item.title}</strong>
                    {item.subject && <span className="calendar-agenda-subject">{item.subject}</span>}
                    <span className="calendar-agenda-meta">
                      {TASK_TYPES.includes(item.type) || item.type === "learning" ? "Due date · " : ""}
                      {formatShortDate(item.date)}
                      {item.status ? ` · ${item.status.replace("_", " ")}` : ""}
                      {item.isTentative ? " · Tentative" : ""}
                    </span>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  {task && (
                    <div className="calendar-agenda-actions">
                      <button type="button" onClick={() => openEditForm(item)}>Edit</button>
                      <button type="button" onClick={() => removeTask(task)}>Delete</button>
                    </div>
                  )}
                </article>
              );
            })}
            {!selectedEvents.length && (
              <div className="calendar-empty">
                <span className="calendar-empty-mark" aria-hidden="true">＋</span>
                <strong>Nothing scheduled for this day.</strong>
                <p>Add a task for this date. Tasks with deadlines will also appear here automatically.</p>
                <button type="button" className="calendar-inline-action" onClick={() => openCreateForm(selectedKey)}>Add schedule item</button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {moreEventsDate && (
        <div className="calendar-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setMoreEventsDate(null);
        }}>
          <section className="calendar-more-dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-more-title">
            <button type="button" className="calendar-modal-close" aria-label="Close event list" onClick={() => setMoreEventsDate(null)}>×</button>
            <span className="calendar-section-kicker">Day schedule</span>
            <h2 id="calendar-more-title">{formatDate(dateFromKey(moreEventsDate))}</h2>
            <div className="calendar-more-list">
              {getFilteredEvents(moreEventsDate).slice(EVENT_LIMIT).map((item) => {
                const route = eventRoute(item);
                return (
                  <div className={`calendar-more-item ${item.type}`} key={item.id}>
                    <i className="calendar-agenda-marker" />
                    <div>
                      <strong>{route ? <Link to={route}>{item.title}</Link> : item.title}</strong>
                      <span>{getEventTypeLabel(item)} · {formatShortDate(item.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button" className="calendar-inline-action" onClick={() => setMoreEventsDate(null)}>View selected-day agenda</button>
          </section>
        </div>
      )}

      {taskForm && (
        <div className="calendar-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setTaskForm(null);
        }}>
          <section className="calendar-task-dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-form-title">
            <button type="button" className="calendar-modal-close" aria-label="Close form" onClick={() => setTaskForm(null)}>×</button>
            <span className="calendar-section-kicker">{editingTask ? "Update your schedule" : "Plan ahead"}</span>
            <h2 id="calendar-form-title">{editingTask ? "Edit task" : "Add schedule item"}</h2>
            <p>Saved as a task in your Acadex workspace. No time is added because tasks currently use due dates only.</p>
            <form className="calendar-task-form" onSubmit={saveTask}>
            {formError && <div className="calendar-form-error" role="alert">{formError}</div>}
            <label>
                Title
                <input
                  autoFocus
                  required
                  maxLength={200}
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  placeholder="e.g. Submit biology lab report"
                />
              </label>
              <div className="calendar-form-row">
                <label>
                  Category
                  <select value={taskForm.task_type} onChange={(event) => setTaskForm({ ...taskForm, task_type: event.target.value })}>
                    {TASK_TYPES.map((type) => <option key={type} value={type}>{getTaskTypeLabel(type)}</option>)}
                  </select>
                </label>
                <label>
                  Priority
                  <select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
                    {["low", "medium", "high"].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                  </select>
                </label>
              </div>
              <div className="calendar-form-row">
                <label>
                  Due date
                  <input type="date" required value={taskForm.due_date} onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })} />
                </label>
                <label>
                  Subject <span className="calendar-optional">(optional)</span>
                  <input value={taskForm.subject} onChange={(event) => setTaskForm({ ...taskForm, subject: event.target.value })} placeholder="e.g. Biology" />
                </label>
              </div>
              <label>
                Notes <span className="calendar-optional">(optional)</span>
                <textarea rows="3" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} />
              </label>
              <div className="calendar-form-actions">
                <button type="button" className="calendar-cancel-button" disabled={saving} onClick={() => setTaskForm(null)}>Cancel</button>
                <button type="submit" className="calendar-add-button" disabled={saving}>{saving ? "Saving…" : editingTask ? "Save changes" : "Save schedule item"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
