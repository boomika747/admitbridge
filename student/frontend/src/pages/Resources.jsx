import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Video, Link as LinkIcon, Download, Search, Filter } from 'lucide-react';
import './Resources.css';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};


const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setError(null);
        const response = await authFetch(`${import.meta.env.VITE_API_URL}/resources`); // Changed to generic mock or actual endpoint
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setResources(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch resources", err);
        // Fallback data loaded gracefully
      }
      
      // Fallback Data
      setResources([
        {
          id: '1',
          category: 'SOP & Essays',
          title: 'Winning SOP Template for MS in CS',
          description: 'A comprehensive template and breakdown of an SOP that secured admits to Stanford and MIT.',
          type: 'doc',
          readTime: '10 min read',
          url: 'https://docs.google.com'
        },
        {
          id: '2',
          category: 'Visa Prep',
          title: 'F-1 Visa Interview Guide 2026',
          description: 'Top 50 most frequently asked questions during the US F-1 Visa interview and how to answer them.',
          type: 'pdf',
          readTime: '15 min read',
          url: 'https://example.com/visa-guide.pdf'
        },
        {
          id: '3',
          category: 'Test Prep',
          title: 'GRE 320+ Study Plan',
          description: 'A structured 60-day study plan to boost your GRE score, focusing on quant and verbal strategies.',
          type: 'doc',
          readTime: '8 min read',
          url: 'https://docs.google.com'
        },
        {
          id: '4',
          category: 'Finances',
          title: 'Education Loan Masterclass',
          description: 'Understand the difference between collateral and non-collateral loans, interest rates, and processing fees.',
          type: 'video',
          readTime: '25 min video',
          url: 'https://youtube.com'
        },
        {
          id: '5',
          category: 'Universities',
          title: 'Top Public Universities in Germany',
          description: 'A curated list of TU9 universities offering free education for international masters students.',
          type: 'link',
          readTime: '5 min read',
          url: 'https://www.daad.de/en/'
        }
      ]);
      setLoading(false);
    };

    fetchResources();
  }, []);

  const categories = ['All', ...new Set(resources.map(r => r.category))];

  const filteredResources = resources.filter(res => {
    const matchesCategory = activeCategory === 'All' || res.category === activeCategory;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText size={24} color="var(--primary-color)" />;
      case 'doc': return <BookOpen size={24} color="var(--primary-color)" />;
      case 'video': return <Video size={24} color="var(--primary-color)" />;
      case 'link': return <LinkIcon size={24} color="var(--primary-color)" />;
      default: return <FileText size={24} color="var(--primary-color)" />;
    }
  };

  return (
    <div className="resources-page fade-in">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="page-header-icon" style={{ backgroundColor: 'var(--primary-color)' }}>
          <BookOpen size={24} color="white" />
        </div>
        <div className="page-header-text">
          <h1>Student Resources</h1>
          <p>Guides, templates, and materials to supercharge your admission journey.</p>
        </div>
      </div>
      
      {error && <div className="error-alert">{error}</div>}

      <div className="resources-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="category-filters">
          <Filter size={18} color="var(--text-light)" style={{ marginRight: '8px' }} />
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading premium resources...</p>
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.length > 0 ? (
            filteredResources.map((res, index) => (
              <div key={res.id} className="resource-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="resource-icon-wrapper">
                  {getIcon(res.type)}
                </div>
                <div className="resource-content">
                  <span className="resource-category">{res.category}</span>
                  <h3 className="resource-title">{res.title}</h3>
                  <p className="resource-description">{res.description}</p>
                </div>
                <div className="resource-footer">
                  <span className="resource-time">{res.readTime}</span>
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => {
                      if (res.url) {
                        window.open(res.url, '_blank');
                      } else {
                        alert('This resource is currently unavailable.');
                      }
                    }}
                  >
                    {res.type === 'video' ? 'Watch Now' : res.type === 'link' ? 'Visit Link' : 'Download'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <BookOpen size={48} color="var(--text-light)" opacity={0.5} />
              <h3>No resources found</h3>
              <p>Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;
