import type { Student , Course , Enrollment } from "./types";
export const students: Student[] = [
  {
    studentId: "650610001",
    firstName: "Matt",
    lastName: "Damon",
    program: "CPE",
    enrolledCourses: []
  },
  {
    studentId: "650610002",
    firstName: "Cillian",
    lastName: "Murphy",
    program: "CPE",
    enrolledCourses: ["261207", "261497"],
  },
  {
    studentId: "650610003",
    firstName: "Emily",
    lastName: "Blunt",
    program: "ISNE",
    enrolledCourses: ["269101", "261497"],
  },
];

export const courses: Course[] = [
  {
    courseCode: "261207",
    courseTitle: "Basic Computer Engineering Lab",
    instructors: ["Dome", "Chanadda"],
  },
  {
    courseCode: "261497",
    courseTitle: "Full Stack Development",
    instructors: ["Dome", "Nirand", "Chanadda"],
  },
  {
    courseCode: "269101",
    courseTitle: "Introduction to Information Systems and Network Engineering",
    instructors: ["KENNETH COSH"],
  },
];

export const enrollments: Enrollment[] = [
  { studentId: "650610002", courseId: "261207" },
  { studentId: "650610002", courseId: "261497" },
  { studentId: "650610003", courseId: "269101" },
  { studentId: "650610003", courseId: "261497" },
];