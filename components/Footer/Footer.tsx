import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">JobFinder</h2>
            <p className="text-gray-300 text-sm">
              เว็บไซต์หางานชั้นนำที่รวบรวมตำแหน่งงานคุณภาพจากบริษัทชั้นนำทั่วประเทศ
              เพื่อให้คุณได้พบกับงานที่ใช่และเหมาะสมกับคุณมากที่สุด
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">สำหรับผู้หางาน</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-gray-300 hover:text-white text-sm">
                  ค้นหางาน
                </Link>
              </li>
              <li>
                <Link href="/saved-jobs" className="text-gray-300 hover:text-white text-sm">
                  งานที่บันทึกไว้
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white text-sm">
                  โปรไฟล์ของฉัน
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-gray-300 hover:text-white text-sm">
                  สร้างเรซูเม่
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">สำหรับนายจ้าง</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/employer/post-job" className="text-gray-300 hover:text-white text-sm">
                  ลงประกาศรับสมัครงาน
                </Link>
              </li>
              <li>
                <Link href="/employer/pricing" className="text-gray-300 hover:text-white text-sm">
                  แพ็คเกจและราคา
                </Link>
              </li>
              <li>
                <Link href="/employer/resources" className="text-gray-300 hover:text-white text-sm">
                  ทรัพยากรสำหรับนายจ้าง
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">ติดต่อเรา</h3>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm">
                อีเมล: contact@jobfinder.com
              </li>
              <li className="text-gray-300 text-sm">
                โทรศัพท์: 02-123-4567
              </li>
              <li className="text-gray-300 text-sm">
                เวลาทำการ: จันทร์-ศุกร์ 9:00 - 18:00 น.
              </li>
            </ul>
            <div className="mt-4 flex space-x-3">
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between">
          <div className="text-gray-400 text-sm">
            &copy; {currentYear} JobFinder. สงวนลิขสิทธิ์.
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-gray-300 text-sm">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-gray-300 text-sm">
              ข้อกำหนดการใช้งาน
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-gray-300 text-sm">
              คุกกี้
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;