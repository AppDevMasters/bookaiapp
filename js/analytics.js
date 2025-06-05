// BookAI Analytics for Universal Links and Share Tracking
// Replace with your actual analytics service (Google Analytics, Mixpanel, etc.)

class BookAIAnalytics {
    constructor() {
        this.isEnabled = true; // Set to false to disable analytics
        this.debug = true; // Set to false in production
    }

    // Track when a share page is viewed
    trackSharePageView(shareId, source = 'web') {
        if (!this.isEnabled) return;
        
        const event = {
            event_name: 'share_page_view',
            share_id: shareId,
            source: source,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href
        };
        
        this._sendEvent(event);
        
        if (this.debug) {
            console.log('📊 Share page viewed:', event);
        }
    }

    // Track when user clicks download button from share
    trackDownloadClick(shareId, source = 'share') {
        if (!this.isEnabled) return;
        
        const event = {
            event_name: 'download_click',
            share_id: shareId,
            source: source,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this._sendEvent(event);
        
        if (this.debug) {
            console.log('📊 Download clicked:', event);
        }
    }

    // Track share conversion (when user actually downloads app)
    trackShareConversion(shareId) {
        if (!this.isEnabled) return;
        
        const event = {
            event_name: 'share_conversion',
            share_id: shareId,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };
        
        this._sendEvent(event);
        
        if (this.debug) {
            console.log('📊 Share converted:', event);
        }
    }

    // Track 404 errors for shared content
    trackShare404(shareId) {
        if (!this.isEnabled) return;
        
        const event = {
            event_name: 'share_404',
            share_id: shareId,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this._sendEvent(event);
        
        if (this.debug) {
            console.log('📊 Share 404:', event);
        }
    }

    // Private method to send events to your analytics service
    _sendEvent(event) {
        // Example for Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', event.event_name, {
                custom_parameter_share_id: event.share_id,
                custom_parameter_source: event.source
            });
        }
        
        // Example for Mixpanel
        if (typeof mixpanel !== 'undefined') {
            mixpanel.track(event.event_name, event);
        }
        
        // Example for custom API endpoint
        if (this.isEnabled && !this.debug) {
            fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            }).catch(err => {
                console.warn('Analytics request failed:', err);
            });
        }
    }

    // Utility method to extract shareId from current URL
    static getShareIdFromUrl() {
        const path = window.location.pathname;
        const pathParts = path.split('/');
        const sharedIndex = pathParts.indexOf('shared');
        
        if (sharedIndex !== -1 && sharedIndex + 1 < pathParts.length) {
            const shareId = pathParts[sharedIndex + 1];
            return shareId && shareId !== '' ? shareId : null;
        }
        
        return null;
    }

    // Utility method to detect mobile devices
    static isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

// Initialize analytics
const analytics = new BookAIAnalytics();

// Auto-track share page views
document.addEventListener('DOMContentLoaded', () => {
    const shareId = BookAIAnalytics.getShareIdFromUrl();
    if (shareId) {
        analytics.trackSharePageView(shareId);
    }
});

// Export for use in other scripts
window.BookAIAnalytics = BookAIAnalytics;
window.analytics = analytics; 