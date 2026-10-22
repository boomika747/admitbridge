import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, DollarSign, Award, ChevronRight, GraduationCap, Compass } from 'lucide-react';
import './CollegeSuggestions.css';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};


const campusImages = [
  "1541339907198-e08756dedf3f", "1521587760476-6c12a4b040da", "1498243691581-b145c3f54a5a", "1532012197267-da84d127e765",
  "1503676260728-1c00da094a0b", "1523240795612-9a054b0db644", "1517486808906-6ca8b3f04846", "1522202176988-66273c2fd55f",
  "1509062522246-3755977927d7", "1580582932707-520aed937b7b", "1529390079861-591de354faf5", "1491841550275-ad7854e35ca6",
  "1501504905252-473c47e087f8", "1516321497487-e288fb19713f", "1544531586-fde5298cdd40", "1524178232363-1fb2b075b655"
];

const CollegeSuggestions = () => {
  const [allColleges, setAllColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All Countries');
  const [budgetFilter, setBudgetFilter] = useState('Any Budget');

  const handleVisit = (url, name, country) => {
    if (url && url !== "N/A" && url.trim() !== "") {
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      window.open(finalUrl, '_blank');
    } else {
      // Automatic fallback if the dataset lacks a link
      const searchQuery = encodeURIComponent(name + ' ' + (country === 'US' ? 'USA' : country) + ' official website');
      window.open(`https://duckduckgo.com/?q=!ducky+${searchQuery}`, '_blank');
    }
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setError(null);
        const response = await authFetch(`${import.meta.env.BASE_URL}real_universities_list.json`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        
        // Enhance data with placeholder UI fields
        const enhanced = data.map(uni => ({
          name: uni.university_name,
          country: uni.country,
          feeValue: uni.fee,
          fees: `$${uni.fee.toLocaleString()}/year`,
          tier: uni.tier === 1 ? 'Tier 1' : uni.tier === 2 ? 'Tier 2' : 'Tier 3',
          link: uni.university_link,
          intake: 'Fall / Spring',
          scholarship: uni.tier === 1 ? 'Up to 50%' : 'Merit Based'
        }));
        
        // Shuffle and limit to 50 for performance on initial load
        const shuffled = enhanced.sort(() => 0.5 - Math.random());
        setAllColleges(shuffled);
        setFilteredColleges(shuffled.slice(0, 50));
      } catch (err) {
        console.error("Failed to load universities:", err);
        setError("Failed to load universities dataset. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUniversities();
  }, []);

  useEffect(() => {
    let result = allColleges;

    if (searchQuery) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (countryFilter !== 'All Countries') {
      // JSON has 'US' and 'UK'
      const matchCountry = countryFilter === 'USA' ? 'US' : countryFilter;
      result = result.filter(c => c.country === matchCountry);
    }

    if (budgetFilter !== 'Any Budget') {
      if (budgetFilter === '< $20k') {
        result = result.filter(c => c.feeValue < 20000);
      } else if (budgetFilter === '$20k - $40k') {
        result = result.filter(c => c.feeValue >= 20000 && c.feeValue <= 40000);
      } else if (budgetFilter === '> $40k') {
        result = result.filter(c => c.feeValue > 40000);
      }
    }

    // Slice to avoid rendering thousands of cards
    setFilteredColleges(result.slice(0, 50));
  }, [searchQuery, countryFilter, budgetFilter, allColleges]);

  return (
    <div className="college-suggestions fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ backgroundColor: 'var(--primary-color)' }}>
          <GraduationCap size={24} color="white" />
        </div>
        <div className="page-header-text">
          <h1>University Directory</h1>
          <p>Explore our comprehensive database of over 6,000 global universities.</p>
        </div>
      </div>
      
      {error && <div className="error-alert">{error}</div>}

      <div className="filters-bar card">
        <div className="search-input">
          <Search size={18} className="icon" />
          <input 
            type="text" 
            placeholder="Search by university name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-selects">
          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            <option>All Countries</option>
            <option>USA</option>
            <option>UK</option>
            <option>Germany</option>
          </select>
          <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
            <option>Any Budget</option>
            <option>&lt; $20k</option>
            <option>$20k - $40k</option>
            <option>&gt; $40k</option>
          </select>
          <button className="btn-secondary filter-btn">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="college-grid">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-light)' }}>
            Loading universities dataset...
          </div>
        ) : filteredColleges.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-light)' }}>
            No universities found matching your criteria.
          </div>
        ) : (
          filteredColleges.map((college, index) => (
            <div className="card college-card" key={index}>
              <div className="college-image" style={{ backgroundImage: `url(https://images.unsplash.com/photo-${campusImages[index % campusImages.length]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)` }}>
                <div className={`tier-badge ${college.tier.replace(' ', '-').toLowerCase()}`}>{college.tier}</div>
              </div>
              <div className="college-info">
                <h3>{college.name}</h3>
                <div className="info-row">
                  <MapPin size={16} /> <span>{college.country === 'US' ? 'USA' : college.country}</span>
                </div>
                <div className="info-row">
                  <DollarSign size={16} /> <span>{college.fees}</span>
                </div>
                <div className="info-tags">
                  <span className="tag intake-tag">{college.intake}</span>
                  <span className="tag scholarship-tag"><Award size={14} /> {college.scholarship}</span>
                </div>
                <button 
                  className="btn-primary apply-btn" 
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '6px',
                    padding: '8px 14px',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => handleVisit(college.link, college.name, college.country)}
                >
                  <Compass size={14} /> Visit Website
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollegeSuggestions;
