import { useState } from "react";
import * as React from "react";
import { PlusCircle , X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value || undefined}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollments, enroll , drop } = useEnrollmentStore();
  const [formStudent, setFormStudent] = useState<Option[]>([]);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");
  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));
  // const availableCourseOptions = courseOptions.filter((c)=>{
  //   const enrolledStudent = enrollments.filter((e)=> e.courseId === c.value).length;
  //   return enrolledStudent < students.length;
  // });
  // วิชาที่นักศึกษาที่เลือกยังไม่ได้ลงทะเบียน
  const availableStudentOptions = formCourse ? studentOptions.filter(
    (c) =>
      !enrollments.some(
        (e) => e.studentId === c.value && e.courseId === formCourse
      )
  ):studentOptions;

  const handleEnroll = () => {
    if (formStudent.length === 0 || !formCourse) return;
    formStudent.forEach((s)=>{
      enroll(s.value,formCourse);
    })
    setFormCourse(null);
    setFormStudent([]);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudent([]);
      setFormCourse(null);
    }
  };

  // const rows = enrollments.filter((e) =>
  //   mode === "course"
  //     ? filterCourse === "all" || e.courseId === filterCourse
  //     : filterStudent === "all" || e.studentId === filterStudent
  // );
  const displayedCourses = courses.filter((course) => {
    if (mode === "course") {
      // โหมดวิชา: กรองตามวิชาที่เลือก
      return filterCourse === "all" || course.courseCode === filterCourse;
    } else {
      // โหมดนักศึกษา: กรองเอาเฉพาะ "วิชาที่นักศึกษาคนนี้ลงเรียน"
      if (filterStudent === "all") return true;
      return enrollments.some(
        (e) => e.courseId === course.courseCode && e.studentId === filterStudent
      );
    }
  });

  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };
  const anchor = useComboboxAnchor();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น<br />(เลือกได้มากกว่า 1 คน)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(v) => {
                  setFormCourse(v);
                  setFormStudent([]);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>
              <Combobox
                multiple
                autoHighlight
                items={availableStudentOptions}
                disabled={!formCourse}
                value={formStudent}
                onValueChange={setFormStudent}
              >
                <ComboboxChips ref={anchor} className="w-full">
                  <ComboboxValue>
                    {(values:Option[]) => (
                      <React.Fragment>
                        {values.map((item) => (
                          <ComboboxChip key={item.value}>{nameOf(item.value)}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput placeholder={!formCourse 
                          ? "เลือกวิชาก่อน" 
                          : availableStudentOptions.length !== 0 ? values.length > 0 ? "" : "ค้นหา/เลือกนักศึกษา" : "นักศึกษาลงทะเบียนวิชานี้ครบทุกคนแล้ว"}/>
                      </React.Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxList>
                    {availableStudentOptions.length === 0 && (
                      <div className="p-2 text-sm text-center text-muted-foreground">
                        ไม่พบนักศึกษา
                      </div>
                    )}
                    {availableStudentOptions.map((item:Option) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={formStudent.length === 0 || !formCourse} onClick={handleEnroll}>
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedCourses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {displayedCourses.map((c)=>{
              const enrollthisc = enrollments.filter((e)=>e.courseId === c.courseCode);
              return (
                <TableRow key={c.courseCode}>
                <TableCell>{c.courseCode}</TableCell>
                <TableCell>{c.courseTitle}</TableCell>
                <TableCell>{enrollthisc.length}</TableCell>
                <TableCell>{enrollthisc.length === 0 
                  ? (<span className="text-muted-foreground">ยังไม่มีนักศึกษาลงทะเบียน</span>) 
                  : (<div className="flex flex-wrap gap-2">
                    {enrollthisc.map((e) => (
                      <Badge
                        key={e.studentId}
                        variant="outline"
                        className="flex items-center gap-1.5 font-normal pr-1.5 py-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/60"
                      >
                        {nameOf(e.studentId)}
                        <button
                          onClick={() => drop(e.studentId, c.courseCode)}
                          className="rounded-full p-0.5 transition-colors text-blue-500 hover:bg-blue-200 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-200"
                          title="ยกเลิกการลงทะเบียน"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </div>
      </div>  
  );
}
