import React, { useEffect, useState } from 'react';

const ConsultancyFinderFrame = () => {
  const defaultUrl = import.meta.env.PROD 
    ? `${import.meta.env.BASE_URL}finder/consultancy.html` 
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '') + '/consultancy.html';
  const baseApiUrl = import.meta.env.VITE_CONSULTANCY_FINDER_URL || defaultUrl;
  const [iframeUrl, setIframeUrl] = useState(baseApiUrl);

  useEffect(() => {
    const savedProfile = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('studentProfile') : null;
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        const params = new URLSearchParams();
        if (profile.country) params.append('country', profile.country);
        if (profile.cgpa) params.append('cgpa', profile.cgpa);
        if (profile.branch) params.append('branch', profile.branch);
        if (profile.exam_type) params.append('exam_type', profile.exam_type);
        if (profile.exam_score) params.append('exam_score', profile.exam_score);

        const queryString = params.toString();
        if (queryString) {
          const sep = baseApiUrl.includes('?') ? '&' : '?';
          setIframeUrl(`${baseApiUrl}${sep}${queryString}`);
        }
      } catch (e) {
        console.error("Error parsing profile data", e);
      }
    }
  }, [baseApiUrl]);

  return (
    <div className="college-finder-frame fade-in" style={{ 
      height: 'calc(100vh - var(--header-height))', 
      margin: '-40px',
      backgroundColor: 'white' 
    }}>
      <iframe 
        src={iframeUrl} 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        title="Consultancy Match ML Model"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default ConsultancyFinderFrame;
