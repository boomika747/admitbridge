import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Users, ShieldCheck, ChevronRight, Globe, Star, ArrowRight, PlayCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import Chatbot from '../components/Chatbot';
import './Home.css';

// Simple Counter Hook for dynamic numbers
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTime = null;
          const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, countRef };
};

const CounterText = ({ end, suffix = '' }) => {
  const { count, countRef } = useCounter(end);
  return <span ref={countRef}>{count}{suffix}</span>;
};

const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible-anim');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);
};

const Home = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = ['explore', 'resources', 'events'];
      let current = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 250) {
            current = section;
          }
        }
      }
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className={`home-navbar ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="home-nav-container">
          <div className="home-logo">
            <img src={logo} alt="AdmitBridge Logo" />
          </div>
          <div className="home-nav-links">
            <a href="#explore" className={activeSection === 'explore' ? 'active-link' : ''} onClick={() => setActiveSection('explore')}>Explore</a>
            <a href="#resources" className={activeSection === 'resources' ? 'active-link' : ''} onClick={() => setActiveSection('resources')}>Resources</a>
            <a onClick={() => navigate('/login', { state: { redirectTo: '/unimatch' } })} style={{cursor: 'pointer'}}>College Finder</a>
            <a href="#events" className={activeSection === 'events' ? 'active-link' : ''} onClick={() => setActiveSection('events')}>Events</a>
          </div>
          <div className="home-nav-actions">
            <button className="icon-btn search-btn"><Search size={20} /></button>
            <button className="btn-primary login-btn" onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content fade-in">
          <h1 className="hero-title">Get Guided By India's Best<br />Study Abroad Consultants</h1>
          <p className="hero-description">
            <CounterText end={15000} suffix="+" /> students admitted at top universities in the USA, UK, Canada,<br />
            Germany & Beyond
          </p>
          
          <div className="hero-actions" style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }} onClick={() => navigate('/register')}>Start Your Journey</button>
          </div>
          
          <div className="hero-trust">
            <div className="trust-avatars">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Student" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Student" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Student" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Student" />
            </div>
            <div className="trust-text">
              <span className="trust-highlight">Trusted by 1 million+ aspirants</span>
              <span className="trust-sub">over 10+ years of service</span>
            </div>
          </div>
        </div>
      </section>



      {/* Track Record & Graphs Section */}
      <section className="home-track-record" id="explore">
        <div className="section-container">
          <div className="section-header text-center animate-on-scroll slide-up">
            <h4 style={{color: 'var(--primary-color)', marginBottom: '8px', fontWeight: '600'}}>We Don't Just Guide Students - We Get Them Admitted</h4>
            <h2 style={{fontSize: '2.5rem', color: 'var(--text-dark)'}}>Explore Our Proven Track Record</h2>
            <p style={{marginTop: '16px', fontSize: '1.1rem', color: 'var(--text-light)', maxWidth: '800px', margin: '16px auto 0'}}>
              We provide an end-to-end roadmap that guarantees admission into the world's most prestigious universities. Explore our unmatched placement rates and discover how our data-driven approach dramatically improves your chances of acceptance.
            </p>
          </div>
          
          <div className="track-grid">
            <div className="track-card-image animate-on-scroll slide-left">
              <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Student admitted to NYU" />
              <div className="track-overlay">
                <h3>Soham Vadje</h3>
                <p>Accepted to NYU</p>
                <div className="track-stats-overlay">
                  <h4>15,000+</h4>
                  <span>Students placed at leading universities</span>
                </div>
              </div>
            </div>
            
            <div className="track-middle-stats animate-on-scroll slide-up">
              <div className="track-stat-box">
                <h2><CounterText end={98} suffix="%" /></h2>
                <p>Visa Success Rate<br/>Nearly perfect approval<br/>across countries</p>
              </div>
              <div className="track-stat-box">
                <h2>$<CounterText end={35} suffix="m+" /></h2>
                <p>In Scholarships - Making<br/>global education more<br/>affordable for students</p>
              </div>
            </div>
            
            <div className="track-graphs animate-on-scroll slide-right">
              <h3 style={{color: '#E06C3E', marginBottom: '24px', textAlign: 'center'}}>Compare Acceptance Rates Across Colleges</h3>
              
              <div className="graph-row">
                <span className="graph-label-left">11%</span>
                <div className="graph-bar-container"><div className="graph-bar bg-grey" style={{width: '20%'}}></div><div className="graph-bar bg-orange" style={{width: '50%'}}></div></div>
                <span className="graph-label-center">CMU</span>
                <span className="graph-label-right" style={{color: '#E06C3E'}}>32%</span>
              </div>
              
              <div className="graph-row">
                <span className="graph-label-left">16%</span>
                <div className="graph-bar-container"><div className="graph-bar bg-grey" style={{width: '30%'}}></div><div className="graph-bar bg-orange" style={{width: '45%'}}></div></div>
                <span className="graph-label-center">Cornell</span>
                <span className="graph-label-right" style={{color: '#E06C3E'}}>27%</span>
              </div>
              
              <div className="graph-row">
                <span className="graph-label-left">8%</span>
                <div className="graph-bar-container"><div className="graph-bar bg-grey" style={{width: '15%'}}></div><div className="graph-bar bg-orange" style={{width: '45%'}}></div></div>
                <span className="graph-label-center">Cambridge</span>
                <span className="graph-label-right" style={{color: '#E06C3E'}}>27%</span>
              </div>
              
              <div className="graph-row">
                <span className="graph-label-left">12%</span>
                <div className="graph-bar-container"><div className="graph-bar bg-grey" style={{width: '25%'}}></div><div className="graph-bar bg-orange" style={{width: '40%'}}></div></div>
                <span className="graph-label-center">Imperial</span>
                <span className="graph-label-right" style={{color: '#E06C3E'}}>25%</span>
              </div>
              
              <div className="graph-row">
                <span className="graph-label-left">15%</span>
                <div className="graph-bar-container"><div className="graph-bar bg-grey" style={{width: '28%'}}></div><div className="graph-bar bg-orange" style={{width: '80%'}}></div></div>
                <span className="graph-label-center">RWTH</span>
                <span className="graph-label-right" style={{color: '#E06C3E'}}>53%</span>
              </div>
              
              <div className="graph-row">
                <span className="graph-label-left">20%</span>
                <div className="graph-bar-container"><div className="graph-bar bg-grey" style={{width: '35%'}}></div><div className="graph-bar bg-orange" style={{width: '60%'}}></div></div>
                <span className="graph-label-center">TU Munich</span>
                <span className="graph-label-right" style={{color: '#E06C3E'}}>40%</span>
              </div>
              
              <div className="graph-row">
                <span className="graph-label-left">14%</span>
                <div className="graph-bar-container"><div className="graph-bar bg-grey" style={{width: '26%'}}></div><div className="graph-bar bg-orange" style={{width: '55%'}}></div></div>
                <span className="graph-label-center">MIT</span>
                <span className="graph-label-right" style={{color: '#E06C3E'}}>37%</span>
              </div>
              
              <div className="graph-legend">
                <span style={{color: '#9CA3AF'}}>General Acceptance Rate</span> | <span style={{color: '#E06C3E', fontWeight: '600'}}>AdmitBridge Acceptance Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview Section */}
      <section className="home-overview" id="resources">
        <div className="section-container">
          <div className="section-header text-center">
            <h2>How AdmitBridge Works</h2>
            <p>An end-to-end ecosystem connecting students, universities, and consultancies.</p>
          </div>
          
          <div className="overview-grid">
            <div className="overview-card fade-in">
              <div className="overview-icon"><Search size={28} /></div>
              <h3>1. Discover & Predict</h3>
              <p>Students use our advanced AI/ML College Finder to predict admission chances across top global universities based on their unique profile.</p>
            </div>
            
            <div className="overview-card fade-in">
              <div className="overview-icon"><ShieldCheck size={28} /></div>
              <h3>2. Match with Experts</h3>
              <p>Get paired with verified, top-tier study abroad consultancies tailored to your target countries and desired courses.</p>
            </div>
            
            <div className="overview-card fade-in">
              <div className="overview-icon"><GraduationCap size={28} /></div>
              <h3>3. Seamless Application</h3>
              <p>Submit documents securely through the Student Portal and track your real-time application status in one centralized dashboard.</p>
            </div>
            
            <div className="overview-card fade-in">
              <div className="overview-icon"><Users size={28} /></div>
              <h3>4. Two-Way Sync</h3>
              <p>Consultancies process applications on their dedicated portal, automatically syncing status updates and notifications back to the student.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="home-portals">
        <div className="section-container">
          <div className="section-header text-center">
            <h2>Access Your Specialized Portals</h2>
            <p>Select the portal that best fits your role to continue your journey.</p>
          </div>
          
          <div className="portals-grid">
            {/* Student Portal Card */}
            <div className="portal-card" onClick={() => navigate('/login')}>
              <div className="portal-icon student-icon">
                <GraduationCap size={32} />
              </div>
              <h3>Student Portal</h3>
              <p>Track applications, explore universities, and manage your documents.</p>
              <div className="portal-action">
                <span>Enter Portal</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Consultancy Portal Card */}
            <div className="portal-card" onClick={() => window.location.href = import.meta.env.VITE_CONSULTANCY_PORTAL_URL || (import.meta.env.PROD ? `${import.meta.env.BASE_URL}consultancy/` : 'http://localhost:5174')}>
              <div className="portal-icon consultancy-icon">
                <Users size={32} />
              </div>
              <h3>Consultancy Portal</h3>
              <p>Manage student profiles, track statuses, and communicate efficiently.</p>
              <div className="portal-action">
                <span>Enter Portal</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Admin Portal Card */}
            <div className="portal-card" onClick={() => window.location.href = import.meta.env.VITE_ADMIN_PORTAL_URL || (import.meta.env.PROD ? `${import.meta.env.BASE_URL}admin/` : 'http://localhost:5175')}>
              <div className="portal-icon admin-icon">
                <ShieldCheck size={32} />
              </div>
              <h3>Admin Portal</h3>
              <p>System oversight, user management, and advanced analytics.</p>
              <div className="portal-action">
                <span>Enter Portal</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features bg-light" id="college-finder">
        <div className="section-container">
          <div className="features-grid">
            <div className="feature-text">
              <h2>Why Choose AdmitBridge?</h2>
              <p>We provide end-to-end guidance to ensure you land in your dream university with minimal stress.</p>
              
              <ul className="feature-list">
                <li>
                  <div className="feature-check"><Star size={16} fill="currentColor" /></div>
                  <div>
                    <h4>AI-Powered College Finder</h4>
                    <p>Our advanced ML model predicts your admission chances with high accuracy.</p>
                  </div>
                </li>
                <li>
                  <div className="feature-check"><Globe size={16} /></div>
                  <div>
                    <h4>Global Network</h4>
                    <p>Direct connections with top universities across 15+ countries.</p>
                  </div>
                </li>
                <li>
                  <div className="feature-check"><ShieldCheck size={16} /></div>
                  <div>
                    <h4>Verified Consultancies</h4>
                    <p>Only the best and most reliable consultants make it to our platform.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="feature-image-container">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Students studying" className="feature-img" />
              <div className="floating-card">
                <div className="stat-number"><CounterText end={98} suffix="%" /></div>
                <div className="stat-text">Success Rate</div>
              </div>
              <div className="floating-card small-float" style={{ top: '-20px', right: '-20px', left: 'auto', bottom: 'auto' }}>
                <div className="stat-number" style={{ fontSize: '1.5rem' }}><CounterText end={15} suffix="+" /></div>
                <div className="stat-text" style={{ fontSize: '0.8rem' }}>Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Universities Section */}
      <section className="home-universities bg-light" id="events">
        <div className="section-container">
          <div className="section-header text-center">
            <h2>Our Students Are At Top Global Universities</h2>
            <p>We've helped thousands of students secure admissions in their dream colleges.</p>
          </div>
          <div className="universities-grid">
            <div className="uni-card">
              <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="University Campus" className="uni-img" />
              <div className="uni-overlay">
                <h4>Stanford University</h4>
                <p>USA</p>
              </div>
            </div>
            <div className="uni-card">
              <img src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="University Campus" className="uni-img" />
              <div className="uni-overlay">
                <h4>University of Oxford</h4>
                <p>UK</p>
              </div>
            </div>
            <div className="uni-card">
              <img src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="University Campus" className="uni-img" />
              <div className="uni-overlay">
                <h4>University of Toronto</h4>
                <p>Canada</p>
              </div>
            </div>
            <div className="uni-card">
              <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="University Campus" className="uni-img" />
              <div className="uni-overlay">
                <h4>University of Melbourne</h4>
                <p>Australia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="home-testimonials" style={{backgroundColor: 'var(--bg-color)'}} id="premium">
        <div className="section-container">
          <div className="section-header text-center animate-on-scroll slide-up">
            <h2 style={{fontSize: '2.5rem', color: 'var(--text-dark)'}}>Now It's Your Moment</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card new-testimonial animate-on-scroll slide-up">
              <div className="testimonial-header">
                <p>Accepted to</p>
                <h3 style={{color: '#E06C3E'}}>INSEAD France</h3>
              </div>
              <div className="testimonial-img-container">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Muskan Garg" className="test-img" />
              </div>
              <div className="testimonial-info">
                <h4>Muskan Garg</h4>
                <p>MS Data Science | 8.5 CGPA</p>
              </div>
            </div>
            
            <div className="testimonial-card new-testimonial animate-on-scroll slide-up" style={{transitionDelay: '0.2s'}}>
              <div className="testimonial-header">
                <p>Accepted to</p>
                <h3 style={{color: '#E06C3E'}}>Illinois Tech</h3>
              </div>
              <div className="testimonial-quote">
                <p>"I had an excellent experience with AdmitBridge. The consultants were professional and supportive. Together, they made the study abroad process smooth, stress-free, and highly recommended."</p>
              </div>
              <div className="testimonial-info">
                <h4>Aishwarya Bhandari</h4>
                <p>MS Project Mgmt | 6.8 CGPA</p>
              </div>
            </div>
            
            <div className="testimonial-card new-testimonial animate-on-scroll slide-up" style={{transitionDelay: '0.4s'}}>
              <div className="testimonial-header">
                <p>Accepted to</p>
                <h3 style={{color: '#E06C3E'}}>NYU</h3>
              </div>
              <div className="testimonial-img-container">
                <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Soham Vadje" className="test-img" />
              </div>
              <div className="testimonial-info">
                <h4>Soham Vadje</h4>
                <p>MS in MOT | 7.9 CGPA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <div className="cta-overlay"></div>
        <div className="cta-content">
          <h2>Ready to Begin Your Journey?</h2>
          <p>Join over 1 million aspirants who trust AdmitBridge to connect them with the best educational opportunities globally.</p>
          <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }} onClick={() => navigate('/register')}>Create Free Profile</button>
        </div>
      </section>

      {/* Mega Footer */}
      <footer className="mega-footer">
        <div className="mega-footer-container">
          <div className="mega-footer-left">
            <img src={logo} alt="AdmitBridge Logo" className="mega-logo" />
            <h3>Need an Admission Roadmap?</h3>
            <p>Our senior advisors are ready to help you build a winning application.</p>
            <button className="btn-primary" style={{backgroundColor: '#E06C3E', width: '100%', marginBottom: '32px'}}>Talk To Advisor</button>
            
            <h4>Contact Us</h4>
            <ul className="contact-list">
              <li>1800-270-6088</li>
              <li>+91 6366421078</li>
              <li>support@admitbridge.com</li>
              <li>1st floor, Chandermukhi Building, Nariman Point, Mumbai, Maharashtra 400021</li>
            </ul>
          </div>
          
          <div className="mega-footer-right">
            <div className="footer-links-grid-top">
              <div className="link-item"><span>Study Abroad Consultation</span> <ChevronRight size={14}/></div>
              <div className="link-item"><span>Study Abroad Intakes</span> <ChevronRight size={14}/></div>
              <div className="link-item"><span>SOP & LOR's</span> <ChevronRight size={14}/></div>
              <div className="link-item"><span>Student Visa</span> <ChevronRight size={14}/></div>
              <div className="link-item"><span>Masters Abroad</span> <ChevronRight size={14}/></div>
              <div className="link-item"><span>Bachelors Abroad</span> <ChevronRight size={14}/></div>
              <div className="link-item"><span>MBA Abroad</span> <ChevronRight size={14}/></div>
              <div className="link-item"><span>GRE</span> <ChevronRight size={14}/></div>
            </div>
            
            <hr className="footer-divider" />
            
            <div className="footer-links-grid-bottom">
              <div>
                <h4>COMPANY</h4>
                <a href="#">About us</a>
                <a href="#">Contact us</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms & Conditions</a>
                <a href="#">Help Center</a>
                <a href="#">Careers</a>
              </div>
              <div>
                <h4>POPULAR COURSES</h4>
                <h5>MASTERS</h5>
                <a href="#">MS in Computer Science</a>
                <a href="#">MEM Abroad</a>
                <a href="#">MBA Abroad</a>
                <a href="#">MS in Civil Engineering</a>
                <a href="#" style={{color: '#E06C3E'}}>See all courses</a>
              </div>
              <div>
                <h4>TOOLS & SERVICES</h4>
                <a href="#">Blogs</a>
                <a href="#">Grad School Finder</a>
                <a href="#">Undergrad College Finder</a>
                <a href="#">Loan Finder</a>
                
                <h4 style={{marginTop: '24px'}}>CALCULATORS</h4>
                <a href="#">CGPA to GPA Conversion</a>
                <a href="#">PTE to IELTS Conversion</a>
              </div>
              <div>
                <h4>OUR PARTNERS</h4>
                <a href="#">Leap Scholar</a>
                <a href="#">Leap Finance</a>
                <a href="#">Geebee</a>
                
                <h4 style={{marginTop: '24px'}}>OUR PRODUCTS</h4>
                <a href="#">Student Portal</a>
                <a href="#">Consultancy Portal</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Bar */}
      <div className="sticky-bottom-bar">
        <div className="sticky-content">
          <span className="sticky-text">
            <Star size={18} fill="#D4AF37" color="#D4AF37" />
            Unsure about courses or universities? Connect 1:1 with an expert today.
          </span>
          <button className="btn-light">Check Eligibility</button>
        </div>
      </div>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Home;
