# MacOS Emulator (React)

A web-based emulator that simulates the look and feel of macOS with a desktop, menu bar, dock, launchpad, and demo apps (Finder, Notes, Calculator).

## Run

- npm start
- npm test
- npm run build

Open http://localhost:3000

## Features

- Desktop with wallpaper and icons
- Menu bar with clock and launchpad toggle
- Dock with app launching and indicators
- Window manager (drag, resize, minimize, maximize, close)
- Launchpad overlay listing all apps
- Finder, Notes, Calculator demo apps
- Modern CSS tokens and glassmorphism

## Shortcuts

- Cmd/Ctrl + Space: Toggle Launchpad

## Structure

- src/macos/context/EmulatorContext.js (global state and actions)
- src/macos/layout/* (MenuBar, Desktop, Dock, Launchpad, Wallpaper, DesktopIcon)
- src/macos/windowing/* (WindowManager, Window)
- src/macos/apps/* (Finder, Notes, Calculator)

