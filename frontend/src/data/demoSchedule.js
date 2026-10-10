function getDateOffset(daysFromToday) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const DEMO_EXAMS = [
  {
    id: "demo-dbms-internal",
    subject: "Database Systems",
    exam_name: "Internal Assessment",
    exam_type: "internal",
    exam_date: getDateOffset(6),
    is_tentative: true,
    max_marks: 30,
  },
  {
    id: "demo-python-practical",
    subject: "Python Programming",
    exam_name: "Practical Examination",
    exam_type: "external",
    exam_date: getDateOffset(13),
    is_tentative: true,
    max_marks: 50,
  },
];

export const DEMO_EVENTS = [
  {
    id: "demo-campus-fest",
    name: "Campus Fest",
    date: getDateOffset(3),
    category: "Fest",
    description: "Sample campus celebration",
    location: "Main campus",
  },
  {
    id: "demo-project-expo",
    name: "Student Project Expo",
    date: getDateOffset(9),
    category: "Expo",
    description: "Sample showcase for student projects",
    location: "Innovation hall",
  },
  {
    id: "demo-hackathon",
    name: "24-hour Hackathon",
    date: getDateOffset(16),
    category: "Hackathon",
    description: "Sample team coding event",
    location: "Computer science lab",
  },
];
