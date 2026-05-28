import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-6">
      <p className="text-[48px] font-bold text-[#1A1A2E]">404</p>
      <p className="text-[18px] font-semibold text-[#1A1A1A]">페이지를 찾을 수 없어요</p>
      <p className="text-[14px] text-[#888888] text-center">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        href="/home"
        className="px-8 h-[48px] rounded-full bg-[#1A1A2E] text-white text-[15px] font-semibold flex items-center"
      >
        홈으로
      </Link>
    </div>
  );
}
