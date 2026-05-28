import BottomTabBar from "@/components/shared/BottomTabBar";

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full max-w-[430px] flex-1 flex flex-col pb-20 bg-white relative">
        {children}
        <BottomTabBar />
      </div>
    </div>
  );
}
