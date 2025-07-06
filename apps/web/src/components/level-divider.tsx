interface LevelDividerProps {
  name: string;
}

export function LevelDivider({ name }: LevelDividerProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="h-px w-12 bg-current" />
        <span className="font-medium text-lg">{name}</span>
        <div className="h-px w-12 bg-current" />
      </div>
    </div>
  );
}
