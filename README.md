```markdown
# 🎯 Premium iOS Safari Extensions Collection

A unified monorepo workspace containing high-performance, native Safari Web Extensions designed to elevate the mobile and desktop browsing experience on both iOS and macOS. 

---

## 📂 Repository Workspace Structure

This repository is organized into independent Xcode project directories under the `Extensions` folder. Each directory represents a complete standalone extension target, including its native Swift app container and isolated Web Extension resources.

```text
iOS-Safari-Extensions/
├── .gitignore
├── README.md
└── Extensions/
    ├── DarkStrides/       <- Intelligent, image-aware Dark Mode engine
    └── GetSetClicks/      <- Immersive Manga reader & theater mode slider

```

---

## 🛠️ Detailed Extension Breakdown

### 1. 🌙 Dark Strides (`Extensions/DarkStrides`)

While most competent dark mode extensions on the iOS App Store lock their best features behind a paywall, **Dark Strides** is an entirely free custom alternative built to deliver a premium reading experience out of the box.

Instead of executing aggressive, global CSS color inversions that lead to muddy text, broken colors, and harsh high-contrast glitched elements, Dark Strides employs an intelligent parsing engine:

* **Smart Asset Preservation:** Automatically detects and isolates media containers (`<img>`, `<video>`, `<picture>`, and Canvas elements). It leaves graphics, avatars, thumbnails, and streaming viewports completely untouched so your media retains its original depth and color fidelity.
* **Low-Contrast Dynamic Styling:** Softens harsh, pure-white backgrounds into deeply relaxed, accessible dark tones while maintaining proper text readability and structural hierarchy.
* **Ultra-Lightweight Profile:** Runs directly at `document_start` to mitigate flashing bright white page-load states before the DOM finishes loading.

### 2. 📖 GetSetClicks (`Extensions/GetSetClicks`)

Engineered explicitly to rescue comic and manga lovers from clunky web interfaces, overlapping side banners, messy scrolling behaviors, and intrusive ad frameworks.

**GetSetClicks** aggregates data from messy web layouts and instantly transforms them into a clean, modern theater slideshow layout:

* **Dynamic Media Extraction Engine:** Sniffs out hidden asset strings across standard image elements and lazy-loading alternate attributes (`data-src`, `data-lazy`, `data-original`). It filters away tracker pixels and tiny banner icons by applying an automated sizing floor threshold (ignoring everything under 200px wide or high).
* **Isolated Shadow DOM Architecture:** Deploys the complete fullscreen theater view frame inside an encapsulated CSS Shadow DOM container. This sandbox guarantees that the original website's stylesheets can never alter, overflow, or break your reading interface controls.
* **Native Gestures & Keyboard Bindings:** Outfitted with horizontal swipe detection metrics for mobile touchscreens, smooth trackpad sliding inputs, and tactile hardware arrow key support (`Left / Right / Escape`) on laptops.

---

## 🚀 Local Developer Setup Guide

Because this repository contains the raw source projects, you can compile, modify, or side-load these extensions onto your development hardware directly using Xcode.

### Prerequisites

* A Mac running macOS 14.0 or later.
* **Xcode** installed via the Mac App Store.
* Safari enabled for local extension development (**Safari > Settings > Advanced > Check "Show features for web developers"**).

### Building and Running the Extensions

1. Clone this repository to your local machine and enter the parent folder workspace:
```bash
git clone <your-repository-url>
cd iOS-Safari-Extensions

```


2. Navigate to your extension target of choice inside the folder structure:
```bash
cd Extensions/GetSetClicks

```


3. Open the `.xcodeproj` file to launch the project ecosystem inside Xcode.
4. Connect your physical iOS test device or select an active **iOS Simulator** target from the Xcode destination control utility at the top window bar.
5. Click the **Run** button (or press **`Cmd + R`**) to build and execute the native application frame layer.
6. Open Safari on your target device, visit your extension controls layout preferences panel (**Settings > Safari > Extensions**), and turn your new extension **ON**.

```

```
