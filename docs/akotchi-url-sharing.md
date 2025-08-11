# Akotchi URL Sharing Feature

## Overview

The Akotchi game now supports sharing pets via URLs, making it easy for users to share their virtual pets with others without needing to scan QR codes or copy/paste JSON data.

## How It Works

### Sharing Your Akotchi

1. **Click the "Share" button** in the Akotchi game interface
2. **Choose your sharing method**:
   - **QR Code**: Scan with another device's camera
   - **Shareable URL**: Copy the generated URL to share via text, email, or social media
   - **Raw Export Data**: Copy the JSON data for advanced users

### Importing a Shared Akotchi

1. **Click the "Import" button** in the Akotchi game interface
2. **Choose your import method**:
   - **Paste URL or JSON**: Paste a shared URL or JSON data directly
   - **Scan QR Code**: Use your device's camera to scan a QR code

## Technical Implementation

### URL Structure

Shared Akotchi URLs follow this pattern:
```
https://yourdomain.com/games/akotchi?pet=<encoded-pet-data>
```

The `pet` parameter contains the base64-encoded JSON representation of the Akotchi's state.

### Automatic Import

When someone visits a shared Akotchi URL:
1. The game automatically detects the `pet` parameter
2. Decodes and validates the pet data
3. Imports the pet into the user's game
4. Clears the URL parameter to prevent re-importing
5. Shows a success notification

### Data Validation

All imported pet data is sanitized to ensure:
- Valid stat ranges (0-100)
- Required fields are present
- No malicious code execution
- Proper data types

## Benefits

- **Easy Sharing**: No need to scan QR codes or copy/paste JSON
- **Mobile Friendly**: URLs work on all devices and browsers
- **Social Media Ready**: Easy to share on platforms that support links
- **Backup Solution**: URLs serve as a backup of your pet's state
- **Cross-Platform**: Works between different devices and operating systems

## Use Cases

- **Sharing with Friends**: Send your Akotchi to friends via messaging apps
- **Social Media**: Post your Akotchi on social platforms
- **Backup**: Save your pet's state as a bookmark or note
- **Transfer**: Move your pet between devices easily
- **Showcase**: Display your well-cared-for pet to others

## Security Considerations

- Pet data is encoded in the URL, not stored on servers
- All data is validated and sanitized before import
- No personal information beyond the pet's game state is shared
- URLs can be bookmarked but don't persist after import

## Browser Compatibility

- Works in all modern browsers
- Requires JavaScript enabled
- Supports both desktop and mobile devices
- Compatible with React Router v7
