import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Footer from "@/components/Footer";
export default function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium">จัดการการลงทะเบียนและสถานะนักศึกษา</span>
          </div>
          <ModeToggle />
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
        <Footer firstName="ศุภพิชญ์" lastName="ไชยตาล" studentId="680610722"/>
      </SidebarInset>
    </SidebarProvider>
  );
}
