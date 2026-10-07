# School Database Design

## Students Table

The `students` table stores information about students in the school system. Each student has a unique ID, name, and email address. The ID is the primary key, while the email address is unique so that two students cannot register with the same email.

## Courses Table

The `courses` table stores information about the courses offered by the school. Each course has a unique ID, a name, and a description. The ID is the primary key for the table.

## Enrolments Table

The `enrolments` table records which students are enrolled in which courses. It contains a student ID, course ID, and grade. The student ID and course ID are foreign keys that connect the enrolments table to the students and courses tables. The combination of student ID and course ID is unique so that the same student cannot enrol in the same course twice.

## Relationships

There is a one-to-many relationship between students and enrolments because one student can have many enrolments, while each enrolment belongs to one student.

There is also a one-to-many relationship between courses and enrolments because one course can have many enrolments, while each enrolment belongs to one course.

Students and courses have a many-to-many relationship because one student can enrol in many courses, and one course can have many students. The `enrolments` table is needed as a join table to represent this relationship. It connects each student to each course and also stores additional information about the enrolment, such as the student's grade.

## Index

I would add an index on `enrolments(course_id)` because courses are frequently searched to find all students enrolled in a particular course. An index would make these queries faster, especially when the database contains many enrolments.

## SQL or NoSQL?

I would choose SQL for this school system because the data has clear relationships between students, courses, and enrolments. The system requires primary keys, foreign keys, unique constraints, joins, and structured queries. A relational database such as SQLite, MySQL, or PostgreSQL is well suited to this type of structured and related data. NoSQL would be more useful for systems where the data structure changes frequently or where large amounts of unstructured or semi-structured data need to be stored.