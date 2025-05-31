'use client';

import { useEffect, useState } from 'react';
import { env } from '@/lib/env';

export function EnvironmentDebug() {
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Only show in development or if there's an auth error
    if (process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true')) {
      setShowDebug(true);
    }
  }, []);

  if (!showDebug) return null;

  const envVars = {
    'Supabase URL': env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set',
    'Supabase Anon Key': env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set',
    'API URL': env.NEXT_PUBLIC_API_URL || '❌ Not set',
    'Environment': env.NODE_ENV,
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Environment Debug</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1 text-sm">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-400">{key}:</span>
            <span className={value.includes('❌') ? 'text-red-400' : 'text-green-400'}>
              {value}
            </span>
          </div>
        ))}
      </div>
      {isDemo && (
        <div className="mt-3 p-2 bg-red-600 rounded text-xs">
          <strong>⚠️ Authentication is disabled!</strong>
          <br />
          Add NEXT_PUBLIC_DEMO_MODE=false to enable auth.
        </div>
      )}
    </div>
  );
}
