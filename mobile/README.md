# Mobile Module

This folder is reserved for mobile-specific configurations and adaptations.

## Purpose
- Mobile app configurations (Capacitor/PWA)
- Native mobile features and plugins
- Mobile-optimized components
- App store assets and metadata

## Conversion Options

### Option 1: Progressive Web App (PWA)
- Installable directly from browser
- Works on all devices (iOS and Android)
- No app store submission needed
- Offline capabilities
- Setup: Configure `vite-plugin-pwa` and add manifest

### Option 2: Native Mobile App (Capacitor)
- Full native app for App Store and Google Play
- Access to all device features
- Best performance
- Requires: Xcode (iOS) and Android Studio (Android)
- Setup: Install Capacitor dependencies and run `npx cap init`

## Getting Started
The frontend code is already structured to be mobile-friendly and can be easily converted to either a PWA or native app when needed.

Refer to the Lovable documentation for detailed mobile setup guides.
