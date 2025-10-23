# Project 3 Frontend - React Native Expo

A cross-platform mobile and web application built with React Native, Expo, and TypeScript.

## 🚀 Features

- ✅ **Cross-platform**: Runs on iOS, Android, and Web
- ✅ **TypeScript**: Type-safe development
- ✅ **Expo + Development Builds**: Full control with custom native code
- ✅ **EAS Build**: Professional build pipeline
- ✅ **Ready for API integration**: Set up for connecting to backend services

## 📱 Platforms Supported

### Standard Expo Go
- **Web Browser** (localhost:8081)
- **Android** (via Expo Go app)
- **iOS** (via Expo Go app)

### Development Builds (Custom Native Code Support)
- **Android** (via custom development APK)
- **iOS** (via custom development IPA)
- **Web** (same as standard)

## 🛠️ Quick Start

### Option 1: Use the PowerShell script (Recommended)
```powershell
.\start-dev.ps1
```

### Option 2: Manual commands
```powershell
# Add Node.js to PATH (if needed)
$env:PATH += ";C:\Program Files\nodejs\"

# Install dependencies (if not already done)
npm install

# Standard Expo Go Development
npm run web                    # For web browser
npm run android               # For Android (Expo Go)
npm run ios                  # For iOS (Expo Go)
npm start                    # For all platforms

# Development Build Mode
npm run start:dev-build      # Start dev build server
npm run build:android        # Build Android dev APK
npm run build:ios           # Build iOS dev IPA
npm run build:all           # Build all dev clients
```

## 📁 Project Structure

```
├── App.tsx              # Main application component
├── assets/              # Images, fonts, etc.
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── app.json            # Expo configuration
└── start-dev.ps1       # Development server starter script
```

## 🏗️ Development Builds vs Expo Go

### **Expo Go (Standard)**
- ✅ Quick setup, no builds needed
- ✅ Great for basic React Native features
- ❌ Limited to Expo SDK modules only
- ❌ Can't add custom native code

### **Development Builds (This Project)**
- ✅ Full control over native code
- ✅ Can install any React Native library
- ✅ Custom native modules support
- ❌ Requires building APK/IPA files
- ❌ Needs EAS account for cloud builds

### **Getting Started with Development Builds**

1. **For Web**: Use standard `npm run web` (no difference)

2. **For Mobile**: You have two options:
   - **Option A**: Use Expo Go for quick testing (limited features)
   - **Option B**: Build and install development client (full features)

3. **To build development clients**:
   ```powershell
   # First, login to EAS (one time setup)
   eas login
   
   # Build for your platform
   npm run build:android    # Creates installable APK
   npm run build:ios       # Creates installable IPA (macOS only)
   ```

4. **Install the built app** on your device and use `npm run start:dev-build`

## 🔗 API Integration

When you're ready to integrate your API:

1. Install HTTP client: `npm install axios` or use built-in `fetch`
2. Create an `api/` folder for your API calls
3. Add your API endpoints in the components

## 📖 Development Tips

- **Web Development**: Open http://localhost:8081 in your browser
- **Mobile Testing**: Download "Expo Go" app and scan the QR code
- **Hot Reload**: Changes are automatically reflected in the app
- **Debugging**: Press `j` in the terminal to open debugger

## 🏗️ Built With

- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9.2
- React 19.1.0

---

Happy coding! 🎉