import React, { useEffect, useState } from 'react';

const CollegeFinderFrame = () => {
  const defaultUrl = import.meta.env.PROD 
    ? `${import.meta.env.BASE_URL}finder/` 
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '/');
  const baseApiUrl = import.meta.env.VITE_COLLEGE_FINDER_URL || defaultUrl;
  const [iframeUrl, setIframeUrl] = useState(baseApiUrl);

  useEffect(() => {
    const savedProfile = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('studentProfile') : null;
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        const params = new URLSearchParams();
        
        // Only append params if they exist to avoid 'undefined'
        if (profile.cgpa) params.append('cgpa', profile.cgpa);
        if (profile.budget) params.append('budget', profile.budget);
        if (profile.country) params.append('country', profile.country);
        if (profile.branch) params.append('branch', profile.branch);
        if (profile.intake) params.append('intake', profile.intake);
        if (profile.backlogs) params.append('backlogs', profile.backlogs);
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
      margin: '-40px', /* Negate the .page-content padding */
      backgroundColor: 'white' 
    }}>
      <iframe 
        src={iframeUrl} 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        title="College Finder ML Model"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default CollegeFinderFrame;
