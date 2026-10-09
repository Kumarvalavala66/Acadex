import { useEffect, useMemo, useState } from "react";

import {
  getTasks,
  updateTask,
  getExamSchedule,
  getPublicHolidays,
} from "../services/api";

import RubberSegment from "../components/RubberSegment";

import "./Calendar.css";

const FILTERS = ["All", "Assignments", "Projects", "Personal"];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(dateA, dateB) {
  return getDateKey(dateA) === getDateKey(dateB);
}

function formatSelectedDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTaskType(type) {
  const labels = {
    assignment: "Assignment",
    project: "Project",
    personal: "Personal",
  };

  return labels[type] || type;
}

function formatExamType(type) {
  const labels = {
    internal: "Internal",
    external: "External",
  };

  return labels[type] || type;
}

export default function Calendar() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(today);

  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Drag-and-drop state
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [movingTaskId, setMovingTaskId] = useState(null);

  // ============================================================
  // LOAD CALENDAR DATA
  // ============================================================

  useEffect(() => {
    loadCalendarData();
  }, []);

  async function loadCalendarData() {
    try {
      setLoading(true);
      setError("");

      const [tasksData, examsData, holidaysData] = await Promise.all([
        getTasks(),
        getExamSchedule(),
        getPublicHolidays(),
      ]);

      setTasks(tasksData || []);
      setExams(examsData || []);
      setHolidays(holidaysData || []);
    } catch (err) {
      console.error("Calendar loading error:", err);
      setError(err.message || "Failed to load calendar.");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // TASK FILTERING
  // ============================================================

  const filteredTasks = useMemo(() => {
    if (filter === "All") {
      return tasks;
    }

    const typeMap = {
      Assignments: "assignment",
      Projects: "project",
      Personal: "personal",
    };

    return tasks.filter((task) => task.task_type === typeMap[filter]);
  }, [tasks, filter]);

  // ============================================================
  // TASKS BY DATE
  // ============================================================

  const tasksByDate = useMemo(() => {
    const grouped = {};

    filteredTasks.forEach((task) => {
      if (!task.due_date) return;

      if (!grouped[task.due_date]) {
        grouped[task.due_date] = [];
      }

      grouped[task.due_date].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  // ============================================================
  // EXAMS BY DATE
  // ============================================================

  const examsByDate = useMemo(() => {
    const grouped = {};

    exams.forEach((exam) => {
      if (!exam.exam_date) return;

      if (!grouped[exam.exam_date]) {
        grouped[exam.exam_date] = [];
      }

      grouped[exam.exam_date].push(exam);
    });

    return grouped;
  }, [exams]);

  // ============================================================
  // HOLIDAYS BY DATE
  // ============================================================

  const holidaysByDate = useMemo(() => {
    const grouped = {};

    holidays.forEach((holiday) => {
      if (!holiday.date) return;

      if (!grouped[holiday.date]) {
        grouped[holiday.date] = [];
      }

      grouped[holiday.date].push(holiday);
    });

    return grouped;
  }, [holidays]);

  // ============================================================
  // SELECTED DAY DATA
  // ============================================================

  const selectedDateKey = getDateKey(selectedDate);

  const selectedTasks = useMemo(() => {
    return [...(tasksByDate[selectedDateKey] || [])].sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") {
        return 1;
      }

      if (a.status !== "completed" && b.status === "completed") {
        return -1;
      }

      return a.title.localeCompare(b.title);
    });
  }, [selectedDateKey, tasksByDate]);

  const selectedExams = examsByDate[selectedDateKey] || [];
  const selectedHolidays = holidaysByDate[selectedDateKey] || [];

  // ============================================================
  // CALENDAR DAYS
  // ============================================================

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month's visible days
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const day = daysInPreviousMonth - i;

      days.push({
        date: new Date(year, month - 1, day),
        currentMonth: false,
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    // Next month's visible days
    const remaining = 42 - days.length;

    for (let day = 1; day <= remaining; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        currentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  // ============================================================
  // NAVIGATION
  // ============================================================

  function previousMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  }

  function goToToday() {
    const now = new Date();

    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));

    setSelectedDate(now);
  }

  function handleDayClick(date) {
    setSelectedDate(date);

    if (
      date.getMonth() !== currentMonth.getMonth() ||
      date.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  function monthTitle() {
    return currentMonth.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }

  // ============================================================
  // TASK STYLING
  // ============================================================

  function getTaskClass(task) {
    if (task.status === "completed") {
      return "completed";
    }

    if (task.priority === "high") {
      return "high";
    }

    return task.task_type;
  }

  // ============================================================
  // DRAG AND DROP
  // ============================================================

  function handleTaskDragStart(event, task) {
    if (movingTaskId) return;

    setDraggedTask(task);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(task.id));
  }

  function handleDayDragOver(event, date) {
    event.preventDefault();

    if (!draggedTask) {
      return;
    }

    const dateKey = getDateKey(date);

    setDragOverDate(dateKey);

    event.dataTransfer.dropEffect = "move";
  }

  async function handleTaskDrop(event, date) {
    event.preventDefault();

    if (!draggedTask) {
      return;
    }

    const newDate = getDateKey(date);
    const oldDate = draggedTask.due_date;

    const taskBeingMoved = draggedTask;

    setDraggedTask(null);
    setDragOverDate(null);

    if (oldDate === newDate) {
      return;
    }

    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskBeingMoved.id
          ? {
              ...task,
              due_date: newDate,
            }
          : task,
      ),
    );

    setMovingTaskId(taskBeingMoved.id);
    setError("");

    try {
      const updatedTask = await updateTask(taskBeingMoved.id, {
        due_date: newDate,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );
    } catch (err) {
      setTasks(previousTasks);

      setError(err.message || "Couldn't move the task to the new date.");
    } finally {
      setMovingTaskId(null);
    }
  }

  function handleTaskDragEnd() {
    setDraggedTask(null);
    setDragOverDate(null);
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section className="page-container calendar-page">
      <div className="calendar-header">
        <div>
          <p className="calendar-eyebrow">Schedule</p>

          <h1>Calendar</h1>

          <p className="calendar-subtitle">
            Plan deadlines, exams, holidays, and personal work.
          </p>
        </div>

        <div className="calendar-actions">
          <button
            type="button"
            className="calendar-today-button"
            onClick={goToToday}
          >
            Today
          </button>

          <div className="calendar-navigation">
            <button
              type="button"
              onClick={previousMonth}
              aria-label="Previous month"
            >
              ‹
            </button>

            <strong>{monthTitle()}</strong>

            <button type="button" onClick={nextMonth} aria-label="Next month">
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-filter">
        <RubberSegment
          items={FILTERS}
          defaultValue={filter}
          onChange={(value) => setFilter(value)}
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
        />
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "18px",
          alignItems: "center",
          marginBottom: "16px",
          fontSize: "13px",
        }}
      >
        <span>
          <strong>●</strong> Task
        </span>

        <span>
          <strong>●</strong> Exam
        </span>

        <span>
          <strong>●</strong> Holiday
        </span>
      </div>

      {error && <div className="calendar-error">{error}</div>}

      <div className="calendar-layout">
        <div className="calendar-card">
          <div className="calendar-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map(({ date, currentMonth: isCurrentMonth }) => {
              const key = getDateKey(date);

              const dayTasks = tasksByDate[key] || [];

              const dayExams = examsByDate[key] || [];

              const dayHolidays = holidaysByDate[key] || [];

              const isToday = isSameDay(date, today);

              const isSelected = isSameDay(date, selectedDate);

              const isDragOver = dragOverDate === key;

              return (
                <button
                  type="button"
                  key={key}
                  className={[
                    "calendar-day",
                    !isCurrentMonth ? "outside-month" : "",
                    isToday ? "today" : "",
                    isSelected ? "selected" : "",
                    isDragOver ? "drag-over" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleDayClick(date)}
                  onDragOver={(event) => handleDayDragOver(event, date)}
                  onDrop={(event) => handleTaskDrop(event, date)}
                >
                  <div className="calendar-day-number">{date.getDate()}</div>

                  <div className="calendar-day-tasks">
                    {/* HOLIDAYS */}
                    {dayHolidays.slice(0, 2).map((holiday, index) => (
                      <span
                        key={`holiday-${holiday.date}-${index}`}
                        className="calendar-task-dot"
                        title={`Holiday: ${holiday.name}`}
                        style={{
                          borderLeft: "3px solid #ef4444",
                        }}
                      >
                        🇮🇳 {holiday.name}
                      </span>
                    ))}

                    {/* EXAMS */}
                    {dayExams.slice(0, 2).map((exam) => (
                      <span
                        key={`exam-${exam.id}`}
                        className="calendar-task-dot"
                        title={`Exam: ${exam.subject} - ${exam.exam_name}`}
                        style={{
                          borderLeft: "3px solid #f59e0b",
                        }}
                      >
                        📝 {exam.subject}
                      </span>
                    ))}

                    {/* TASKS */}
                    {dayTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={[
                          "calendar-task-dot",
                          getTaskClass(task),
                          draggedTask?.id === task.id ? "is-dragging" : "",
                          movingTaskId === task.id ? "is-moving" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        draggable={movingTaskId !== task.id}
                        onDragStart={(event) =>
                          handleTaskDragStart(event, task)
                        }
                        onDragEnd={handleTaskDragEnd}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDayClick(date);
                        }}
                        title={`Drag "${task.title}" to reschedule`}
                      >
                        {task.title}
                      </span>
                    ))}

                    {dayTasks.length > 3 && (
                      <span className="calendar-more">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {loading && (
            <div className="calendar-loading">Loading calendar...</div>
          )}
        </div>

        {/* ======================================================
            SELECTED DAY DETAILS
        ====================================================== */}

        <aside className="calendar-detail">
          <div className="calendar-detail-header">
            <p className="calendar-detail-label">Selected day</p>

            <h2>{formatSelectedDate(selectedDate)}</h2>

            <span>
              {selectedTasks.length +
                selectedExams.length +
                selectedHolidays.length}{" "}
              {selectedTasks.length +
                selectedExams.length +
                selectedHolidays.length ===
              1
                ? "item"
                : "items"}
            </span>
          </div>

          <div className="calendar-detail-list">
            {/* HOLIDAYS */}

            {selectedHolidays.map((holiday, index) => (
              <div
                key={`holiday-detail-${index}`}
                className="calendar-detail-task"
              >
                <div className="calendar-detail-task-main">
                  <div className="calendar-detail-task-title">
                    🇮🇳 {holiday.name}
                  </div>

                  <div className="calendar-detail-task-meta">
                    <span>Public Holiday</span>
                  </div>
                </div>

                <div className="calendar-priority high">HOLIDAY</div>
              </div>
            ))}

            {/* EXAMS */}

            {selectedExams.map((exam) => (
              <div
                key={`exam-detail-${exam.id}`}
                className="calendar-detail-task"
              >
                <div className="calendar-detail-task-main">
                  <div className="calendar-detail-task-title">
                    📝 {exam.subject}
                  </div>

                  <div className="calendar-detail-task-meta">
                    <span>{exam.exam_name}</span>

                    <span>{formatExamType(exam.exam_type)}</span>

                    {exam.max_marks && <span>Max {exam.max_marks}</span>}
                  </div>
                </div>

                <div className="calendar-priority high">EXAM</div>
              </div>
            ))}

            {/* TASKS */}

            {selectedTasks.map((task) => (
              <div
                className={[
                  "calendar-detail-task",
                  task.status === "completed" ? "completed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={task.id}
              >
                <div className="calendar-detail-task-main">
                  <div className="calendar-detail-task-title">{task.title}</div>

                  <div className="calendar-detail-task-meta">
                    <span>{formatTaskType(task.task_type)}</span>

                    {task.subject && <span>{task.subject}</span>}
                  </div>
                </div>

                <div className={`calendar-priority ${task.priority}`}>
                  {task.priority}
                </div>
              </div>
            ))}

            {selectedTasks.length === 0 &&
              selectedExams.length === 0 &&
              selectedHolidays.length === 0 && (
                <div className="calendar-empty">
                  <p>No work scheduled.</p>

                  <span>
                    Add a task, or select a date containing an exam or holiday.
                  </span>
                </div>
              )}
          </div>

          {draggedTask && (
            <div className="calendar-drag-hint">
              Drop <strong>{draggedTask.title}</strong> on another date to
              reschedule it.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
