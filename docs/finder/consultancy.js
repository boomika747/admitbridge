document.addEventListener('DOMContentLoaded', () => {
    const statesDistricts = {
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"],
        "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Bomdila"],
        "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
        "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
        "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
        "Goa": ["North Goa", "South Goa", "Panaji", "Vasco da Gama", "Margao"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Jamnagar"],
        "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak", "Hisar"],
        "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Mandi", "Solan"],
        "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
        "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
        "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"],
        "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Bishnupur", "Ukhrul"],
        "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar"],
        "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
        "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
        "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Chandigarh"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer"],
        "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Singtam"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Vellore"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
        "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Ambassa"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Prayagraj"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh"],
        "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur"],
        "Delhi": ["New Delhi", "Dwarka", "Rohini", "Connaught Place", "Saket", "Vasant Kunj"],
        "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua"]
    };

    const stateSelect = document.getElementById('state');
    const areaSelect = document.getElementById('area');
    
    if (stateSelect && areaSelect) {
        stateSelect.addEventListener('change', (e) => {
            const selectedState = e.target.value;
            areaSelect.innerHTML = '<option value="">Select Area (Optional)</option>';
            if (selectedState && statesDistricts[selectedState]) {
                statesDistricts[selectedState].forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    areaSelect.appendChild(option);
                });
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const targetCountry = urlParams.get('country');
    const targetUni = urlParams.get('uni');
    
    if (targetCountry) {
        const countryInput = document.getElementById('country');
        if (countryInput) {
            countryInput.value = targetCountry;
        }
    }
    
    if (targetUni) {
        window.targetUniversity = targetUni;
        const header = document.querySelector('header');
        const banner = document.createElement('div');
        banner.className = 'glass-panel';
        banner.style.margin = '0 auto 2rem auto';
        banner.style.padding = '1rem 2rem';
        banner.style.textAlign = 'center';
        banner.style.animation = 'fadeInDown 0.5s ease-out';
        banner.innerHTML = `<p style="margin:0; font-size: 1.1rem;">Finding consultancies to help you apply to <strong style="color: var(--secondary);">${targetUni}</strong></p>`;
        header.parentNode.insertBefore(banner, header.nextSibling);
    }
});

document.getElementById('consultancy-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const btn = document.getElementById('submit-btn');
    const resultsSection = document.getElementById('results-section');
    const resultsGrid = document.getElementById('results-grid');
    
    btn.classList.add('loading');
    btn.disabled = true;
    
    const data = {
        budget: parseFloat(document.getElementById('budget').value),
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        area: document.getElementById('area').value || ''
    };
    
    try {
        const response = await fetch('/api/consultancies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
        renderResults(result.recommendations);
        
        resultsSection.style.display = 'block';
        
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
    } catch (error) {
        console.error("Error fetching consultancies:", error);
        alert("An error occurred while fetching recommendations. Make sure the backend server is running.");
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
});

function renderResults(recommendations) {
    const resultsGrid = document.getElementById('results-grid');
    
    resultsGrid.innerHTML = '';
    
    if (recommendations.length === 0) {
        resultsGrid.innerHTML = '<p>No consultancies found matching your criteria. Try increasing your budget or changing the state.</p>';
        return;
    }
    
    recommendations.forEach((cons, index) => {
        const successRateStr = cons.success_rate_pct.toFixed(1) + '%';
        
        const card = document.createElement('div');
        card.className = `uni-card stagger-${(index % 4) + 1}`;
        card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="uni-name" style="margin-bottom: 0; padding-right: 1rem;">${cons.consultancy_name}</div>
                <div class="rating-badge">⭐ ${cons.rating.toFixed(1)}</div>
            </div>
            
            <div class="uni-location" style="margin-bottom: 0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${cons.area_district}, ${cons.state}
            </div>
            <div class="uni-location" style="color: #cbd5e1;">
                <strong>Reviews:</strong> ${cons.reviews.toLocaleString()} verified students
            </div>
            
            <div class="card-stats">
                <div class="stat-box">
                    <span class="stat-label">Total Fee</span>
                    <span class="stat-val">₹${cons.total_fee_inr.toLocaleString()}</span>
                </div>
                <div class="stat-box" style="align-items: flex-end;">
                    <span class="stat-label">Success Rate</span>
                    <span class="stat-val accept-rate">${successRateStr}</span>
                </div>
            </div>
            <button class="apply-btn" onclick="handleConsultancyApply(this, '${cons.consultancy_name.replace(/'/g, "\\'")}')" style="width: 100%; border: none; font-family: inherit; cursor: pointer; margin-top: 1.5rem; font-size: 1rem;">Submit Details</button>
        `;
        
        resultsGrid.appendChild(card);
    });
}

window.handleConsultancyApply = function(btn, consultancyName) {
    if (btn.innerText === 'Applied!') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const preCgpa = urlParams.get('cgpa') || '';
    const preBranch = urlParams.get('branch') || '';
    let preExamType = urlParams.get('exam_type') || '';
    if (preExamType) {
        if(preExamType.toLowerCase() === 'ielts') preExamType = 'IELTS';
        else if(preExamType.toLowerCase() === 'toefl') preExamType = 'TOEFL';
        else if(preExamType.toLowerCase() === 'duolingo') preExamType = 'Duolingo';
        else if(preExamType.toLowerCase() === 'gre') preExamType = 'None'; // Since GRE isn't in Eng Test, fallback to None
        else if(preExamType.toLowerCase() === 'pte') preExamType = 'PTE';
        else preExamType = 'None';
    }
    const preExamScore = urlParams.get('exam_score') || '';
    const currentCity = document.getElementById('area') ? document.getElementById('area').value : '';
    const preUni = window.targetUniversity || '';
    
    const getSelected = (val, target) => val === target ? 'selected' : '';

    const modal = document.createElement('div');
    modal.className = 'modal-container';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.backdropFilter = 'blur(10px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.animation = 'fadeInUp 0.3s ease-out';
    
    window.closeSubmissionModal = function() {
        modal.remove();
    };

    modal.innerHTML = `
        <div class="glass-panel" style="max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; padding: 2rem;">
            <button onclick="closeSubmissionModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 2rem; cursor: pointer; width: auto; padding: 0.5rem; margin: 0; box-shadow: none; z-index: 10;">&times;</button>
            <h2 style="font-size: 1.8rem; margin-bottom: 0.2rem;">Submit Details</h2>
            <p style="margin-bottom: 1.5rem; font-size: 0.95rem;">to <strong>${consultancyName}</strong></p>
            
            <form id="consultancy-submission-form" style="display: flex; flex-direction: column;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div class="form-group" style="margin: 0;">
                        <label for="first_name" style="font-size: 0.85rem; margin-bottom: 0.3rem;">First Name</label>
                        <input type="text" id="first_name" required placeholder="John" style="padding: 0.7rem; font-size: 0.9rem;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="last_name" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Last Name</label>
                        <input type="text" id="last_name" required placeholder="Doe" style="padding: 0.7rem; font-size: 0.9rem;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="email" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Email Address</label>
                        <input type="email" id="email" required placeholder="john@example.com" style="padding: 0.7rem; font-size: 0.9rem;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="phone" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Phone Number</label>
                        <input type="tel" id="phone" required placeholder="+91 9876543210" style="padding: 0.7rem; font-size: 0.9rem;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="dob" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Date of Birth</label>
                        <input type="date" id="dob" required style="padding: 0.7rem; font-size: 0.9rem;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="gender" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Gender</label>
                        <select id="gender" required style="padding: 0.7rem; font-size: 0.9rem;">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="city" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Current City</label>
                        <input type="text" id="city" required placeholder="e.g. Mumbai" style="padding: 0.7rem; font-size: 0.9rem;" value="${currentCity}">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="highest_qual" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Highest Qualification</label>
                        <select id="highest_qual" required style="padding: 0.7rem; font-size: 0.9rem;">
                            <option value="">Select</option>
                            <option value="Bachelors">Bachelor's Degree</option>
                            <option value="Masters">Master's Degree</option>
                            <option value="High School">High School (12th)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="school_name" style="font-size: 0.85rem; margin-bottom: 0.3rem;">School/University Name</label>
                        <input type="text" id="school_name" required placeholder="e.g. Delhi University" style="padding: 0.7rem; font-size: 0.9rem;" value="${preUni}">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="cgpa" style="font-size: 0.85rem; margin-bottom: 0.3rem;">CGPA / Percentage</label>
                        <input type="text" id="cgpa" required placeholder="e.g. 8.5 or 85%" style="padding: 0.7rem; font-size: 0.9rem;" value="${preCgpa}">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="pass_year" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Year of Passing</label>
                        <input type="number" id="pass_year" required placeholder="e.g. 2023" style="padding: 0.7rem; font-size: 0.9rem;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="intended_course" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Intended Course/Branch</label>
                        <input type="text" id="intended_course" required placeholder="e.g. Computer Science" style="padding: 0.7rem; font-size: 0.9rem;" value="${preBranch}">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="eng_test" style="font-size: 0.85rem; margin-bottom: 0.3rem;">English Proficiency Test</label>
                        <select id="eng_test" required style="padding: 0.7rem; font-size: 0.9rem;">
                            <option value="">Select Test</option>
                            <option value="IELTS" ${getSelected(preExamType, 'IELTS')}>IELTS</option>
                            <option value="TOEFL" ${getSelected(preExamType, 'TOEFL')}>TOEFL</option>
                            <option value="Duolingo" ${getSelected(preExamType, 'Duolingo')}>Duolingo</option>
                            <option value="PTE" ${getSelected(preExamType, 'PTE')}>PTE</option>
                            <option value="None" ${getSelected(preExamType, 'None')}>Not taken yet</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label for="test_score" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Test Score (If any)</label>
                        <input type="number" id="test_score" step="0.1" placeholder="e.g. 7.5" style="padding: 0.7rem; font-size: 0.9rem;" value="${preExamScore}">
                    </div>
                    <div class="form-group" style="margin: 0; grid-column: span 2;">
                        <label for="passport" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Passport Number (Optional)</label>
                        <input type="text" id="passport" placeholder="e.g. A1234567" style="padding: 0.7rem; font-size: 0.9rem;">
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label for="comments" style="font-size: 0.85rem; margin-bottom: 0.3rem;">Additional Comments</label>
                    <textarea id="comments" rows="2" placeholder="Any specific requirements or questions..." style="width: 100%; resize: vertical;"></textarea>
                </div>
                
                <button type="submit" id="final-submit-btn" style="margin-top: 0; width: 100%;">
                    <span>Submit Application</span>
                    <div class="spinner" id="final-spinner" style="display: none; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></div>
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('consultancy-submission-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('final-submit-btn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        document.getElementById('final-spinner').style.display = 'block';
        submitBtn.querySelector('span').style.opacity = '0';

        const formData = {
            consultancyName: consultancyName,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            city: document.getElementById('city').value,
            highest_qual: document.getElementById('highest_qual').value,
            school_name: document.getElementById('school_name').value,
            cgpa: document.getElementById('cgpa').value,
            pass_year: document.getElementById('pass_year').value,
            intended_course: document.getElementById('intended_course').value,
            eng_test: document.getElementById('eng_test').value,
            test_score: document.getElementById('test_score').value,
            passport: document.getElementById('passport').value,
            comments: document.getElementById('comments').value,
            target_country: urlParams.get('country') || ''
        };
        
        try {
            await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            modal.remove();
            showSuccessModal(consultancyName);
            
            btn.innerHTML = 'Applied!';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            btn.style.pointerEvents = 'none';
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('There was an error submitting your application.');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            document.getElementById('final-spinner').style.display = 'none';
            submitBtn.querySelector('span').style.opacity = '1';
        }
    });
};

function showSuccessModal(consultancyName) {
    const uniText = window.targetUniversity ? ` for admission to <strong style="color: var(--secondary);">${window.targetUniversity}</strong>` : '';
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.backdropFilter = 'blur(10px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.animation = 'fadeInUp 0.4s ease-out';
    
    modal.innerHTML = `
        <div class="glass-panel" style="max-width: 500px; text-align: center; padding: 3rem; margin: 1rem;">
            <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Application Sent!</h2>
            <p style="font-size: 1.1rem; margin-bottom: 2.5rem; line-height: 1.6;">
                Your profile has been successfully sent to <strong>${consultancyName}</strong>${uniText}.
                <br><br>
                Their expert admission counselor will contact you shortly to begin processing your application.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="window.location.href='/'" style="width: auto; padding: 0.8rem 1.5rem; background: #f3f4f6; color: var(--text-color); margin-top: 0; box-shadow: none;">Back to Home</button>
                <button onclick="this.closest('.modal-container').remove()" style="width: auto; padding: 0.8rem 1.5rem; margin-top: 0;">Find More</button>
            </div>
        </div>
    `;
    modal.className = 'modal-container';
    document.body.appendChild(modal);
}
