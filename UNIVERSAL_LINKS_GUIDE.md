# Universal Links Implementation Guide

A complete guide to implementing universal links for iOS apps, based on real-world experience and best practices.

## Table of Contents
1. [Overview](#overview)
2. [Website Setup](#website-setup)
3. [iOS App Configuration](#ios-app-configuration)
4. [Testing & Debugging](#testing--debugging)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Best Practices](#best-practices)
7. [Fallback Strategies](#fallback-strategies)

## Overview

Universal Links allow iOS users to tap a link to your website and get seamlessly redirected to your installed app without going through Safari. If your app isn't installed, the link opens your website in Safari.

### Benefits
- **Unique**: Can't be claimed by other apps
- **Secure**: Only your app can handle your domain's links
- **Flexible**: Work even when app isn't installed
- **Simple**: One URL works for both website and app
- **Private**: No need to know if app is installed

## Website Setup

### Step 1: Create the AASA File

Create a file named `apple-app-site-association` (no extension) with the following structure:

```json
{
    "applinks": {
        "apps": [],
        "details": [
            {
                "appID": "TEAM_ID.BUNDLE_ID",
                "paths": [ "/shared/*", "/product/*", "*" ]
            }
        ]
    }
}
```

**Important Details:**
- `apps` array must be empty
- `appID` format: `TEAM_ID.BUNDLE_ID` (e.g., `2GCNV9PWWJ.com.appdevmasters.BookAI`)
- `paths` array specifies which URLs your app handles
- Use `*` for wildcards, `?` for single characters
- Use `"NOT /path/*"` to exclude paths

### Step 2: Host the AASA File

Upload the file to one of these locations:
- `https://yourdomain.com/.well-known/apple-app-site-association`
- `https://yourdomain.com/apple-app-site-association`

**Requirements:**
- Must be served over HTTPS
- No redirects allowed
- Must return HTTP 200 status
- Recommended Content-Type: `application/json`
- File size limit: 128KB

### Step 3: GitHub Pages Configuration

If using GitHub Pages, add these files:

**`.nojekyll`** (empty file):
```
```

**`_config.yml`**:
```yaml
# GitHub Pages configuration for universal links
include: [".well-known"]
```

### Step 4: Create Fallback Pages

Create fallback pages for when the app isn't installed:

**`404.html`** - Custom 404 page:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Required</title>
    <meta name="apple-itunes-app" content="app-id=YOUR_APP_STORE_ID">
</head>
<body>
    <div class="container">
        <h1>App Required</h1>
        <p>This content requires our mobile app.</p>
        <a href="https://apps.apple.com/app/YOUR_APP_ID">Download App</a>
    </div>
    <script>
        // Auto-prompt on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            setTimeout(() => {
                if (confirm("Download the app to view this content?")) {
                    window.location.href = "https://apps.apple.com/app/YOUR_APP_ID";
                }
            }, 2000);
        }
    </script>
</body>
</html>
```

**`shared/index.html`** - Specific path fallback:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shared Content</title>
    <meta name="apple-itunes-app" content="app-id=YOUR_APP_STORE_ID">
</head>
<body>
    <h1>Shared Content</h1>
    <p>This shared content is best viewed in our app.</p>
    <a href="https://apps.apple.com/app/YOUR_APP_ID">Download App</a>
</body>
</html>
```

## iOS App Configuration

### Step 1: Add Associated Domains Capability

In Xcode:
1. Select your target
2. Go to "Signing & Capabilities"
3. Add "Associated Domains" capability
4. Add domains with `applinks:` prefix:
   - `applinks:yourdomain.com`
   - `applinks:www.yourdomain.com` (if applicable)

### Step 2: Handle Universal Links in Code

**AppDelegate.swift**:
```swift
func application(_ application: UIApplication, 
                continue userActivity: NSUserActivity, 
                restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    
    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
          let url = userActivity.webpageURL else {
        return false
    }
    
    // Handle the universal link
    return handleUniversalLink(url: url)
}

private func handleUniversalLink(url: URL) -> Bool {
    // Parse the URL and route to appropriate screen
    let path = url.path
    
    if path.hasPrefix("/shared/") {
        let components = path.components(separatedBy: "/")
        if components.count > 2 {
            let sharedId = components[2]
            // Navigate to shared content screen
            navigateToSharedContent(id: sharedId)
            return true
        }
    }
    
    // Handle other paths...
    return false
}
```

**SwiftUI App**:
```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    handleUniversalLink(url: url)
                }
        }
    }
    
    private func handleUniversalLink(url: URL) {
        // Handle the URL
    }
}
```

### Step 3: App ID Configuration

Ensure your app ID matches exactly:
- **Team ID**: Found in Apple Developer Account
- **Bundle ID**: Found in Xcode project settings
- **Format**: `TEAM_ID.BUNDLE_ID`

## Testing & Debugging

### Step 1: Validate AASA File

Use online validators:
- [Branch.io AASA Validator](https://branch.io/resources/aasa-validator/)
- [GetUniversal.link](https://getuniversal.link/)
- [APNsPush AASA Validator](https://apnspush.com/aasa-validator/)

### Step 2: Test File Accessibility

```bash
# Test if file is accessible
curl -v https://yourdomain.com/.well-known/apple-app-site-association

# Validate JSON format
curl -s https://yourdomain.com/.well-known/apple-app-site-association | python3 -m json.tool
```

### Step 3: Developer Mode Testing

For development/testing, add `?mode=developer` to your associated domains:
- `applinks:yourdomain.com?mode=developer`

This bypasses Apple's CDN and fetches directly from your server.

**⚠️ Important**: Remove `?mode=developer` before App Store submission!

### Step 4: Device Testing

1. **Install app** on device
2. **Send universal link** via Messages/Mail/Notes
3. **Tap the link** - should open app
4. **Uninstall app**
5. **Tap same link** - should open website fallback

### Step 5: Debug Logs

Check device logs for AASA-related errors:
```bash
# Using Xcode Console or device logs
# Look for keywords: "AASA", "apple-app-site-association", "universal link"
```

## Common Issues & Solutions

### Issue 1: AASA File Returns 404
**Solution**: 
- Check file location and name (no extension)
- Verify GitHub Pages configuration (`.nojekyll`, `_config.yml`)
- Ensure no redirects

### Issue 2: Wrong Content-Type
**Problem**: File served as `application/octet-stream` instead of `application/json`
**Solution**: 
- GitHub Pages limitation - usually still works
- For other servers, configure proper MIME type
- Use `.htaccess` for Apache servers

### Issue 3: App ID Mismatch
**Solution**:
- Verify Team ID in Apple Developer Account
- Check Bundle ID in Xcode
- Ensure format: `TEAM_ID.BUNDLE_ID`

### Issue 4: Links Open in Safari Instead of App
**Causes**:
- AASA file not downloaded by iOS yet
- App not handling the URL properly
- User previously chose to open in Safari

**Solutions**:
- Reinstall app to force AASA re-download
- Check URL handling code in app
- Long-press link and choose "Open in [App Name]"

### Issue 5: No Fallback for Non-Installed App
**Solution**:
- Create proper fallback pages (`404.html`, specific path pages)
- Add Smart App Banner meta tag
- Implement auto-redirect logic

## Best Practices

### 1. AASA File Design
- Keep paths list short and use wildcards
- Order paths by priority (most specific first)
- Use `NOT` prefix to exclude sensitive paths
- Validate JSON format before deployment

### 2. URL Structure
- Design URLs that work for both app and web
- Include necessary parameters in the URL
- Make URLs human-readable when possible

### 3. Fallback Strategy
- Always provide web fallbacks
- Use Smart App Banner on iOS
- Implement graceful degradation

### 4. Testing
- Test on real devices, not just simulator
- Test both scenarios: app installed/not installed
- Validate AASA file with multiple tools
- Test after app updates

### 5. Analytics
- Track universal link usage
- Monitor fallback page visits
- Measure app install attribution

## Fallback Strategies

### Smart App Banner
Add to your web pages:
```html
<meta name="apple-itunes-app" content="app-id=YOUR_APP_STORE_ID">
```

### JavaScript Detection
```javascript
// Detect if link should open app
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const hasApp = localStorage.getItem('hasApp') === 'true';

if (isMobile && !hasApp) {
    // Show app download prompt
    showAppDownloadBanner();
}
```

### Progressive Enhancement
1. Start with working website
2. Add universal link support
3. Enhance with app-specific features
4. Gracefully degrade when app unavailable

## Example File Structure

```
your-website/
├── .well-known/
│   ├── apple-app-site-association  (no extension)
│   └── .htaccess                   (optional, for Apache)
├── shared/
│   └── index.html                  (fallback for /shared/ paths)
├── 404.html                        (custom 404 page)
├── index.html                      (main website)
├── _config.yml                     (GitHub Pages config)
├── .nojekyll                       (GitHub Pages config)
└── .htaccess                       (optional, for Apache)
```

## Checklist

### Website Setup
- [ ] AASA file created with correct format
- [ ] File hosted at correct location
- [ ] File accessible via HTTPS with 200 status
- [ ] JSON format validated
- [ ] GitHub Pages configured (if applicable)
- [ ] Fallback pages created
- [ ] Smart App Banner added

### iOS App Setup
- [ ] Associated Domains capability added
- [ ] Correct domains added with `applinks:` prefix
- [ ] Universal link handling implemented
- [ ] App ID matches AASA file exactly
- [ ] URL parsing and routing implemented

### Testing
- [ ] AASA file validated with online tools
- [ ] File accessibility tested with curl
- [ ] App opens when installed
- [ ] Website fallback works when app not installed
- [ ] Tested on real devices
- [ ] Developer mode tested (and removed for production)

## Conclusion

Universal Links provide a seamless user experience when implemented correctly. The key is having both proper website configuration and robust iOS app handling, with graceful fallbacks for users who don't have the app installed.

Remember: Universal Links are cached by iOS, so changes may take time to propagate. Use developer mode for testing, and always provide web fallbacks for the best user experience.

---

**Need Help?**
- Check Apple's [Official Documentation](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- Use online AASA validators
- Test on real devices
- Monitor device logs for errors 