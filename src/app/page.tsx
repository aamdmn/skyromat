import { ThemeCard } from '@/components/theme-card';
import { getAllThemes } from '@/lib/levels';

export default function Home() {
  const themes = getAllThemes();
  return (
    <div className="flex h-screen w-full flex-col items-center bg-background">
      <div className="flex h-screen w-full max-w-[98rem] flex-col items-center bg-background">
        <div className="w-full px-8 py-8 text-start">
          <h1 className="font-semibold text-2xl">Vitajte v SkyroMat!</h1>
          <p className="text-muted-foreground">
            Preskúmaj levely a vylepš svoje zručnosti.
          </p>
        </div>
        <div className="w-full flex-grow overflow-y-auto px-4 pb-8">
          <div className="grid max-w-8xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme, index) => (
              <ThemeCard index={index} key={theme.id} theme={theme} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
