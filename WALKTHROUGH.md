# Yip Products — Technical Walkthrough

## Project Overview

**Yip Products** is a React Native mobile application that allows users to manage a small product catalog of up to 5 items. Each product has a name, price, and an optional photo. The app is designed to demonstrate clean architecture, thoughtful UX, and production-quality code patterns suitable for a senior React Mobile Developer role.

The app is built with **Expo**, **TypeScript**, **Zustand**, and **React Navigation** — a modern stack that balances developer experience with production reliability.

---

## Feature Summary

| Feature | Description |
|---|---|
| Product List | Scrollable list with product cards showing name, price, and image |
| Add Product | Form screen with name, price, and optional photo input |
| Edit Product | Same form pre-filled with existing product data |
| Delete Product | Confirmation dialog before permanent removal |
| Product Counter | Real-time "X / 5 products" badge with limit warning |
| Limit Enforcement | Alert when trying to exceed 5 products |
| Persistence | Products saved to AsyncStorage, restored on app launch |
| Empty State | Friendly placeholder UI when no products exist |
| Validation | Inline form errors for name and price fields |
| Image Handling | Photo picker with preview, change, and remove |

---

## Architecture Overview

The project follows a **feature-oriented architecture** where code is grouped by domain responsibility rather than file type:

```
src/
  app/                → Application shell (navigation, providers, store)
  components/
    common/           → Reusable components (Button, Input, Screen, EmptyState)
    product/          → Product-specific components (ProductCard, ProductCounter)
  features/
    products/         → Core feature module
      hooks/          → Custom form hook
      screens/        → List and form screens
      services/       → Storage service
      types/          → TypeScript interfaces
      utils/          → Validation logic
  constants/          → Shared constants
  theme/              → Design tokens
```

**Why feature-oriented?**
- Related code is co-located, reducing context switching
- Each feature can scale independently
- New features are added without touching existing modules
- Easy for new team members to navigate

---

## State Management: Zustand

I chose **Zustand** over Redux or Context API for several reasons:

1. **Minimal boilerplate** — No actions, reducers, or dispatch ceremony. The store is a single function with clear getters and setters.
2. **No provider nesting** — Zustand doesn't require wrapping the component tree, keeping the provider hierarchy clean.
3. **Built-in selectors** — Components subscribe to specific slices of state via standalone selector functions (`selectProducts`, `selectCanAddProduct`, etc.), preventing unnecessary re-renders.
4. **TypeScript-first** — Excellent type inference out of the box.
5. **Small bundle size** — ~1KB gzipped, appropriate for a focused mobile app.

### Selectors and Re-render Control

Rather than destructuring the entire store (`const { products, ... } = useProductStore()`), each component selects only the slice it needs:

```typescript
const products = useProductStore(selectProducts);
const canAdd = useProductStore(selectCanAddProduct);
```

This means changes to `isLoading` or `error` won't cause the product list to re-render. Selectors are exported as standalone functions from the store file for reuse and testability.

### Optimistic Updates with Rollback

The store implements **optimistic updates**: UI updates immediately for responsiveness, and if the persistence layer fails, the state reverts to the previous snapshot. Combined with `React.memo` on `ProductCard`, this keeps the list performant even during rapid add/delete sequences.

---

## Persistence Strategy

Products are persisted to **AsyncStorage** via a thin service layer (`services/storage.ts`). The store calls `saveProducts()` after every mutation and `loadProducts()` on initialization.

Key decisions:
- **Single storage key** — All products are serialized as a JSON array under one key. For 5 items, this is more efficient than per-item keys.
- **Load once on init** — Products are read from storage exactly once when the app starts. After that, the in-memory Zustand store is the source of truth.
- **Runtime shape validation** — `loadProducts` validates every field of every parsed object using a `isValidProduct` type guard. Corrupted or incomplete entries are silently filtered out rather than crashing the app. This matters because AsyncStorage is user-writable (backup/restore, debugging tools) and `JSON.parse` returns `any`.
- **Error isolation** — If persistence fails during save, the store rolls back. If persistence fails on load, an error state is shown with a retry button.

---

## Image Handling

Users can optionally add a product photo using **Expo Image Picker**.

**Why photos are optional:**
In a real product catalog, not all items have photos immediately available. Making the image required would create friction and prevent quick product entry. The UI shows a clear placeholder for products without images.

**Implementation details:**
- Photos are stored as local URI strings (e.g., `file:///...`)
- Images are cropped to 1:1 aspect ratio for consistent card layouts
- Quality is set to 0.8 to balance visual fidelity and storage size
- Permission is requested the first time the picker opens
- Users can change or remove a photo after selection
- Gracefully handles picker cancellation (no error, no state change)

---

## Validation Approach

Form validation is handled by a **pure function** (`utils/validation.ts`) that returns a typed result:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: { name?: string; price?: string };
}
```

**Validation rules:**
- **Name**: Required, 2–50 characters
- **Price**: Required, must be a positive number, max $999,999.99, up to 2 decimal places

**UX considerations:**
- Errors are shown **on submit**, not on every keystroke (avoids "yelling" at the user while typing)
- Errors clear as soon as the user starts editing the relevant field
- Error messages are human-readable, not technical codes

---

## UX Choices

### Empty State
A friendly illustration with clear copy guides first-time users. The add button is prominent and accessible without scrolling.

### Product Counter
The "X / 5 products" badge gives constant awareness of the limit. When at capacity, it changes color and shows "Product limit reached" — visual contrast makes the limit impossible to miss.

### Delete Confirmation
Destructive actions always require explicit confirmation via a native alert dialog. This prevents accidental deletions while keeping the interaction fast (no multi-step modal flows).

### Unsaved Changes Protection
If the user modifies a form field and tries to navigate back (header back button or Android hardware back), a confirmation dialog appears: "Discard Changes?" This prevents accidental data loss, which is particularly important on mobile where accidental swipe-back gestures are common.

### Keyboard Handling
The form screen uses `KeyboardAvoidingView` and `ScrollView` with `keyboardShouldPersistTaps="handled"` so users can scroll while the keyboard is open and dismiss it naturally.

### Double-Tap Prevention
A `useRef` lock prevents the submit handler from firing twice if the user taps quickly. Combined with a loading state on the button, this eliminates duplicate submissions.

### Error Recovery
If product loading fails (corrupted storage, disk error), an error screen with a **Retry** button allows the user to re-attempt without restarting the app.

### Stale Image Handling
Product images are stored as local file URIs. If a URI becomes invalid (cache cleared, app update), the `ProductCard` gracefully falls back to the placeholder icon instead of showing a broken image.

---

## Edge Cases Handled

| Scenario | Handling |
|---|---|
| Add 6th product | Alert with clear message; button disabled at limit |
| Empty product name | Inline error: "Product name is required" |
| Invalid price (NaN, negative, too large) | Specific inline error messages |
| Image picker cancelled | No-op — form state unchanged |
| Stale/broken image URI | `onError` fallback to placeholder icon |
| Corrupted storage data | Shape validation filters invalid entries on load |
| Persistence load failure | Error screen with retry button |
| Persistence save failure | Optimistic rollback, error alert |
| Duplicate submission taps | Ref-based lock + button loading state |
| Edit non-existent product | `updateProduct` returns `false`, user sees error |
| Unsaved form changes + back | Confirmation dialog prevents accidental data loss |
| Edit without breaking limit | Edit doesn't count against the max |
| Delete then re-add | Counter updates correctly, add button re-enables |
| App restart | Products fully restored from AsyncStorage |

---

## Accessibility

Accessibility is not an afterthought — it's part of the baseline implementation:

- **Buttons** use `accessibilityRole="button"` with descriptive labels and `accessibilityState` for disabled/busy states
- **Text inputs** have `accessibilityLabel` matching their visible label, with error state communicated via `accessibilityState`
- **Error messages** use `accessibilityLiveRegion="polite"` so screen readers announce validation errors as they appear
- **Product cards** have composite labels: `"{name}, ${price}. Tap to edit"` — screen readers get full context in a single utterance
- **Delete buttons** have explicit labels: `"Delete {product name}"` instead of the visual "✕" which is meaningless to assistive technology
- **Image picker** labels describe the action: `"Select a product photo"`, `"Change photo"`, `"Remove photo"`
- **Product counter** announces: `"3 of 5 products"` (or `"5 of 5 products. Product limit reached"` at capacity)
- **Loading/error states** have appropriate roles (`accessibilityLabel`, `accessibilityRole="alert"`)
- **Decorative elements** (emoji icons in placeholders) use `accessibilityElementsHidden` to avoid noise

---

## Performance

### FlatList Optimization
- `ProductCard` is wrapped in `React.memo` to skip re-renders when the specific product data hasn't changed
- `keyExtractor` uses stable product IDs
- `renderItem` is a stable `useCallback` reference
- Zustand selectors ensure the list screen only re-renders when `products` or `canAdd` changes — not on `isLoading` or `error` transitions

### Stable References
- `useProductForm` stores `onSuccess` in a `useRef` so `handleSubmit` doesn't need it in its dependency array — no re-creation on every render
- Form callbacks use `useCallback` with minimal dependencies

---

## Scalability Considerations

While this is a focused 5-product app, the architecture supports growth:

1. **Feature modules** — New features (categories, search, sorting) would get their own folders under `features/`
2. **API integration** — The storage service could be swapped for REST calls without touching the store or UI
3. **Theme system** — The centralized `theme/` module makes design system updates a single-file change
4. **Component library** — Common components are generic enough to reuse across features. Barrel exports (`components/common/index.ts`) keep imports clean.
5. **Navigation** — React Navigation's stack pattern easily extends to tabs, drawers, or deep linking

---

## What I Would Improve With More Time

1. **Animated transitions** — Add entrance/exit animations for product cards using `react-native-reanimated`
2. **Unit tests** — Test validation utils, store actions, and custom hooks with Jest
3. **E2E tests** — Detox tests for critical flows (add, edit, delete)
4. **Swipe-to-delete** — Replace the delete button with a swipe gesture for faster UX
5. **Search/filter** — Full-text search over product names as the catalog grows
6. **Image compression** — Optimize image file size before storage
7. **Dark mode** — Extend the theme system with automatic dark/light switching
8. **Haptic feedback** — Subtle haptics on button presses and deletions
9. **Export/share** — Allow users to share their product list as a formatted PDF
10. **Path aliases** — Configure `tsconfig` paths (e.g. `@/components`) to replace deep relative imports

---

## Alignment with YipOnline

This submission reflects the kind of engineering mindset that scales in a professional mobile team:

- **Clean, readable code** that new team members can understand quickly
- **Modular architecture** that supports parallel feature development
- **User-first UX** that handles edge cases gracefully
- **TypeScript everywhere** for confidence during refactoring
- **Small, focused files** that are easy to review in pull requests
- **Separation of concerns** that makes testing and maintenance straightforward

The app is intentionally scoped to do one thing well, rather than sprawling into unnecessary complexity — a principle that matters in any fast-moving product team.

---

*Built with React Native, Expo, TypeScript, Zustand, and React Navigation.*
