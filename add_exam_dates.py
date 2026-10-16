
import requests

API_URL = "http://127.0.0.1:8000/exams/schedule"

exams = [
    {
        "subject": "Database Management Systems",
        "exam_name": "Mid-Term Examination I",
        "exam_type": "Mid-Term",
        "exam_date": "2026-11-09",
        "is_tentative": False,
        "max_marks": 30,
        "notes": "Syllabus: Units III-IV",
    },
    {
        "subject": "Artificial Intelligence and Machine Learning",
        "exam_name": "Mid-Term Examination I",
        "exam_type": "Mid-Term",
        "exam_date": "2026-11-11",
        "is_tentative": False,
        "max_marks": 30,
        "notes": "Supervised learning and model evaluation",
    },
    {
        "subject": "Natural Language Processing",
        "exam_name": "Internal Assessment II",
        "exam_type": "Internal",
        "exam_date": "2026-11-13",
        "is_tentative": False,
        "max_marks": 30,
        "notes": "Semantics, word sense disambiguation and thematic roles",
    },
    {
        "subject": "Operating Systems",
        "exam_name": "Mid-Term Examination I",
        "exam_type": "Mid-Term",
        "exam_date": "2026-11-16",
        "is_tentative": False,
        "max_marks": 30,
        "notes": "Processes, scheduling and synchronization",
    },
    {
        "subject": "Computer Networks",
        "exam_name": "Internal Assessment II",
        "exam_type": "Internal",
        "exam_date": "2026-11-18",
        "is_tentative": False,
        "max_marks": 30,
        "notes": "Network and transport layers",
    },
    {
        "subject": "Python Programming",
        "exam_name": "Practical Examination",
        "exam_type": "Lab",
        "exam_date": "2026-11-20",
        "is_tentative": False,
        "max_marks": 50,
        "notes": "Bring lab record and observation notebook",
    },
    {
        "subject": "Web Technologies",
        "exam_name": "Practical Examination",
        "exam_type": "Lab",
        "exam_date": "2026-11-23",
        "is_tentative": False,
        "max_marks": 50,
        "notes": "Practical implementation and viva",
    },
    {
        "subject": "Software Engineering",
        "exam_name": "Mid-Term Examination II",
        "exam_type": "Mid-Term",
        "exam_date": "2026-11-25",
        "is_tentative": False,
        "max_marks": 30,
        "notes": "Requirements analysis and software design",
    },
    {
        "subject": "Data Mining",
        "exam_name": "Internal Assessment II",
        "exam_type": "Internal",
        "exam_date": "2026-11-27",
        "is_tentative": False,
        "max_marks": 30,
        "notes": "Data preprocessing and classification",
    },
    {
        "subject": "Project Work",
        "exam_name": "Mini-Project Review",
        "exam_type": "Viva",
        "exam_date": "2026-11-30",
        "is_tentative": False,
        "max_marks": 50,
        "notes": "Project demonstration and review",
    },
]

for exam in exams:
    try:
        response = requests.post(API_URL, json=exam, timeout=10)
        if response.ok:
            print(f"Added: {exam['subject']}")
        else:
            print(
                f"Failed: {exam['subject']} — "
                f"{response.status_code}: {response.text}"
            )
    except requests.RequestException as error:
        print(f"Request failed for {exam['subject']}: {error}")

