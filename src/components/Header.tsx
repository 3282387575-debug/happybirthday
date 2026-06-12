export function Header() {
  return (
    <header className="pointer-events-none absolute top-0 left-0 right-0 z-10 flex flex-col items-center pt-6 sm:pt-10 animate-rise-in">
      <p className="font-sans text-[10px] sm:text-xs tracking-[0.4em] uppercase text-champagne-300/80 mb-2">
        · A little celebration ·
      </p>
      <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-gold-gradient text-center drop-shadow-[0_0_20px_rgba(255,184,77,0.35)] leading-tight">
        Happy Birthday
      </h1>
    </header>
  );
}
