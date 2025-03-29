"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import TwoFactorSettings from "@/components/auth/TwoFactorSettings";
// ข้อมูลงานตัวอย่าง
const dummyJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Company A",
    location: "กรุงเทพฯ",
    salary: "45,000 - 65,000 บาท",
    type: "Full-time",
    description: "เราคือบริษัทเทคโนโลยีที่กำลังเติบโต กำลังมองหา Frontend Developer ที่มีความเชี่ยวชาญใน React เพื่อร่วมทีมพัฒนาผลิตภัณฑ์ของเรา",
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "Tech Company B",
    location: "กรุงเทพฯ (Remote)",
    salary: "50,000 - 70,000 บาท",
    type: "Full-time",
    description: "บริษัทซอฟต์แวร์ชั้นนำกำลังมองหา Backend Developer ที่มีประสบการณ์กับ Node.js, Express และ MongoDB เพื่อพัฒนาผลิตภัณฑ์ใหม่",
  },
  {
    id: 3,
    title: "UX/UI Designer",
    company: "Design Agency",
    location: "เชียงใหม่",
    salary: "35,000 - 55,000 บาท",
    type: "Full-time",
    description: "บริษัทด้านการออกแบบกำลังมองหา UX/UI Designer ที่มีความคิดสร้างสรรค์และมีความเข้าใจด้านประสบการณ์ผู้ใช้",
  },
];

export default function JobsPage() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // ตรวจสอบการเข้าสู่ระบบเพียงครั้งเดียว
  useEffect(() => {
    if (!loading) {
      setHasCheckedAuth(true);
      
      if (!isLoggedIn) {
        router.push("/auth/login");
      }
    }
  }, [isLoggedIn, loading, router]);

  // แสดงตัวโหลดระหว่างตรวจสอบ
  if (loading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ไม่แสดงเนื้อหาถ้ายังไม่เข้าสู่ระบบ
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">งานที่เปิดรับสมัคร</h1>
        <div className="flex gap-2">
          <Button variant="outline">ค้นหาขั้นสูง</Button>
          <Button>เรียงลำดับ</Button>
          <TwoFactorSettings />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dummyJobs.map((job) => (
          <Card key={job.id} className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>{job.company}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">สถานที่:</span>
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">เงินเดือน:</span>
                  <span className="text-sm">{job.salary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ประเภท:</span>
                  <span className="text-sm">{job.type}</span>
                </div>
                <p className="mt-4 text-sm text-gray-700">{job.description}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">สมัครงาน</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}