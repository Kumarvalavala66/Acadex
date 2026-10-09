import { useEffect, useMemo, useState } from "react";
import {
  getExamSchedule,
  getExamResults,
  createExamResult,
  updateExamResult,
  deleteExamResult,
} from "../services/api";
import "./Exams.css";

const EMPTY_FORM = {
  exam_id: "",
  marks_obtained: "",
  notes: "",
};

function formatDate(dateString) {
  if (!dateString) return "Date not set";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPercentage(marks, maxMarks) {
  if (
    marks === null ||
    marks === undefined ||
    maxMarks === null ||
    maxMarks === undefined ||
    maxMarks === 0
  ) {
    return null;
  }

  return Math.round((marks / maxMarks) * 100);
}

export default function Exams() {
  const [schedule, setSchedule] = useState([]);
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExamData();
  }, []);

  async function loadExamData() {
    try {
      setLoading(true);
      setError("");

      const [scheduleData, resultsData] = await Promise.all([
        getExamSchedule(),
        getExamResults(),
      ]);

      setSchedule(scheduleData);
      setResults(resultsData);
    } catch (err) {
      setError(err.message || "Failed to load exam data.");
    } finally {
      setLoading(false);
    }
  }

  const resultByExamId = useMemo(() => {
    return new Map(results.map((result) => [result.exam_id, result]));
  }, [results]);

  const upcomingExams = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return schedule.filter((exam) => {
      if (!exam.exam_date) return true;

      const examDate = new Date(`${exam.exam_date}T00:00:00`);

      return examDate >= today;
    });
  }, [schedule]);

  const enteredResults = useMemo(() => {
    return results
      .map((result) => {
        const exam = schedule.find((item) => item.id === result.exam_id);

        if (!exam) return null;

        return {
          ...result,
          exam,
        };
      })
      .filter(Boolean);
  }, [results, schedule]);

  function openCreateResultForm(exam = null) {
    setEditingResult(null);

    setForm({
      exam_id: exam ? String(exam.id) : "",
      marks_obtained: "",
      notes: "",
    });

    setShowForm(true);
  }

  function openEditResultForm(result) {
    setEditingResult(result);

    setForm({
      exam_id: String(result.exam_id),
      marks_obtained: String(result.marks_obtained),
      notes: result.notes || "",
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingResult(null);
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

    if (!form.exam_id) {
      setError("Please select an exam.");
      return;
    }

    if (form.marks_obtained === "") {
      setError("Please enter the marks obtained.");
      return;
    }

    const exam = schedule.find((item) => item.id === Number(form.exam_id));

    const marks = Number(form.marks_obtained);

    if (
      exam?.max_marks !== null &&
      exam?.max_marks !== undefined &&
      marks > exam.max_marks
    ) {
      setError(`Marks cannot exceed ${exam.max_marks}.`);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        marks_obtained: marks,
        notes: form.notes.trim() || null,
      };

      if (editingResult) {
        const updated = await updateExamResult(editingResult.id, payload);

        setResults((current) =>
          current.map((result) =>
            result.id === updated.id ? updated : result,
          ),
        );
      } else {
        const created = await createExamResult({
          exam_id: Number(form.exam_id),
          ...payload,
        });

        setResults((current) => [...current, created]);
      }

      closeForm();
    } catch (err) {
      setError(err.message || "Failed to save result.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteResult(result) {
    const exam = schedule.find((item) => item.id === result.exam_id);

    const confirmed = window.confirm(
      `Delete your result for "${exam?.exam_name || "this exam"}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteExamResult(result.id);

      setResults((current) => current.filter((item) => item.id !== result.id));
    } catch (err) {
      setError(err.message || "Failed to delete result.");
    }
  }

  return (
    <section className="page-container exams-page">
      <div className="exams-header">
        <div>
          <p className="exams-eyebrow">Academic records</p>

          <h1>Exams</h1>

          <p className="exams-subtitle">
            View your official exam schedule and keep your results up to date.
          </p>
        </div>

        <button
          type="button"
          className="exams-add-button"
          onClick={() => openCreateResultForm()}
        >
          Enter result
        </button>
      </div>

      {error && <div className="exams-error">{error}</div>}

      <div className="exam-stats">
        <div className="exam-stat">
          <span>Upcoming</span>
          <strong>{upcomingExams.length}</strong>
        </div>

        <div className="exam-stat">
          <span>Total exams</span>
          <strong>{schedule.length}</strong>
        </div>

        <div className="exam-stat">
          <span>Results entered</span>
          <strong>{results.length}</strong>
        </div>
      </div>

      <div className="exams-section">
        <div className="exams-section-header">
          <div>
            <h2>Exam schedule</h2>

            <p>Official examination dates and details.</p>
          </div>
        </div>

        {loading ? (
          <div className="exams-empty">Loading exam schedule...</div>
        ) : upcomingExams.length === 0 ? (
          <div className="exams-empty">
            <strong>No upcoming exams.</strong>

            <span>Your official schedule will appear here.</span>
          </div>
        ) : (
          <div className="exam-list">
            {upcomingExams.map((exam) => {
              const existingResult = resultByExamId.get(exam.id);

              return (
                <div className="exam-row" key={exam.id}>
                  <div className="exam-date">
                    <strong>
                      {exam.exam_date
                        ? new Date(`${exam.exam_date}T00:00:00`).getDate()
                        : "--"}
                    </strong>

                    <span>
                      {exam.exam_date
                        ? new Date(
                            `${exam.exam_date}T00:00:00`,
                          ).toLocaleDateString(undefined, {
                            month: "short",
                          })
                        : ""}
                    </span>
                  </div>

                  <div className="exam-main">
                    <div className="exam-title">{exam.exam_name}</div>

                    <div className="exam-meta">
                      <span>{exam.subject}</span>

                      <span>
                        {exam.exam_type === "internal"
                          ? "Internal"
                          : "External"}
                      </span>

                      {exam.max_marks !== null && (
                        <span>{exam.max_marks} marks</span>
                      )}

                      {exam.is_tentative && (
                        <span className="tentative">Tentative</span>
                      )}
                    </div>

                    <div className="exam-meta">
                      <span>{formatDate(exam.exam_date)}</span>
                    </div>
                  </div>

                  <div className="exam-actions">
                    {existingResult ? (
                      <button
                        type="button"
                        onClick={() => openEditResultForm(existingResult)}
                      >
                        Edit result
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openCreateResultForm(exam)}
                      >
                        Enter result
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="exams-section">
        <div className="exams-section-header">
          <div>
            <h2>Results</h2>

            <p>Your marks for completed examinations.</p>
          </div>
        </div>

        {enteredResults.length === 0 ? (
          <div className="exams-empty">
            <strong>No results entered yet.</strong>

            <span>Add your marks after an examination.</span>
          </div>
        ) : (
          <div className="results-list">
            {enteredResults.map((result) => {
              const percentage = getPercentage(
                result.marks_obtained,
                result.exam.max_marks,
              );

              return (
                <div className="result-row" key={result.id}>
                  <div>
                    <strong>{result.exam.subject}</strong>

                    <span>{result.exam.exam_name}</span>
                  </div>

                  <div className="result-score">
                    <strong>
                      {result.marks_obtained}
                      {result.exam.max_marks
                        ? ` / ${result.exam.max_marks}`
                        : ""}
                    </strong>

                    {percentage !== null && <span>{percentage}%</span>}
                  </div>

                  <div className="exam-actions">
                    <button
                      type="button"
                      onClick={() => openEditResultForm(result)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteResult(result)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="exam-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="exam-modal">
            <div className="exam-modal-header">
              <div>
                <p>{editingResult ? "Academic result" : "Academic result"}</p>

                <h2>{editingResult ? "Update result" : "Enter result"}</h2>
              </div>

              <button type="button" onClick={closeForm} aria-label="Close">
                ×
              </button>
            </div>

            <form className="exam-form" onSubmit={handleSubmit}>
              <div className="exam-form-grid">
                <label>
                  <span>Exam</span>

                  <select
                    name="exam_id"
                    value={form.exam_id}
                    onChange={handleChange}
                    disabled={Boolean(editingResult)}
                    required
                  >
                    <option value="">Select an exam</option>

                    {schedule.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.subject} — {exam.exam_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Marks obtained</span>

                  <input
                    type="number"
                    name="marks_obtained"
                    min="0"
                    value={form.marks_obtained}
                    onChange={handleChange}
                    placeholder="Enter marks"
                    required
                  />
                </label>
              </div>

              {form.exam_id && (
                <div className="exam-form-hint">
                  {(() => {
                    const selectedExam = schedule.find(
                      (exam) => exam.id === Number(form.exam_id),
                    );

                    if (!selectedExam) {
                      return null;
                    }

                    return (
                      <>
                        Maximum marks:{" "}
                        {selectedExam.max_marks ?? "Not specified"}
                      </>
                    );
                  })()}
                </div>
              )}

              <label>
                <span>Notes</span>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional notes"
                />
              </label>

              <div className="exam-form-actions">
                <button type="button" onClick={closeForm}>
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingResult
                      ? "Save changes"
                      : "Save result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
