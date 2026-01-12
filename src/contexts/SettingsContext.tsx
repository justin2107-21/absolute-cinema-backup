import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'tl';

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.moodmatch': 'MoodMatch',
    'nav.party': 'Party',
    'nav.profile': 'Profile',
    
    // Home
    'home.trending': 'Trending Now',
    'home.popular': 'Popular Movies',
    'home.topRated': 'Top Rated',
    'home.nowPlaying': 'In Theaters',
    'home.upcoming': 'Coming Soon',
    'home.movies': 'Movies',
    'home.tvSeries': 'TV Series',
    'home.categories': 'Categories',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.loginWithEmail': 'Sign in with email',
    'auth.signOut': 'Sign Out',
    
    // Profile
    'profile.title': 'Profile',
    'profile.watchlist': 'Watchlist',
    'profile.watched': 'Watched',
    'profile.friends': 'Friends',
    'profile.settings': 'Settings',
    'profile.guestUser': 'Guest User',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose your preferred language',
    'settings.theme': 'Theme & Mood',
    'settings.themeDesc': 'Customize app appearance',
    'settings.account': 'Account',
    'settings.accountDesc': 'Manage your account',
    'settings.privacy': 'Privacy & Security',
    'settings.privacyDesc': 'Control your data',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Manage alerts',
    'settings.accessibility': 'Accessibility',
    'settings.accessibilityDesc': 'Visual and audio options',
    'settings.watchParty': 'Watch Party',
    'settings.watchPartyDesc': 'Party preferences',
    'settings.about': 'About',
    'settings.aboutDesc': 'App info and support',
    
    // MoodMatch
    'mood.title': 'MoodMatch AI',
    'mood.subtitle': 'Find movies that match your mood',
    'mood.placeholder': 'Tell me how you\'re feeling...',
    'mood.showRecommendations': 'Show Recommendations',
    
    // Watch Party
    'party.title': 'Watch Party',
    'party.create': 'Create Watch Party',
    'party.join': 'Join a Party',
    'party.enterCode': 'Enter room code...',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.viewDetails': 'View Details',
    'common.addToList': 'Add to List',
  },
  tl: {
    // Navigation
    'nav.home': 'Bahay',
    'nav.search': 'Maghanap',
    'nav.moodmatch': 'MoodMatch',
    'nav.party': 'Parti',
    'nav.profile': 'Profile',
    
    // Home
    'home.trending': 'Trending Ngayon',
    'home.popular': 'Sikat na Pelikula',
    'home.topRated': 'Pinakamataas ang Rating',
    'home.nowPlaying': 'Sa Sinehan',
    'home.upcoming': 'Paparating',
    'home.movies': 'Mga Pelikula',
    'home.tvSeries': 'Mga TV Series',
    'home.categories': 'Mga Kategorya',
    
    // Auth
    'auth.signIn': 'Mag-login',
    'auth.signUp': 'Gumawa ng Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.loginWithEmail': 'Mag-login gamit ang email',
    'auth.signOut': 'Mag-logout',
    
    // Profile
    'profile.title': 'Profile',
    'profile.watchlist': 'Listahan',
    'profile.watched': 'Napanood',
    'profile.friends': 'Mga Kaibigan',
    'profile.settings': 'Mga Setting',
    'profile.guestUser': 'Bisita',
    
    // Settings
    'settings.title': 'Mga Setting',
    'settings.language': 'Wika',
    'settings.languageDesc': 'Piliin ang iyong wika',
    'settings.theme': 'Tema at Mood',
    'settings.themeDesc': 'I-customize ang hitsura',
    'settings.account': 'Account',
    'settings.accountDesc': 'Pamahalaan ang account',
    'settings.privacy': 'Privacy at Seguridad',
    'settings.privacyDesc': 'Kontrolin ang data',
    'settings.notifications': 'Mga Abiso',
    'settings.notificationsDesc': 'Pamahalaan ang mga alerto',
    'settings.accessibility': 'Accessibility',
    'settings.accessibilityDesc': 'Mga opsyon sa visual at audio',
    'settings.watchParty': 'Watch Party',
    'settings.watchPartyDesc': 'Mga kagustuhan sa parti',
    'settings.about': 'Tungkol sa',
    'settings.aboutDesc': 'Impormasyon at suporta',
    
    // MoodMatch
    'mood.title': 'MoodMatch AI',
    'mood.subtitle': 'Humanap ng pelikula ayon sa mood mo',
    'mood.placeholder': 'Sabihin mo kung ano ang nararamdaman mo...',
    'mood.showRecommendations': 'Ipakita ang mga Rekomendasyon',
    
    // Watch Party
    'party.title': 'Watch Party',
    'party.create': 'Gumawa ng Watch Party',
    'party.join': 'Sumali sa Parti',
    'party.enterCode': 'Ilagay ang room code...',
    
    // Common
    'common.loading': 'Naglo-load...',
    'common.error': 'May problema',
    'common.retry': 'Subukan Ulit',
    'common.save': 'I-save',
    'common.cancel': 'Kanselahin',
    'common.back': 'Bumalik',
    'common.viewDetails': 'Tingnan ang Detalye',
    'common.addToList': 'Idagdag sa Listahan',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('absolutecinema_language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('absolutecinema_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
