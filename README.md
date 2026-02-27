# trackliters

A minimal GNOME Shell extension that lives in your top panel and lets you track how much water you drink throughout the day.

https://github.com/user-attachments/assets/eec4e96e-a712-423f-ba1e-303a5f308f40

## Controls

All controls are performed by clicking the panel indicator.

| Action               | Result              |
| -------------------- | ------------------- |
| Left click           | +0.5 L              |
| Right click          | -0.5 L              |
| Left click and hold  | Reset to 0 L        |
| Right click and hold | Toggle the 💧 emoji |

## Persistence

Your current liter count and emoji state are saved automatically every time it changes, and persist across sessions.

## Installation

### From GNOME Extensions

Visit [extensions.gnome.org](https://extensions.gnome.org) and search for **trackliters**, or use the direct link in the repository description.

### From source

**Requirements:** Node.js, [pnpm](https://pnpm.io), `glib-compile-schemas`

```bash
git clone https://github.com/Mosazghi/track-liters
cd track-liters
pnpm install
make install          # builds, packages, and installs the extension
```

Then enable the extension:

```bash
gnome-extensions enable mosazghi@trackliters.com
```

Or toggle it via **GNOME Extensions** app / **Extensions Manager**.

### Supported GNOME Shell versions

46+
