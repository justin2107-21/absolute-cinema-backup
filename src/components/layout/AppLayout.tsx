import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  hideHeader?: boolean;
}

export function AppLayout({ children, hideNav = false, hideHeader = false }: AppLayoutProps) {
  const { currentMood, theme } = useMood();

  return (
    <div className={cn(
      "min-h-screen bg-background transition-all duration-500",
      currentMood !== 'default' && `mood-gradient-${currentMood}`
    )}>
      {/* Ambient background effects - color changes with mood */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-all duration-500">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[100px] opacity-50 transition-all duration-500"
          style={{ backgroundColor: `hsl(${theme.primary} / 0.2)` }}
        />
        <div 
          className="absolute top-1/2 -left-40 w-60 h-60 rounded-full blur-[80px] opacity-30 transition-all duration-500"
          style={{ backgroundColor: `hsl(${theme.accent} / 0.2)` }}
        />
        <div className="absolute -bottom-20 right-1/3 w-40 h-40 bg-cinema-blue/20 rounded-full blur-[60px] opacity-40" />
      </div>
      
      {/* Header */}
      {!hideHeader && <Header />}
      
      {/* Main content */}
      <main className="relative z-10 pb-24">
        {children}
      </main>
      
      {!hideNav && <BottomNav />}
    </div>
  );
}
