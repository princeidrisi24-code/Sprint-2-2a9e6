import './globals.css'

export const metadata = {
  title: 'FinMentor AI — Your Personal Finance Coach',
  description: 'AI-powered personal finance mentor that helps you build healthy money habits, track goals, manage debt, and grow your wealth — personalized to your life.',
  keywords: 'personal finance, AI mentor, budgeting, savings, debt tracker, financial goals',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
