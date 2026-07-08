type BoardPageLayoutProps = {
  nav: React.ReactNode;
  title?: string;
  board: React.ReactNode;
  children?: React.ReactNode;
};

export function BoardPageLayout({ nav, title, board, children }: BoardPageLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-57px)] w-full flex-col">
      {title && (
        <h1 className="shrink-0 px-4 pt-3 font-heading text-xl text-umber">{title}</h1>
      )}
      <div className="shrink-0 border-b border-umber/10 bg-white/50 px-4 py-2">{nav}</div>
      <div className="relative min-h-0 flex-1 w-full">{board}</div>
      {children}
    </div>
  );
}
