// Fetch options on load
document.addEventListener('DOMContentLoaded', async () => {
    const defaultBranches = [
        "Artificial Intelligence",
        "Civil Engineering",
        "Computer Science",
        "Data Science",
        "Electrical Engineering",
        "Electronics and Communication",
        "Information Technology",
        "Mechanical Engineering",
        "Software Engineering"
    ];

    const branchSelect = document.getElementById('branch');
    const populateBranches = (branches) => {
        branchSelect.innerHTML = '<option value="">Select Branch</option>';
        branches.forEach(branch => {
            const opt = document.createElement('option');
            opt.value = branch;
            opt.textContent = branch;
            branchSelect.appendChild(opt);
        });
    };

    try {
        const response = await fetch('/api/options');
        const options = await response.json();
        if (options && Array.isArray(options.branches) && options.branches.length > 0) {
            populateBranches(options.branches);
        } else {
            populateBranches(defaultBranches);
        }
    } catch (error) {
        console.warn("Using default branch list:", error);
        populateBranches(defaultBranches);
    }

    // Auto-fill from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('cgpa')) document.getElementById('cgpa').value = urlParams.get('cgpa');
    if (urlParams.has('budget')) document.getElementById('budget').value = urlParams.get('budget');
    if (urlParams.has('country')) document.getElementById('country').value = urlParams.get('country');
    if (urlParams.has('intake')) document.getElementById('intake').value = urlParams.get('intake');
    if (urlParams.has('backlogs')) document.getElementById('backlogs').value = urlParams.get('backlogs');
    if (urlParams.has('exam_type')) {
        document.getElementById('exam-type').value = urlParams.get('exam_type');
        updateScoreConstraints(); // Update constraints based on auto-filled test type
    }
    if (urlParams.has('exam_score')) document.getElementById('exam-score').value = urlParams.get('exam_score');
    
    // Branch has to be set after options are loaded
    if (urlParams.has('branch')) {
        // Wait a small tick for the DOM to update the options
        setTimeout(() => {
            const branchInput = document.getElementById('branch');
            const targetBranch = urlParams.get('branch');
            // Select it if it exists in the options
            for (let i = 0; i < branchInput.options.length; i++) {
                if (branchInput.options[i].value.toLowerCase() === targetBranch.toLowerCase()) {
                    branchInput.selectedIndex = i;
                    break;
                }
            }
        }, 50);
    }
});

let globalRecommendations = [];

// Dynamic score range
const examTypeSelect = document.getElementById('exam-type');
const examScoreInput = document.getElementById('exam-score');

const scoreConstraints = {
    gre: { min: 260, max: 340, placeholder: "e.g. 320" },
    toefl: { min: 0, max: 120, placeholder: "e.g. 105" },
    ielts: { min: 0, max: 9, placeholder: "e.g. 7.5" },
    duolingo: { min: 10, max: 160, placeholder: "e.g. 120" }
};

function updateScoreConstraints() {
    const type = examTypeSelect.value;
    const constraints = scoreConstraints[type];
    if (constraints) {
        examScoreInput.min = constraints.min;
        examScoreInput.max = constraints.max;
        examScoreInput.placeholder = constraints.placeholder;
        // Optionally clear out of bounds values:
        if (examScoreInput.value) {
            const val = parseFloat(examScoreInput.value);
            if (val < constraints.min || val > constraints.max) {
                examScoreInput.value = '';
            }
        }
    }
}

examTypeSelect.addEventListener('change', updateScoreConstraints);
// Set initial constraint
updateScoreConstraints();

document.getElementById('prediction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const btn = document.getElementById('submit-btn');
    const resultsSection = document.getElementById('results-section');
    const resultsGrid = document.getElementById('results-grid');
    
    btn.classList.add('loading');
    btn.disabled = true;
    
    const data = {
        cgpa: parseFloat(document.getElementById('cgpa').value),
        budget: parseFloat(document.getElementById('budget').value),
        country: document.getElementById('country').value,
        branch: document.getElementById('branch').value,
        intake: document.getElementById('intake').value,
        back_logs: parseFloat(document.getElementById('backlogs').value),
        exam_type: document.getElementById('exam-type').value,
        exam_score: parseFloat(document.getElementById('exam-score').value)
    };
    
    try {
        const token = localStorage.getItem('token') || new URLSearchParams(window.location.search).get('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: headers,
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
        
        globalRecommendations = result.recommendations;
        
        renderResults();
        
        resultsSection.style.display = 'block';
        
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        alert("An error occurred while fetching recommendations. Make sure the backend server is running.");
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
});

function renderResults() {
    const resultsGrid = document.getElementById('results-grid');
    const searchInput = document.getElementById('uni-search');
    const query = searchInput.value.toLowerCase().trim();
    
    let filtered = globalRecommendations;
    if (query) {
        filtered = globalRecommendations.filter(uni => uni.university_name.toLowerCase().includes(query));
    }
    
    // Display up to 12 matches for performance and UI layout
    const toDisplay = filtered.slice(0, 12);
    
    resultsGrid.innerHTML = '';
    
    if (toDisplay.length === 0) {
        if (query && globalRecommendations.length > 0) {
            resultsGrid.innerHTML = '<p>No university matching your search was found in the eligible list.</p>';
        } else {
            resultsGrid.innerHTML = '<p>No universities found matching your criteria.</p>';
        }
        return;
    }
    
    toDisplay.forEach((uni, index) => {
        const acceptRateStr = (uni.acceptance_probability * 100).toFixed(1) + '%';
        
        const card = document.createElement('div');
        card.className = `uni-card stagger-${(index % 4) + 1}`;
        card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            const searchQuery = encodeURIComponent(uni.university_name + ' ' + uni.country + ' official website');
            window.open(`https://duckduckgo.com/?q=!ducky+${searchQuery}`, '_blank');
        });
        
        card.innerHTML = `
            <div class="uni-name">${uni.university_name}</div>
            <div class="uni-location" style="margin-bottom: 0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${uni.state}, ${uni.country}
            </div>
            <div class="uni-location" style="color: #cbd5e1;">
                <strong>Intake:</strong> ${uni.intake}
            </div>
            <div class="card-stats" style="margin-bottom: 1rem;">
                <div class="stat-box">
                    <span class="stat-label">Tuition Fee</span>
                    <span class="stat-val">$${uni.tution_fee_in_usd.toLocaleString()}</span>
                </div>
                <div class="stat-box" style="align-items: flex-end;">
                    <span class="stat-label">Acceptance Chance</span>
                    <span class="stat-val accept-rate">${acceptRateStr}</span>
                </div>
            </div>
            <button onclick="event.stopPropagation(); handleApply('${uni.country.replace(/'/g, "\\'")}', '${uni.university_name.replace(/'/g, "\\'")}')" class="apply-btn" style="border: none; width: 100%; cursor: pointer; font-family: inherit; font-size: 1rem;">Apply Now</button>
        `;
        
        resultsGrid.appendChild(card);
    });
}

document.getElementById('uni-search').addEventListener('input', renderResults);

window.handleApply = function(country, uniName) {
    const cgpa = document.getElementById('cgpa').value || '';
    const branch = document.getElementById('branch').value || '';
    const exam_type = document.getElementById('exam-type').value || '';
    const exam_score = document.getElementById('exam-score').value || '';
    
    let url = `/consultancy.html?country=${encodeURIComponent(country)}&uni=${encodeURIComponent(uniName)}`;
    if (cgpa) url += `&cgpa=${encodeURIComponent(cgpa)}`;
    if (branch) url += `&branch=${encodeURIComponent(branch)}`;
    if (exam_type) url += `&exam_type=${encodeURIComponent(exam_type)}`;
    if (exam_score) url += `&exam_score=${encodeURIComponent(exam_score)}`;
    
    window.location.href = url;
};
