# Betakah

A private event management mobile app for Qatar. Create beautiful invitations, manage guest lists, and track RSVPs for weddings, birthdays, and special gatherings.

## Features

- **Create Events** - Plan weddings, birthdays, graduations, and more
- **Digital Invitations** - Send beautiful themed invitations via SMS, WhatsApp, or in-app
- **Guest Management** - Track RSVPs and manage attendance
- **Important Dates** - Never forget birthdays and anniversaries
- **Privacy First** - Your events stay private, shared only with those you choose
- **Bilingual** - Full Arabic and English support

## Tech Stack

- React Native with Expo
- Expo Router for navigation
- Redux Toolkit for state management
- i18next for internationalization
- TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
mobile/
├── app/                  # Expo Router screens
│   ├── (auth)/          # Authentication flow
│   ├── (tabs)/          # Main tab navigation
│   └── modals/          # Modal screens
├── src/
│   ├── components/      # Reusable components
│   ├── constants/       # Colors, config
│   ├── hooks/           # Custom hooks
│   ├── i18n/            # Translations
│   ├── services/        # API services
│   ├── store/           # Redux store
│   ├── themes/          # Invitation templates
│   └── types/           # TypeScript types
└── assets/              # Fonts, images
```

## License

Private - All rights reserved
