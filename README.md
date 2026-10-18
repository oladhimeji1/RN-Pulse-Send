# Pulse — send/request money demo (Expo + Reanimated)

Pure front-end demo: all data is mocked in memory (no backend).

## Run
```bash
npm install
npx expo start        # press i / a, or scan with Expo Go
```
If a native-module mismatch shows up in Expo Go, use a dev build: `npx expo run:ios` / `npx expo run:android`.

## Demo tips (for recording)
- **Long-press the avatar** on Home to reset balance + activity.
- **Add $250** tops up and the balance counts up.
- Send flow: Send → pick person → amount → Review → slide to send → Done → Undo toast (6s).
- Toggle **Request** to see the request flow (adds a "Pending" row, no balance change).

## Structure
- `src/app/` — routes (`index` = Home, `send` = Send/Request)
- `src/components/` — ConfirmSheet, SlideToConfirm, ProgressRing, CheckBadge, Dots, Keypad, AmountDisplay, CardCarousel, TxRow, UndoToast
- `src/lib/` — theme, mock data, local store, formatting, haptics

## Tuning the motion
Durations/springs live next to each component (e.g. `ProgressRing` 1200ms rotation, `ConfirmSheet` 340ms slide-in, `AmountDisplay` pop spring, send delay 2000ms in `src/app/send.tsx`).
