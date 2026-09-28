import { useState , useRef , useEffect} from "react";
import * as React from "react";
import { PlusCircle , Trash2, X } from "lucide-react";
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
} from "@/components/ui/combobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

type Option = { value: string; label: string; isNew?: boolean; isCreated?: boolean};

// function OptionSelect({
//   id,
//   options,
//   value,
//   onChange,
//   placeholder,
// }: {
//   id: string;
//   options: Option[];
//   value: string | null;
//   onChange: (value: string) => void;
//   placeholder?: string;
// }) {
//   return (
//     <Select
//       items={options}
//       value={value || undefined}
//       onValueChange={(v) => onChange(v as string)}
//     >
//       <SelectTrigger id={id} className="w-full">
//         <SelectValue placeholder={placeholder} />
//       </SelectTrigger>
//       <SelectContent>
//         {options.map((o) => (
//           <SelectItem key={o.value} value={o.value}>
//             {o.label}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// }

export default function AdminCoursesPage() {
  const {courses, removeCourse , removeInstructor, addCourse } = useEnrollmentStore();
  const [AddDialogOpen, setAddDialogOpen] = useState(false);
  const [formInstructor,setFormInstructor] = useState<Option[]>([]);
  const [inputValue,setInputValue] = useState("");
  const [courseId,setCourseId] = useState("");
  const [coursetitle,setCoursetitle] = useState("");

  const anchor = useRef(null);
  const isDuplicate = courses.some((course)=>course.courseCode.toLowerCase() === courseId.trim().toLowerCase());
  const [availableInstructorOptions, setAvailableInstructorOptions] = useState<Option[]>([]);
  useEffect(()=>{
    const validInstructor = courses
      .flatMap(c=>c.instructors)
      .filter((instructor): instructor is string => typeof instructor === "string");
    const uniqueInstructors = Array.from(new Set(validInstructor));
    const baseOption = uniqueInstructors.map(instructor=>({
      value: instructor.toLowerCase(),
      label: instructor
    }));
    setAvailableInstructorOptions((prev) => {
    const createdOptions = prev.filter(opt => opt.isCreated);
    const updatedOptions = [...baseOption];
    createdOptions.forEach((newOpt) => {
      if (!updatedOptions.some((opt) => opt.value === newOpt.value)) {
        updatedOptions.push(newOpt);
      }
    });
    
    return updatedOptions;
  });
  },[courses])
  
  const isExactMatch = availableInstructorOptions.some(
    (opt) => opt.label.toLowerCase() === inputValue.trim().toLowerCase()
  );
  const showCreateOption = inputValue.trim().length > 0 && !isExactMatch;
  const handleValueChange = (newValues: Option[]) => {
    const newAdded = newValues.find(v=>v.isNew);
    if(newAdded){
      const newInstructor = {
        label: newAdded.label,
        value: newAdded.label.toLowerCase(),
        isCreated: true
      };
      setAvailableInstructorOptions((prev)=>[...prev,newInstructor]);
      setFormInstructor((prev)=> [...prev.filter(v=>!v.isNew),newInstructor]);
    }else{
      setFormInstructor(newValues);
      setAvailableInstructorOptions((prev)=>
       prev.filter((option)=>!option.isCreated || newValues.some((v)=>v.value === option.value)));
    }
    setInputValue("");
  };
  const handleAddDialogOpenChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setCourseId("");
      setCoursetitle("");
      setFormInstructor([]);
      setInputValue("");
    }
  };
  const handleSubmit = () => {
    const newCourse: Course = {
      courseCode: courseId,
      courseTitle: coursetitle,
      instructors: formInstructor.map((instructor)=>instructor.label),
    };
    addCourse(newCourse);
    handleAddDialogOpenChange(false);
    setCourseId("");
    setCoursetitle("");
    setFormInstructor([]);
  };
  const isFormValid = courseId.trim() !== "" && coursetitle.trim() !== "" && formInstructor.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
        <p className="text-sm text-muted-foreground">
          {courses.length} - เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
        </p>
      </div>

      <Dialog open={AddDialogOpen} onOpenChange={handleAddDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          เพิ่มวิชา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              วิชาที่จะเพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาทันที
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourseId">รหัสวิชา</Label>
              <input 
                id="formCourseId" 
                type="text" 
                placeholder="เช่น CPE303"
                value={courseId}
                onChange={(e)=>setCourseId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                  isDuplicate 
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-neutral-700"
                }`}
              />
              {
                isDuplicate && (
                  <span className="text-red-500 text-sm">
                    มีรหัสวิชา {courseId.toUpperCase()} นี้แล้ว
                  </span>
                )
              }
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formCourseTitle">ชื่อวิชา</Label>
              <input 
                id="formCourseTitle" 
                type="text" 
                placeholder="เช่น Mobile Application Develoopment"
                value={coursetitle}
                onChange={(e)=>setCoursetitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none dark:border-neutral-700"
              />
              
            </div>
            <div>
              <label htmlFor="instructor">ผู้สอน</label>
              <Combobox
                multiple
                autoHighlight
                items={availableInstructorOptions}
                value={formInstructor}
                onValueChange={handleValueChange}
              >
                <ComboboxChips ref={anchor} className="w-full">
                  <ComboboxValue>
                    {(values:Option[]) => (
                      <React.Fragment>
                        {values.map((item) => (
                          <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          onChange={(e)=>setInputValue(e.target.value)}
                          value={inputValue}
                          placeholder={values.length > 0 ? "" : "ค้นหาหรือพิมพ์ชื่อผู้สอนใหม่"} 
                        />
                      </React.Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxList>
                   {showCreateOption && (
                    <ComboboxItem value={{label:inputValue,value:inputValue,isNew:true}}>
                      + เพิ่มผู้สอน "{inputValue}"
                    </ComboboxItem>
                   )}
                   {availableInstructorOptions.length === 0 && !showCreateOption && (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      ไม่พบผู้สอน
                    </div>
                   )}
                   {availableInstructorOptions.map((item: Option) => (
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
            <Button disabled={!isFormValid || isDuplicate} onClick={handleSubmit}>
              <PlusCircle className="h-4 w-4" />
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  ยังไม่มีวิชาที่เปิดสอน
                </TableCell>
              </TableRow>
            )}
            {courses.map((c) => (
            <TableRow key={c.courseCode}>
              <TableCell>{c.courseCode}</TableCell>
              <TableCell>{c.courseTitle}</TableCell>
              
              {/* คอลัมน์ผู้สอน */}
              <TableCell>
                {!c.instructors || c.instructors.length === 0 ? (
                  <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {c.instructors.map((instructor, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="flex items-center gap-1.5 font-normal pr-1.5 py-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                      >
                        {instructor}
                        <button
                          onClick={() => removeInstructor(c.courseCode,instructor)}
                          className="rounded-full p-0.5 transition-colors text-blue-500 hover:bg-blue-200 hover:text-blue-700 dark:text-blue-400"
                          title="ลบผู้สอน"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>

              {/* คอลัมน์ Action พร้อม AlertDialog */}
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger render={<button 
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="ลบวิชา"
                    > 
                    </button>}>
                    <Trash2 className="h-5 w-5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 sm:max-w-sm">
                    <div className="p-4 pb-3">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          ลบวิชา?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
                          ลบ {c.courseCode} — {c.courseTitle} ออกจากรายวิชาที่เปิดสอน)
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter className="border-t border-gray-200 dark:border-zinc-800 px-6 py-4 sm:justify-end gap-2 bg-white dark:bg-transparent rounded-b-lg">
                    <AlertDialogCancel className="mt-0 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                      ยกเลิก
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        removeCourse(c.courseCode);
                      }}
                      className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/60 dark:hover:text-red-300 shadow-none border-none transition-colors"
                    >
                      ยืนยัน
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </div>
      </div>  
  );
}
