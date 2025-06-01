# DOC-019: PWA Setup - Progressive Web App

## Overview

This document implements Progressive Web App (PWA) features for the Colorado Job Board, making it installable on mobile devices and providing offline functionality. This is crucial for blue-collar workers who may have limited connectivity at job sites.

## Prerequisites

- **DOC-001**: Basic project setup completed
- **DOC-006**: Layout structure implemented
- **DOC-007**: Job listing pages working
- Next.js 14 application running

## PWA Benefits for Job Seekers

1. **Offline Access**: View saved jobs without internet
2. **Mobile Installation**: Add to home screen like native app
3. **Fast Loading**: Cached resources load instantly
4. **Background Updates**: New jobs sync when connection returns
5. **Push Notifications**: Future feature for job alerts

## Steps

### 1. PWA Dependencies and Configuration

#### Install PWA Dependencies
```bash
npm install next-pwa workbox-webpack-plugin
npm install --save-dev @types/serviceworker
```

#### Next.js PWA Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  scope: '/',
  sw: 'sw.js',
  fallbacks: {
    document: '/offline',
  },
  cacheStartUrl: true,
  dynamicStartUrl: false,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
    exclude: [/\.map$/, /manifest$/, /middleware-manifest\.json$/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-static',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
          }
        }
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      },
      {
        urlPattern: /\/api\/jobs/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-jobs',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          },
          networkTimeoutSeconds: 10
        }
      },
      {
        urlPattern: /\/jobs\/.*/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'job-pages',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      }
    ]
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing next config
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
```

### 2. Web App Manifest

#### Create Manifest File
```json
// public/manifest.json
{
  "name": "Colorado Trades Jobs",
  "short_name": "CO Trades",
  "description": "Find blue-collar and skilled trade jobs in Colorado",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "orientation": "portrait-primary",
  "categories": ["business", "productivity", "employment"],
  "lang": "en-US",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Browse Jobs",
      "short_name": "Jobs",
      "description": "Browse all available jobs",
      "url": "/jobs",
      "icons": [
        {
          "src": "/icons/jobs-shortcut-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "My Applications",
      "short_name": "Applications",
      "description": "View your job applications",
      "url": "/dashboard/applications",
      "icons": [
        {
          "src": "/icons/applications-shortcut-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Post a Job",
      "short_name": "Post Job",
      "description": "Post a new job opening",
      "url": "/dashboard/jobs/new",
      "icons": [
        {
          "src": "/icons/post-job-shortcut-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-jobs-list.png",
      "sizes": "375x812",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Browse available jobs on mobile"
    },
    {
      "src": "/screenshots/mobile-job-detail.png",
      "sizes": "375x812",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "View job details and apply"
    },
    {
      "src": "/screenshots/desktop-dashboard.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Employer dashboard on desktop"
    }
  ]
}
```

### 3. Offline Page

#### Create Offline Fallback
```typescript
// app/offline/page.tsx
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, BookmarkIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'You\'re Offline - Colorado Trades Jobs',
  description: 'No internet connection. View saved jobs or try again when connected.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <WifiOff className="h-6 w-6 text-gray-600" />
          </div>
          <CardTitle className="text-xl">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            No internet connection detected. Some features may not be available.
          </p>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">What you can do:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                View previously loaded job listings
              </li>
              <li className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                Read saved job descriptions
              </li>
              <li className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                Browse your application history
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Your form data and job applications will be saved and submitted when you're back online.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Install Prompt Component

#### PWA Install Banner
```typescript
// components/PWA/InstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (dismissedDate > weekAgo) {
        return; // Don't show for a week after dismissal
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-2 border-blue-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900 mb-1">
                Install Colorado Trades Jobs
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Add to your home screen for quick access to job listings and applications, even offline.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleInstallClick}
                  className="text-xs"
                >
                  Install
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="flex-shrink-0 p-1 h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. PWA Meta Tags

#### Update Root Layout
```typescript
// app/layout.tsx - Add to existing layout
import { Metadata, Viewport } from 'next';
import InstallPrompt from '@/components/PWA/InstallPrompt';

export const metadata: Metadata = {
  title: {
    default: 'Colorado Trades Jobs - Find Blue-Collar Jobs in Colorado',
    template: '%s | Colorado Trades Jobs',
  },
  description: 'Find construction, manufacturing, and skilled trade jobs across Colorado. Apply online and connect with top employers.',
  keywords: ['colorado jobs', 'blue collar jobs', 'construction jobs', 'manufacturing jobs', 'skilled trades'],
  authors: [{ name: 'Colorado Trades Jobs' }],
  creator: 'Colorado Trades Jobs',
  publisher: 'Colorado Trades Jobs',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Colorado Trades Jobs',
    startupImage: [
      {
        url: '/icons/apple-launch-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-launch-1125x2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://coloradotradesjobs.com',
    siteName: 'Colorado Trades Jobs',
    title: 'Colorado Trades Jobs - Find Blue-Collar Jobs in Colorado',
    description: 'Find construction, manufacturing, and skilled trade jobs across Colorado.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Colorado Trades Jobs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colorado Trades Jobs - Find Blue-Collar Jobs in Colorado',
    description: 'Find construction, manufacturing, and skilled trade jobs across Colorado.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e40af' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Colorado Trades Jobs" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CO Trades" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Splash Screens */}
        <link rel="apple-touch-startup-image" href="/icons/apple-launch-2048x2732.png" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/icons/icon-192x192.png" as="image" type="image/png" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 6. Offline Data Storage

#### IndexedDB Storage Hook
```typescript
// hooks/useOfflineStorage.ts
'use client';

import { useState, useEffect } from 'react';

interface OfflineData {
  id: string;
  data: any;
  timestamp: number;
  type: 'job' | 'application' | 'search';
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(true);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    // Initialize IndexedDB
    const initDB = async () => {
      if (typeof window === 'undefined') return;
      
      const request = indexedDB.open('ColoradoTradesJobs', 1);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB');
      };
      
      request.onsuccess = () => {
        setDb(request.result);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('jobs')) {
          const jobStore = db.createObjectStore('jobs', { keyPath: 'id' });
          jobStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('applications')) {
          const appStore = db.createObjectStore('applications', { keyPath: 'id' });
          appStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('searches')) {
          const searchStore = db.createObjectStore('searches', { keyPath: 'id' });
          searchStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    };

    initDB();

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = async (type: OfflineData['type'], id: string, data: any) => {
    if (!db) return false;

    try {
      const transaction = db.transaction([type + 's'], 'readwrite');
      const store = transaction.objectStore(type + 's');
      
      await store.put({
        id,
        data,
        timestamp: Date.now(),
        type,
      });

      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  };

  const getOfflineData = async (type: OfflineData['type'], id?: string) => {
    if (!db) return null;

    try {
      const transaction = db.transaction([type + 's'], 'readonly');
      const store = transaction.objectStore(type + 's');

      if (id) {
        const request = store.get(id);
        return new Promise((resolve) => {
          request.onsuccess = () => resolve(request.result?.data || null);
          request.onerror = () => resolve(null);
        });
      } else {
        const request = store.getAll();
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const results = request.result.map(item => item.data);
            resolve(results);
          };
          request.onerror = () => resolve([]);
        });
      }
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  };

  const clearOfflineData = async (type: OfflineData['type'], olderThan?: number) => {
    if (!db) return false;

    try {
      const transaction = db.transaction([type + 's'], 'readwrite');
      const store = transaction.objectStore(type + 's');

      if (olderThan) {
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(olderThan);
        const request = index.openCursor(range);
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              resolve(true);
            }
          };
          request.onerror = () => resolve(false);
        });
      } else {
        await store.clear();
        return true;
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return false;
    }
  };

  return {
    isOnline,
    saveOfflineData,
    getOfflineData,
    clearOfflineData,
  };
}