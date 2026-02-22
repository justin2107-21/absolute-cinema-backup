import { motion } from 'framer-motion';
import { Download, Smartphone, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface InstallProps {
  onContinue: () => void;
}

export default function Install({ onContinue }: InstallProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[120px] opacity-40 bg-primary/30" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-[120px] opacity-30 bg-accent/30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-sm w-full space-y-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <img src={logo} alt="Absolute Cinema" className="w-20 h-20 rounded-2xl" />
          <h1 className="text-3xl font-bold text-foreground">Absolute Cinema</h1>
          <p className="text-muted-foreground text-sm">
            Your ultimate movie & TV companion
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/50 text-left">
            <div className="p-2 rounded-lg bg-primary/20">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Native App Experience</p>
              <p className="text-xs text-muted-foreground">Install as an app for the best experience</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/50 text-left">
            <div className="p-2 rounded-lg bg-accent/20">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Fast & Smooth</p>
              <p className="text-xs text-muted-foreground">Optimized performance on your device</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/50 text-left">
            <div className="p-2 rounded-lg bg-cinema-green/20">
              <Shield className="h-5 w-5 text-[hsl(var(--cinema-green))]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Secure & Private</p>
              <p className="text-xs text-muted-foreground">Your data stays safe</p>
            </div>
          </div>
        </motion.div>

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Button
            size="lg"
            className="w-full gap-2 text-base font-semibold h-14"
            onClick={() => {
              // In a Capacitor build this would trigger APK download
              // For web, we just continue to the app
              onContinue();
            }}
          >
            <Download className="h-5 w-5" />
            Download APK
          </Button>

          <button
            onClick={onContinue}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Continue in browser instead
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-muted-foreground/60"
        >
          Built with Capacitor for native Android experience
        </motion.p>
      </motion.div>
    </div>
  );
}
