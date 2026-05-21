import { useState, useEffect } from 'react';

/**
 * Custom hook to detect the user's operating system and mobile status.
 * Combines modern navigator.userAgentData API with legacy navigator.platform/userAgent checks.
 */
export const useDetectOS = () => {
  const [os, setOS] = useState('unknown'); // 'mac' | 'windows' | 'linux' | 'mobile' | 'unknown'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detect = async () => {
      let detectedOS = 'unknown';
      let detectedMobile = false;

      // 1. Check navigator.userAgentData if available (modern browser standard)
      if (navigator.userAgentData) {
        try {
          const highEntropyValues = await navigator.userAgentData.getHighEntropyValues(['platform', 'mobile']);
          const platform = (highEntropyValues.platform || '').toLowerCase();
          detectedMobile = highEntropyValues.mobile || false;

          if (detectedMobile) {
            detectedOS = 'mobile';
          } else if (platform.includes('mac') || platform.includes('ios') || platform.includes('ipod') || platform.includes('ipad')) {
            detectedOS = 'mac';
          } else if (platform.includes('win')) {
            detectedOS = 'windows';
          } else if (platform.includes('linux')) {
            detectedOS = 'linux';
          } else if (platform.includes('android')) {
            detectedOS = 'mobile';
          }
        } catch (e) {
          // Fallback if promise fails or is blocked
        }
      }

      // 2. Fallback to standard User Agent and Platform check if unknown or not fully resolved
      if (detectedOS === 'unknown') {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const platform = window.navigator.platform?.toLowerCase() || '';

        // Mobile / Tablet detection
        const isMobileUA = /iphone|ipad|ipod|android|webos|blackberry|iemobile|opera mini/i.test(userAgent);
        // iPad Pro on Safari pretends to be macOS desktop but has multiple touch points
        const isIPadSafari = (platform.includes('mac') || platform === 'macintel') && navigator.maxTouchPoints > 1;

        detectedMobile = isMobileUA || isIPadSafari;

        if (detectedMobile) {
          detectedOS = 'mobile';
        } else if (/mac|ipad|iphone|ipod/.test(platform) || /macintosh|mac os x/.test(userAgent)) {
          detectedOS = 'mac';
        } else if (/win/.test(platform) || /windows/.test(userAgent)) {
          detectedOS = 'windows';
        } else if (/linux/.test(platform) || /linux/.test(userAgent)) {
          detectedOS = 'linux';
        }
      }

      setOS(detectedOS);
      setIsMobile(detectedMobile);
    };

    detect();
  }, []);

  return {
    os,
    isMobile,
    osName: os === 'mac' ? 'macOS' : os === 'windows' ? 'Windows' : os === 'linux' ? 'Linux' : os === 'mobile' ? 'Mobile' : 'Unknown'
  };
};
