export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="notebook-paper min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  )
}
