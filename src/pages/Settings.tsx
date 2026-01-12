import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Globe, 
  Palette, 
  User, 
  Shield, 
  Bell, 
  Accessibility, 
  Users, 
  Info,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSettings, Language } from '@/contexts/SettingsContext';
import { useMood, MoodType, moodThemes } from '@/contexts/MoodContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type SettingsSection = 'main' | 'language' | 'theme' | 'account' | 'privacy' | 'notifications' | 'accessibility' | 'watchparty' | 'about';

const moodOptions: { id: MoodType; label: string; emoji: string }[] = [
  { id: 'default', label: 'Default Purple', emoji: '💜' },
  { id: 'happy', label: 'Happy Yellow', emoji: '😊' },
  { id: 'sad', label: 'Melancholy Blue', emoji: '😢' },
  { id: 'stressed', label: 'Calm Teal', emoji: '😰' },
  { id: 'romantic', label: 'Romantic Pink', emoji: '💕' },
  { id: 'excited', label: 'Energetic Orange', emoji: '🎉' },
  { id: 'relaxed', label: 'Peaceful Cyan', emoji: '😌' },
  { id: 'lonely', label: 'Comfort Indigo', emoji: '🥺' },
  { id: 'nostalgic', label: 'Warm Amber', emoji: '🌅' },
  { id: 'motivated', label: 'Vibrant Green', emoji: '💪' },
  { id: 'curious', label: 'Mysterious Violet', emoji: '🤔' },
  { id: 'hopeful', label: 'Fresh Mint', emoji: '✨' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useSettings();
  const { currentMood, setMood, theme } = useMood();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');

  const settingsItems = [
    { id: 'language' as const, icon: Globe, label: t('settings.language'), desc: t('settings.languageDesc') },
    { id: 'theme' as const, icon: Palette, label: t('settings.theme'), desc: t('settings.themeDesc') },
    { id: 'account' as const, icon: User, label: t('settings.account'), desc: t('settings.accountDesc') },
    { id: 'privacy' as const, icon: Shield, label: t('settings.privacy'), desc: t('settings.privacyDesc') },
    { id: 'notifications' as const, icon: Bell, label: t('settings.notifications'), desc: t('settings.notificationsDesc') },
    { id: 'accessibility' as const, icon: Accessibility, label: t('settings.accessibility'), desc: t('settings.accessibilityDesc') },
    { id: 'watchparty' as const, icon: Users, label: t('settings.watchParty'), desc: t('settings.watchPartyDesc') },
    { id: 'about' as const, icon: Info, label: t('settings.about'), desc: t('settings.aboutDesc') },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'language':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('settings.language')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
            
            <div className="space-y-2 mt-4">
              {[
                { code: 'en' as Language, label: 'English', native: 'English' },
                { code: 'tl' as Language, label: 'Tagalog', native: 'Tagalog' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "w-full p-4 rounded-xl flex items-center justify-between transition-all",
                    language === lang.code 
                      ? "bg-primary/20 border-2 border-primary" 
                      : "glass-card hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.code === 'en' ? '🇺🇸' : '🇵🇭'}</span>
                    <div className="text-left">
                      <p className="font-medium">{lang.label}</p>
                      <p className="text-xs text-muted-foreground">{lang.native}</p>
                    </div>
                  </div>
                  {language === lang.code && <Check className="h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('settings.theme')}</h3>
            <p className="text-sm text-muted-foreground">
              Choose a mood theme that changes the entire app's color scheme
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {moodOptions.map((mood) => {
                const moodTheme = moodThemes[mood.id];
                return (
                  <button
                    key={mood.id}
                    onClick={() => setMood(mood.id)}
                    className={cn(
                      "p-4 rounded-xl flex flex-col items-center gap-2 transition-all border-2",
                      currentMood === mood.id 
                        ? "border-primary bg-primary/10" 
                        : "border-transparent glass-card hover:bg-secondary/50"
                    )}
                  >
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `hsl(${moodTheme.primary} / 0.3)` }}
                    >
                      {mood.emoji}
                    </div>
                    <span className="text-xs font-medium text-center">{mood.label}</span>
                    {currentMood === mood.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('settings.account')}</h3>
            
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="glass-card p-4">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="font-semibold">{user?.email}</p>
                  {user?.username && (
                    <p className="text-sm text-primary">@{user.username}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <button className="w-full p-4 glass-card flex items-center justify-between">
                    <span>Edit Profile</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="w-full p-4 glass-card flex items-center justify-between">
                    <span>Change Password</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="w-full p-4 glass-card flex items-center justify-between">
                    <span>Connected Accounts</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={logout}
                >
                  {t('auth.signOut')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">Sign in to manage your account</p>
                <Button onClick={() => navigate('/auth')}>
                  {t('auth.signIn')}
                </Button>
              </div>
            )}
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('settings.privacy')}</h3>
            <div className="space-y-2">
              <button className="w-full p-4 glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Collection</p>
                  <p className="text-xs text-muted-foreground">Manage how we collect data</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full p-4 glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">Download My Data</p>
                  <p className="text-xs text-muted-foreground">Export your information</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full p-4 glass-card flex items-center justify-between text-destructive">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-xs opacity-70">Permanently remove your data</p>
                </div>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('settings.notifications')}</h3>
            <div className="space-y-2">
              {[
                { label: 'Friend Activity', desc: 'When friends watch movies' },
                { label: 'Watch Party Invites', desc: 'When invited to parties' },
                { label: 'New Releases', desc: 'Movies matching your taste' },
                { label: 'AI Recommendations', desc: 'Personalized suggestions' },
              ].map((item) => (
                <div key={item.label} className="p-4 glass-card flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('settings.accessibility')}</h3>
            <div className="space-y-2">
              <div className="p-4 glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">Reduce Motion</p>
                  <p className="text-xs text-muted-foreground">Minimize animations</p>
                </div>
                <input type="checkbox" className="h-5 w-5 accent-primary" />
              </div>
              <div className="p-4 glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">High Contrast</p>
                  <p className="text-xs text-muted-foreground">Improve readability</p>
                </div>
                <input type="checkbox" className="h-5 w-5 accent-primary" />
              </div>
              <div className="p-4 glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">Large Text</p>
                  <p className="text-xs text-muted-foreground">Increase font sizes</p>
                </div>
                <input type="checkbox" className="h-5 w-5 accent-primary" />
              </div>
            </div>
          </div>
        );

      case 'watchparty':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('settings.watchParty')}</h3>
            <div className="space-y-2">
              <div className="p-4 glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-join with Camera</p>
                  <p className="text-xs text-muted-foreground">Camera on when joining</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
              </div>
              <div className="p-4 glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-join with Mic</p>
                  <p className="text-xs text-muted-foreground">Microphone on when joining</p>
                </div>
                <input type="checkbox" className="h-5 w-5 accent-primary" />
              </div>
              <div className="p-4 glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Reactions</p>
                  <p className="text-xs text-muted-foreground">Display emoji reactions</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('settings.about')}</h3>
            <div className="glass-card p-6 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-xl uppercase">Absolute Cinema</h4>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI-powered movie companion. Discover films that match your mood.
              </p>
            </div>
            <div className="space-y-2">
              <button className="w-full p-4 glass-card flex items-center justify-between">
                <span>Terms of Service</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full p-4 glass-card flex items-center justify-between">
                <span>Privacy Policy</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full p-4 glass-card flex items-center justify-between">
                <span>Contact Support</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pt-4">
        {/* Header */}
        <header className="px-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (activeSection === 'main') {
                navigate('/profile');
              } else {
                setActiveSection('main');
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
          >
            {activeSection === 'main' ? t('settings.title') : settingsItems.find(i => i.id === activeSection)?.label}
          </motion.h1>
        </header>

        <AnimatePresence mode="wait">
          {activeSection === 'main' ? (
            <motion.section 
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-4 space-y-2"
            >
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveSection(item.id)}
                    className="glass-card w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.button>
                );
              })}
            </motion.section>
          ) : (
            <motion.section 
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pb-8"
            >
              {renderSection()}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
