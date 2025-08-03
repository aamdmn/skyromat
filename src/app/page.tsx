import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@/components/header';
import { ThemeCard } from '@/components/theme-card';
import { auth } from '@/lib/auth';
import { getAllThemes } from '@/lib/levels';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect('/login');
  }

  const themes = await getAllThemes();
  return (
    <>
      <Header />
      <div className="flex h-screen w-full flex-col items-center bg-background">
        <div className="flex h-screen w-full max-w-[98rem] flex-col items-center bg-background">
          <div className="w-full px-8 py-8 text-start">
            <h1 className="font-semibold text-2xl">Vitajte v SkyroMat!</h1>
            <p className="text-muted-foreground">
              Preskúmaj levely a vylepš svoje zručnosti.
            </p>
          </div>
          <div className="w-full flex-grow px-4 pb-8">
            <div className="grid max-w-8xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme, index) => (
                <ThemeCard index={index} key={theme.id} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
