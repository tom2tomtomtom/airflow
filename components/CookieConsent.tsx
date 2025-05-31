import { useState, useEffect } from 'react';
import { analytics } from '@/lib/analytics/mixpanel';

const COOKIE_CONSENT_KEY = 'airwave_cookie_consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export default function CookieConsent(: { req: NextApiRequest; res: NextApiResponse }) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: true,
    timestamp: new Date().toISOString(),
  });
  
  useEffect(() => {
    // Check if consent has been given
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (!savedConsent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Apply saved preferences
      const savedPreferences = JSON.parse(savedConsent) as CookiePreferences;
      applyPreferences(savedPreferences);
    }
  }, []);
  
  const applyPreferences = (prefs: CookiePreferences) => {
    // Apply analytics preference
    if (!prefs.analytics) {
      // Disable analytics
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        (window as any).mixpanel.opt_out_tracking();
      }
    }
    
    // Apply marketing preference
    if (!prefs.marketing) {
      // Disable marketing cookies
      // Add logic for marketing cookie providers
    }
  };
  
  const saveConsent = (acceptAll: boolean = false) => {
    const newPreferences: CookiePreferences = acceptAll
      ? {
          necessary: true,
          analytics: true,
          marketing: true,
          timestamp: new Date().toISOString(),
        }
      : preferences;
    
    // Save to localStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPreferences));
    
    // Apply preferences
    applyPreferences(newPreferences);
    
    // Track consent - cast to any to bypass strict type checking
    analytics.track('Cookie Consent', {
      consent_type: acceptAll ? 'accept_all' : 'custom',
      analytics_enabled: newPreferences.analytics,
      marketing_enabled: newPreferences.marketing,
    } as any);
    
    // Hide banner
    setShowBanner(false);
    setShowDetails(false);
  };
  
  if (!showBanner) return null;
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                🍪 Cookie Preferences
              </h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-indigo-600 hover:text-indigo-500 underline"
                >
                  {showDetails ? 'Hide' : 'Learn more'}
                </button>
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => saveConsent(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Save Preferences
              </button>
              <button
                onClick={() => saveConsent(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Accept All
              </button>
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-6 border-t pt-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                Manage Cookie Preferences
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="necessary"
                    checked={preferences.necessary}
                    disabled
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="necessary" className="ml-3">
                    <span className="font-medium text-gray-900">Necessary Cookies</span>
                    <p className="text-sm text-gray-600">
                      Essential for the website to function properly. These cannot be disabled.
                    </p>
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="analytics"
                    checked={preferences.analytics}
                    onChange={(e: React.ChangeEvent<HTMLElement>) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="analytics" className="ml-3">
                    <span className="font-medium text-gray-900">Analytics Cookies</span>
                    <p className="text-sm text-gray-600">
                      Help us understand how visitors interact with our website to improve user experience.
                    </p>
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={preferences.marketing}
                    onChange={(e: React.ChangeEvent<HTMLElement>) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="marketing" className="ml-3">
                    <span className="font-medium text-gray-900">Marketing Cookies</span>
                    <p className="text-sm text-gray-600">
                      Used to track visitors across websites to display relevant advertisements.
                    </p>
                  </label>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500 underline"
                >
                  View our Privacy Policy
                </a>
                {' '}for more information about how we handle your data.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
