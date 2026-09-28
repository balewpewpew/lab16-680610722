import { type FooterProps } from "@/lib/Footer";
export default function Footer({firstName,lastName,studentId}:FooterProps){
    return (
    <footer className="align-self-end  text-center w-full">
      <p className="bg-secondary text-secondary-foreground text-xs py-2.5 px-4 m-0 font-normal">
        จัดทำโดย {firstName} {lastName} รหัสนักศึกษา {studentId}
      </p>
    </footer>
    )
}