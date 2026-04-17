# Yip Products — Case Study Submission

A polished React Native product catalog app built for the React Mobile Developer role at YipOnline. See [WALKTHROUGH.md](WALKTHROUGH.md) for architecture deep-dive and design rationale.

### Highlights

- **Zustand** with standalone selectors — surgical re-renders, zero provider nesting
- **Optimistic updates** with automatic rollback on persistence failure
- **Runtime shape validation** on AsyncStorage — corrupted data never crashes the app
- **Full accessibility** — every interactive element has proper roles, labels, and live regions
- **Unsaved-changes guard** — `beforeRemove` covers back button, swipe, and hardware back

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9 (or yarn)
- **Expo Go** app on your phone (for physical device testing), or an iOS Simulator / Android Emulator

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on Expo Go (scan QR code)
npx expo start
```

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native + Expo SDK 54 | Cross-platform mobile framework |
| TypeScript | Type safety and developer experience |
| React Navigation | Native stack navigation |
| Zustand | Lightweight state management |
| AsyncStorage | Local data persistence |
| Expo Image Picker | Product photo selection |

## Features

- Add, edit, and delete products (name, price, optional photo)
- Enforced 5-product maximum with clear user feedback
- Persistent local storage — products survive app restarts
- Form validation with inline error messages
- Image picker with preview, change, and remove actions
- Empty state UI for first-time users
- Product count indicator with limit warning
- Delete confirmation dialog
- Keyboard-aware form with smooth scrolling
- Double-tap submission prevention

## Architecture

```
src/
  app/
    navigation/       → Stack navigator and route types
    providers/        → App-level providers (SafeArea, Navigation)
    store/            → Zustand product store
  components/
    common/           → Reusable UI: Button, Input, Screen, EmptyState
    product/          → Domain-specific: ProductCard, ProductCounter, ImagePickerButton
  features/
    products/
      hooks/          → useProductForm custom hook
      screens/        → ProductListScreen, ProductFormScreen
      services/       → AsyncStorage persistence layer
      types/          → Product and form data interfaces
      utils/          → Validation helpers
  constants/          → App-wide constants (MAX_PRODUCTS, STORAGE_KEY)
  theme/              → Design tokens: colors, spacing, typography, shadows
```

## Design Decisions

- **Zustand over Context/Redux**: Minimal boilerplate, no provider nesting, built-in selector support
- **Product photo is optional**: Reduces friction; products can be created quickly without images
- **Optimistic updates with rollback**: Store updates immediately, reverts on persistence failure
- **Feature-oriented folder structure**: Groups related code by domain for maintainability
- **Centralized theme tokens**: Consistent styling without magic numbers scattered across files

## Author

Enoch Epekipolu. See [WALKTHROUGH.md](WALKTHROUGH.md) for full technical details.
