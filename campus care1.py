

from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
import os
from dotenv import load_dotenv
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
load_dotenv()
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")

def create_table():
    conn = sqlite3.connect("campuscare.db")
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        roll_number TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
""")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT,
            status TEXT DEFAULT 'Pending'
        )
    """)

    cursor.execute("PRAGMA table_info(complaints)")
    columns = [column[1] for column in cursor.fetchall()]

    if "student_id" not in columns:
     cursor.execute(
        "ALTER TABLE complaints ADD COLUMN student_id INTEGER"
    )

    # Check whether the date column already exists
    cursor.execute("PRAGMA table_info(complaints)")
    columns = [column[1] for column in cursor.fetchall()]

    # Add the date column only if it is missing
    if "date" not in columns:
        cursor.execute("ALTER TABLE complaints ADD COLUMN date TEXT")
    
    # Check whether admin_response column exists
    cursor.execute("PRAGMA table_info(complaints)")
    columns = [column[1] for column in cursor.fetchall()]

    if "admin_response" not in columns:
        cursor.execute(
            "ALTER TABLE complaints ADD COLUMN admin_response TEXT"
        )

    conn.commit()
    conn.close()


@app.route("/", methods=["GET", "POST"])
def home():
    if "student_id" not in session:
        return redirect(url_for("student_access"))
    if request.method == "POST":
        title = request.form["title"]
        category = request.form["category"]
        location = request.form["location"]
        description = request.form["description"]

        conn = sqlite3.connect("campuscare.db")
        cursor = conn.cursor()

        cursor.execute("""
    INSERT INTO complaints
    (title, category, location, description, date, student_id)
    VALUES (?, ?, ?, ?, DATE('now', 'localtime'), ?)
""", (
    title,
    category,
    location,
    description,
    session.get("student_id")
))

        conn.commit()
        conn.close()

        return redirect(url_for("home", submitted=1))

    submitted = request.args.get("submitted")

    conn = sqlite3.connect("campuscare.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    if session.get("student_id"):
     cursor.execute("""
        SELECT * FROM complaints
        WHERE student_id = ?
        ORDER BY id DESC
    """, (session["student_id"],))
    else:
     cursor.execute("SELECT * FROM complaints ORDER BY id DESC")
    complaints = cursor.fetchall()
    total_complaints = len(complaints)

    pending_count = sum(
    1 for complaint in complaints
    if complaint["status"] == "Pending"
    )

    resolved_count = sum(
    1 for complaint in complaints
    if complaint["status"] == "Resolved"
    )

    conn.close()

    return render_template(
    "student.html",
    submitted=submitted,
    complaints=complaints,
    total_complaints=total_complaints,
    pending_count=pending_count,
    resolved_count=resolved_count
)


@app.route("/admin")
def admin():
    if not session.get("admin_logged_in"):
        return redirect(url_for("welcome"))
    conn = sqlite3.connect("campuscare.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    
    cursor.execute("""
        DELETE FROM complaints
        WHERE date IS NULL OR date = ''
    """)
    conn.commit()
    cursor.execute("SELECT * FROM complaints ORDER BY id DESC")
    complaints = cursor.fetchall()

    cursor.execute("""
        SELECT category, COUNT(*) AS total
        FROM complaints
        GROUP BY category
    """)
    category_counts = dict(cursor.fetchall())
    
    total_complaints = len(complaints)

    pending_count = sum(
        1 for complaint in complaints
        if complaint["status"] == "Pending"
    )

    in_progress_count = sum(
        1 for complaint in complaints
        if complaint["status"] == "In Progress"
    )

    resolved_count = sum(
        1 for complaint in complaints
        if complaint["status"] == "Resolved"
    )

    conn.close()

   
    return render_template(
        "admin.html",
        complaints=complaints,
        category_counts=category_counts,
        total_complaints=total_complaints,
        pending_count=pending_count,
        in_progress_count=in_progress_count,
        resolved_count=resolved_count
    )

@app.route("/update_complaint/<int:complaint_id>", methods=["POST"])
def update_complaint(complaint_id):
    if not session.get("admin_logged_in"):
        return redirect(url_for("welcome"))
    status = request.form["status"]
    admin_response = request.form.get("admin_response", "")

    conn = sqlite3.connect("campuscare.db")
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE complaints
        SET status = ?, admin_response = ?
        WHERE id = ?
    """, (status, admin_response, complaint_id))

    conn.commit()
    conn.close()

    return redirect(url_for("admin"))

@app.route("/welcome")
def welcome():
    return render_template(
        "welcome.html",
        admin_error=request.args.get("admin_error")
    )


@app.route("/admin-login", methods=["POST"])
def admin_login():
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")

    if (
    username == os.environ.get("ADMIN_USERNAME")
    and password == os.environ.get("ADMIN_PASSWORD")
):
        session["admin_logged_in"] = True
        return redirect(url_for("admin"))

    return redirect(url_for("welcome", admin_error="1"))


@app.route("/student-access")
def student_access():
    registration = request.args.get("registration")
    login_error = request.args.get("login_error")

    return render_template(
        "student_access.html",
        registration=registration,
        login_error=login_error
    )


@app.route("/register", methods=["POST"])
def register_student():
    name = request.form["name"].strip()
    roll_number = request.form["roll_number"].strip()
    username = request.form["username"].strip()
    password = request.form["password"]

    conn = sqlite3.connect("campuscare.db")
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO students
            (name, roll_number, username, password)
            VALUES (?, ?, ?, ?)
        """, (
            name,
            roll_number,
            username,
            generate_password_hash(password)
        ))

        conn.commit()

        cursor.execute(
            "SELECT id FROM students WHERE username = ?",
            (username,)
        )
        student = cursor.fetchone()

        session["student_id"] = student[0]
        session["student_name"] = name

    except sqlite3.IntegrityError:
        conn.close()
        return redirect(
            url_for("student_access", registration="exists")
        )

    conn.close()
    return redirect(url_for("home"))


@app.route("/student-login", methods=["GET", "POST"])
def student_login():
    if request.method == "POST":
        username = request.form["username"].strip()
        password = request.form["password"]

        conn = sqlite3.connect("campuscare.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, name, password FROM students WHERE username = ?",
            (username,)
        )
        student = cursor.fetchone()
        conn.close()

        if student and check_password_hash(student[2], password):
            session["student_id"] = student[0]
            session["student_name"] = student[1]
            return redirect(url_for("home"))

        return redirect(url_for("student_access", login_error="1"))

    return render_template("student_login.html")

@app.route("/student-logout")
def student_logout():
    session.clear()
    return redirect(url_for("student_access"))

@app.route("/admin-logout")
def admin_logout():
    session.pop("admin_logged_in", None)
    return redirect(url_for("welcome"))



    
if __name__ == "__main__":
    create_table()
    app.run(debug=True)

