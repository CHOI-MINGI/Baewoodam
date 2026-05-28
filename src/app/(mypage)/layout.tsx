import { auth } from '@/lib/auth';
import BottomTabBar from "@/components/shared/BottomTabBar";

export default async function MypageLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const roleType = (session?.user as any)?.roleType ?? 'ACTOR';

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full max-w-[430px] flex-1 flex flex-col pb-20 bg-white relative">
        {children}
        <BottomTabBar roleType={roleType} />
      </div>
    </div>
  );
}
