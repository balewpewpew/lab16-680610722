import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  students as initialStudents,
  courses as initialCourses,
  enrollments as initialEnrollments,
} from "@/lib/mock-data";
import type { Course, Enrollment, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  enroll: (studentId: string, courseId: string) => void;
  /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  drop: (studentId: string, courseId: string) => void;
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
  removeInstructor: (courseCode: string, instructorName: string) => void;
  addCourse: (course: Course) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,
      enrollments: initialEnrollments,

      enroll: (studentId, courseId) =>
        set((state) => ({
          enrollments: state.enrollments.some(
            (e) => e.studentId === studentId && e.courseId === courseId,
          )
            ? state.enrollments
            : [...state.enrollments, { studentId, courseId }],
        })),

      drop: (studentId, courseId) =>
        set((state) => ({
          enrollments: state.enrollments.filter(
            (e) => !(e.studentId === studentId && e.courseId === courseId),
          ),
        })),
      removeStudent:(studentId) =>
        set((state) => ({
          students: state.students.filter((s)=>s.studentId !== studentId),
          enrollments: state.enrollments.filter((e)=>e.studentId !== studentId),
        })),
      removeCourse:(courseCode) =>
        set((state)=>({
          courses: state.courses.filter((c)=>c.courseCode !== courseCode),
          enrollments:state.enrollments.filter((e)=>e.courseId !== courseCode),
        })),
      removeInstructor:(courseCode, instructorName) => 
        set((state) => ({
          courses: state.courses.map((c) => 
            c.courseCode === courseCode 
              ? { ...c, 
                  instructors: c.instructors?.filter((name) => name !== instructorName) 
                }
              : c
          ),
        })),
        addCourse:(course) =>
          set((state)=>({
            courses: [...state.courses,course]
          })),
    }),
    { //เก็บ localstorage
      name: "lab16-2569-680610722",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  )
)
