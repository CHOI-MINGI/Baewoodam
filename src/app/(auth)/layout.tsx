export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-[430px] flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
