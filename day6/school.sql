PRAGMA foreign_keys = ON;

-- =========================================
-- TABLES
-- =========================================

CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (student_id, course_id)
);

-- =========================================
-- SAMPLE STUDENTS
-- =========================================

INSERT INTO students (name, email) VALUES
('Alice Wanjiku', 'alice@example.com'),
('Brian Otieno', 'brian@example.com'),
('Carol Akinyi', 'carol@example.com'),
('David Kamau', 'david@example.com');

-- =========================================
-- SAMPLE COURSES
-- =========================================

INSERT INTO courses (name, description) VALUES
('Database Systems', 'Introduction to relational databases and SQL'),
('Web Development', 'HTML, CSS and JavaScript fundamentals'),
('Cloud Computing', 'Introduction to cloud computing concepts');

-- =========================================
-- SAMPLE ENROLMENTS
-- =========================================

INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'),
(1, 2, 'B'),
(2, 1, 'B'),
(2, 2, 'A'),
(4, 1, 'C');

-- =========================================
-- QUERY 1: ALL COURSES FOR ONE STUDENT
-- =========================================

SELECT
    students.name AS student_name,
    courses.name AS course_name,
    enrolments.grade
FROM enrolments
JOIN students ON enrolments.student_id = students.id
JOIN courses ON enrolments.course_id = courses.id
WHERE students.name = 'Alice Wanjiku';

-- =========================================
-- QUERY 2: ALL STUDENTS ON ONE COURSE
-- =========================================

SELECT
    courses.name AS course_name,
    students.name AS student_name,
    enrolments.grade
FROM enrolments
JOIN students ON enrolments.student_id = students.id
JOIN courses ON enrolments.course_id = courses.id
WHERE courses.name = 'Database Systems';

-- =========================================
-- QUERY 3: NUMBER OF STUDENTS PER COURSE
-- =========================================

SELECT
    courses.name AS course_name,
    COUNT(enrolments.student_id) AS number_of_students
FROM courses
LEFT JOIN enrolments ON courses.id = enrolments.course_id
GROUP BY courses.id, courses.name
ORDER BY courses.id;

-- =========================================
-- QUERY 4: STUDENTS WHO HAVE NO ENROLMENTS
-- =========================================

SELECT
    students.id,
    students.name,
    students.email
FROM students
LEFT JOIN enrolments ON students.id = enrolments.student_id
WHERE enrolments.id IS NULL;

-- =========================================
-- QUERY 5: UPDATE ONE ENROLMENT'S GRADE
-- =========================================

UPDATE enrolments
SET grade = 'A+'
WHERE student_id = 1
  AND course_id = 1;

-- Check the updated enrolment
SELECT
    students.name AS student_name,
    courses.name AS course_name,
    enrolments.grade
FROM enrolments
JOIN students ON enrolments.student_id = students.id
JOIN courses ON enrolments.course_id = courses.id
WHERE enrolments.student_id = 1
  AND enrolments.course_id = 1;