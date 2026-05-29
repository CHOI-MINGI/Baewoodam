import { auth } from '@/lib/auth';
import BottomTabBar from "@/components/shared/BottomTabBar";
import Sidebar from "@/components/shared/Sidebar";

export default async function MypageLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const roleType = (session?.user as any)?.roleType ?? 'ACTOR';

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* 데스크탑 사이드바 */}
      <Sidebar roleType={roleType} />

      {/* 콘텐츠 영역 */}
      <div className="md:pl-[220px] min-h-screen">
        <div className="w-full bg-white min-h-screen pb-20 md:pb-0 relative">
          {children}
        </div>
      </div>

      {/* 모바일 하단 탭바 */}
      <div className="md:hidden">
        <BottomTabBar roleType={roleType} />
      </div>
    </div>
  );
}
