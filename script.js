// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initSmoothScrolling();
    initFuelTracking();
    initScrollEffects();
    initAnimations();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Mobile-specific optimizations
    if (window.innerWidth <= 768) {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Improve touch scrolling
        document.body.style.webkitOverflowScrolling = 'touch';
    }
}

// Smooth scrolling functionality
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Global scroll to section function
function scrollToSection(sectionId) {
    const targetSection = document.querySelector(`#${sectionId}`);
    if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Fuel tracking functionality
function initFuelTracking() {
    // Initialize fuel tracking features
    updateStats();
    setupFormListener();
}

// Update dashboard stats
function updateStats() {
    // This would connect to Google Sheets API in a real implementation
    // For now, we'll show placeholder data
    const stats = {
        vehicles: 7,
        litersThisMonth: 0,
        totalHours: 0,
        fuelLogs: 0
    };
    
    // Update stats display
    const statElements = document.querySelectorAll('.stat-card h3');
    if (statElements.length >= 4) {
        statElements[0].textContent = stats.vehicles;
        statElements[1].textContent = stats.litersThisMonth;
        statElements[2].textContent = stats.totalHours;
        statElements[3].textContent = stats.fuelLogs;
    }
}

// Setup Google Form listener
function setupFormListener() {
    // Listen for messages from the iframe (if form is embedded)
    window.addEventListener('message', function(event) {
        if (event.origin === 'https://docs.google.com') {
            // Handle form submission
            if (event.data && event.data.type === 'form-submit') {
                showNotification('Fuel log submitted successfully!', 'success');
                updateStats();
            }
        }
    });
}

// Google Sheets API Configuration
const SHEET_ID = '1tVrHhoiEqp9WXd7vUFKvNg5989MsV5cS6Qo8WKVf2fk';
const API_KEY = 'YOUR_API_KEY_HERE'; // You'll need to add your API key here

// Load fuel data from Google Sheets
async function loadData() {
    const placeholder = document.querySelector('.data-placeholder');
    if (!placeholder) return;

    try {
        // Show loading state
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <div class="placeholder-icon">🔄</div>
                <h4>Loading Fuel Data...</h4>
                <p>Fetching data from Google Sheets...</p>
                <div class="loading-spinner"></div>
            </div>
        `;

        // Fetch data from Google Sheets
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        
        if (data.values && data.values.length > 1) {
            // Process the data
            const headers = data.values[0];
            const rows = data.values.slice(1);
            
            // Display the data
            displayFuelData(headers, rows);
            updateDashboardStats(rows);
        } else {
            throw new Error('No data found');
        }

    } catch (error) {
        console.error('Error loading data:', error);
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <div class="placeholder-icon">⚠️</div>
                <h4>API Key Required</h4>
                <p>To display your fuel data, you need to add your Google Sheets API key to the script.js file.</p>
                <button class="cta-button" onclick="showNotification('Check the console for setup instructions', 'info')">Setup Instructions</button>
            </div>
        `;
    }
}

// Display fuel data in a table
function displayFuelData(headers, rows) {
    const placeholder = document.querySelector('.data-placeholder');
    
    // Create table HTML
    let tableHTML = `
        <div class="data-table-container">
            <div class="table-header">
                <h4>Recent Fuel Logs</h4>
                <div class="table-controls">
                    <input type="text" id="searchInput" placeholder="Search..." class="search-input">
                    <select id="vehicleFilter" class="filter-select">
                        <option value="">All Vehicles</option>
                    </select>
                </div>
            </div>
            <div class="table-wrapper">
                <table class="fuel-data-table">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    placeholder.innerHTML = tableHTML;
    
    // Setup search and filter functionality
    setupTableFilters(headers, rows);
}

// Setup table search and filter
function setupTableFilters(headers, rows) {
    const searchInput = document.getElementById('searchInput');
    const vehicleFilter = document.getElementById('vehicleFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterTable(this.value, vehicleFilter.value, rows);
        });
    }
    
    if (vehicleFilter) {
        // Get unique vehicles
        const vehicles = [...new Set(rows.map(row => row[1]))]; // Assuming vehicle is column 1
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle;
            option.textContent = vehicle;
            vehicleFilter.appendChild(option);
        });
        
        vehicleFilter.addEventListener('change', function() {
            filterTable(searchInput.value, this.value, rows);
        });
    }
}

// Filter table data
function filterTable(searchTerm, vehicleFilter, rows) {
    const tbody = document.querySelector('.fuel-data-table tbody');
    if (!tbody) return;
    
    const filteredRows = rows.filter(row => {
        const matchesSearch = searchTerm === '' || row.some(cell => 
            cell && cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesVehicle = vehicleFilter === '' || row[1] === vehicleFilter;
        return matchesSearch && matchesVehicle;
    });
    
    tbody.innerHTML = filteredRows.map(row => `
        <tr>
            ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
        </tr>
    `).join('');
}

// Update dashboard stats
function updateDashboardStats(rows) {
    if (!rows || rows.length === 0) return;
    
    // Calculate stats
    const totalLogs = rows.length;
    const totalFuel = rows.reduce((sum, row) => sum + (parseFloat(row[2]) || 0), 0); // Assuming fuel is column 2
    const totalHours = rows.reduce((sum, row) => sum + (parseFloat(row[3]) || 0), 0); // Assuming hours is column 3
    const uniqueVehicles = new Set(rows.map(row => row[1])).size; // Assuming vehicle is column 1
    
    // Update stat cards
    const statElements = document.querySelectorAll('.stat-card h3');
    if (statElements.length >= 4) {
        statElements[0].textContent = uniqueVehicles;
        statElements[1].textContent = Math.round(totalFuel);
        statElements[2].textContent = Math.round(totalHours);
        statElements[3].textContent = totalLogs;
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Scroll effects
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-item, .about-card, .contact-form, .contact-info');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Animation initialization
function initAnimations() {
    // Add animation classes to CSS
    const style = document.createElement('style');
    style.textContent = `
        .feature-item, .about-card, .contact-form, .contact-info {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        .nav-menu.active {
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
            .nav-menu {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
}

// Utility function to debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add typing effect to hero title (optional)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key to close mobile menu
    if (e.key === 'Escape') {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});

// Add loading state for better UX
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Add a simple loading animation
    const style = document.createElement('style');
    style.textContent = `
        body:not(.loaded) {
            overflow: hidden;
        }
        
        body:not(.loaded)::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        body:not(.loaded)::after {
            content: 'Loading...';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
            z-index: 10000;
        }
    `;
    document.head.appendChild(style);
}); 