import './globals.css';

export const metadata = {
  title: 'Secure To-Do List',
  description: 'A highly secure, scalable To-Do List application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900">{children}</body>
    </html>
  );
}
