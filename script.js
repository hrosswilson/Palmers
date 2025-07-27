// ===== DEVELOPMENT SETTINGS =====
// Set DEV_MODE to false when ready for production
// DEV_MODE = true  -> No auto-loading (prevents API rate limits during development)
// DEV_MODE = false -> Normal operation (auto-loads data)

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
        
        // Optimize for mobile performance
        document.body.style.touchAction = 'manipulation';
        
        // Reduce motion for better performance
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.style.setProperty('--transition-duration', '0.1s');
        }
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
                
                // Auto-load data when navigating to view-data section
                if (targetId === '#view-data' && !DEV_MODE) {
                    setTimeout(() => {
                        loadData();
                    }, 1000); // Wait for scroll to complete
                }
                
                // Create charts when navigating to analytics section
                if (targetId === '#analytics') {
                    setTimeout(() => {
                        createChartsWhenVisible();
                    }, 1000); // Wait for scroll to complete
                }
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
        
        // Auto-load data when scrolling to view-data section
        if (sectionId === 'view-data') {
            setTimeout(() => {
                loadData();
            }, 1000); // Wait for scroll to complete
        }
        
        // Create charts when scrolling to analytics section
        if (sectionId === 'analytics') {
            setTimeout(() => {
                createChartsWhenVisible();
            }, 1000); // Wait for scroll to complete
        }
    }
}

// Fuel tracking functionality
function initFuelTracking() {
    // Initialize fuel tracking features
    updateStats();
    setupFormListener();
    
    // Show dev mode status if enabled
    if (DEV_MODE) {
        showDevModeStatus();
    }
    
    // Auto-load data when page loads
    autoLoadData();
    initAnalytics();
}

// Show development mode status
function showDevModeStatus() {
    const statusElement = document.getElementById('dataStatus');
    const messageElement = document.getElementById('dataMessage');
    
    if (statusElement && messageElement) {
        if (DEV_MODE) {
            statusElement.textContent = '🚧 Development Mode Active';
            messageElement.textContent = 'Auto-loading disabled to prevent API rate limits. Click "Load Data" when ready to test.';
        } else {
            statusElement.textContent = '📊 Production Mode Active';
            messageElement.textContent = 'Auto-loading enabled with 10-minute data caching. Data will refresh automatically.';
        }
    }
}

// Auto-load data when page loads
function autoLoadData() {
    // Skip auto-loading if in development mode
    if (DEV_MODE) {
        console.log('🚧 Development Mode: Auto-loading disabled');
        return;
    }
    
    // Check if we're on the view-data section
    const viewDataSection = document.querySelector('#view-data');
    if (viewDataSection) {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
            loadData();
        }, 500);
    }
}

// Update dashboard stats
function updateStats() {
    // If we have fuel data, use real data; otherwise show placeholder
    if (window.fuelData && window.fuelData.allRows) {
        updateDashboardStats(window.fuelData.allRows);
    } else {
        // Show placeholder data when no fuel data is available
        const stats = {
            litersThisMonth: 0,
            allTimeLitres: 0,
            totalHours: 0,
            fuelLogs: 0
        };
        
        // Update stats display
        const statElements = document.querySelectorAll('.stat-card h3');
        if (statElements.length >= 4) {
            statElements[0].textContent = stats.litersThisMonth;
            statElements[1].textContent = stats.allTimeLitres || 0;
            statElements[2].textContent = stats.totalHours;
            statElements[3].textContent = stats.fuelLogs;
        }
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
const API_KEY = 'AIzaSyDoKIsEI4mt6k4JyTkQ8N7gxtC-Y9Rm6vA';

// Rate limiting configuration
const RATE_LIMIT = {
    maxRequests: 50, // Reduced from unlimited
    timeWindow: 60000, // 1 minute
    currentRequests: 0,
    lastReset: Date.now()
};

// Rate limiting function
function checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now - RATE_LIMIT.lastReset > RATE_LIMIT.timeWindow) {
        RATE_LIMIT.currentRequests = 0;
        RATE_LIMIT.lastReset = now;
    }
    
    // Check if we're within limits
    if (RATE_LIMIT.currentRequests >= RATE_LIMIT.maxRequests) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    // Increment counter
    RATE_LIMIT.currentRequests++;
    return true;
}

// Development Mode - Set to true to disable auto-loading
const DEV_MODE = false; // Change to false when ready for production

// Log development mode status
if (DEV_MODE) {
    console.log('🚧 DEVELOPMENT MODE ACTIVE - Auto-loading disabled to prevent API rate limits');
    console.log('💡 Change DEV_MODE to false when ready for production');
} else {
    console.log('✅ PRODUCTION MODE ACTIVE - Auto-loading enabled with 10-minute caching');
    console.log('📊 Data will refresh automatically and cache for 10 minutes');
}

// Load fuel data from Google Sheets
async function loadData() {
    const placeholder = document.querySelector('.data-placeholder');
    if (!placeholder) return;

    // Check rate limiting before making API calls
    try {
        checkRateLimit();
    } catch (error) {
        console.error('Rate limit exceeded:', error.message);
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <div class="placeholder-icon">⚠️</div>
                <h4>Rate Limit Exceeded</h4>
                <p>Too many requests. Please wait a moment and try again.</p>
                <button class="cta-button" onclick="loadData()">Retry</button>
            </div>
        `;
        return;
    }

    // Check if we already have data and it's recent (within 10 minutes)
    if (window.fuelData && window.lastDataFetch && (Date.now() - window.lastDataFetch) < 600000) {
        console.log('Using cached data (10-minute cache)');
        displayFuelData(window.fuelData.headers, window.fuelData.recentRows, window.fuelData.allRows);
        updateDashboardStats(window.fuelData.allRows);
        
        // Automatically create charts when using cached data
        setTimeout(() => {
            createChartsWhenVisible();
        }, 500);
        console.log('Cached data loaded successfully. Charts will be created automatically.');
        return;
    }

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
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Fuel%20Responses?key=${API_KEY}`);
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else if (response.status === 403) {
                throw new Error('Access denied. Please check your API key and sheet permissions.');
            } else {
                throw new Error(`Failed to fetch data (Status: ${response.status})`);
            }
        }

        const data = await response.json();
        
        if (data.values && data.values.length > 1) {
            // Process the data
            const headers = data.values[0];
            const allRows = data.values.slice(1);
            
            // Sort all rows by timestamp (most recent first)
            const sortedRows = allRows.sort((a, b) => {
                const dateA = new Date(a[0]); // Assuming timestamp is in column 0
                const dateB = new Date(b[0]);
                return dateB - dateA; // Most recent first
            });
            
            // Get the 10 most recent logs
            const recentRows = sortedRows.slice(0, 10);
            
            // Store data globally for analytics with timestamp
            window.fuelData = { headers, recentRows, allRows: sortedRows };
            window.lastDataFetch = Date.now();
            
            // Display the data
            displayFuelData(headers, recentRows, allRows);
            updateDashboardStats(allRows);
            
            // Automatically create charts when data is loaded
            setTimeout(() => {
                createChartsWhenVisible();
            }, 500);
            console.log('Data loaded successfully. Charts will be created automatically.');
        } else {
            throw new Error('No data found');
        }

    } catch (error) {
        console.error('Error loading data:', error);
        
        let errorMessage = 'Failed to load fuel data.';
        let errorDetails = 'Please try again later.';
        
        if (error.message.includes('Rate limit exceeded')) {
            errorMessage = 'Rate Limit Exceeded';
            errorDetails = 'Too many requests. Please wait 1-2 minutes and try again.';
        } else if (error.message.includes('Access denied')) {
            errorMessage = 'Access Denied';
            errorDetails = 'Please check your API key and sheet permissions.';
        } else if (error.message.includes('No data found')) {
            errorMessage = 'No Data Found';
            errorDetails = 'Your Google Sheet appears to be empty. Add some fuel logs first.';
        }
        
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <div class="placeholder-icon">⚠️</div>
                <h4>${errorMessage}</h4>
                <p>${errorDetails}</p>
                <button class="cta-button" onclick="loadData()">Retry</button>
            </div>
        `;
    }
}

// Display fuel data in a table
function displayFuelData(headers, recentRows, allRows) {
    const placeholder = document.querySelector('.data-placeholder');
    
    // Create table HTML
    let tableHTML = `
        <div class="data-table-container">
            <div class="table-header">
                <h4>Recent Fuel Logs (Last 10)</h4>
                <div class="table-controls">
                    <select id="vehicleFilter" class="filter-select">
                        <option value="">All Machines</option>
                    </select>
                    <select id="viewMode" class="view-mode-select">
                        <option value="recent">Last 10 Logs</option>
                        <option value="all">All Logs (${allRows.length})</option>
                    </select>
                    <button onclick="loadData()" class="refresh-button" title="Refresh Data">
                        🔄
                    </button>
                </div>
            </div>
            <div class="table-wrapper">
                <table class="fuel-data-table" id="fuelTable">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${recentRows.map(row => `
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
    setupTableFilters(headers, recentRows, allRows);
}

// Setup table filters
function setupTableFilters(headers, recentRows, allRows) {
    const vehicleFilter = document.getElementById('vehicleFilter');
    const viewMode = document.getElementById('viewMode');
    
    if (vehicleFilter) {
        // Get unique machines from all data
        const vehicles = [...new Set(allRows.map(row => row[1]))]; // Assuming machine is column 1
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle;
            option.textContent = vehicle;
            vehicleFilter.appendChild(option);
        });
        
        vehicleFilter.addEventListener('change', function() {
            filterTable(this.value, viewMode.value, recentRows, allRows);
        });
    }
    
    if (viewMode) {
        viewMode.addEventListener('change', function() {
            updateTableView(this.value, recentRows, allRows);
            filterTable(vehicleFilter.value, this.value, recentRows, allRows);
        });
    }
}

// Update table view based on mode
function updateTableView(mode, recentRows, allRows) {
    const tbody = document.querySelector('#fuelTable tbody');
    const tableHeader = document.querySelector('.table-header h4');
    const vehicleFilter = document.getElementById('vehicleFilter');
    
    // Get current vehicle filter
    const currentVehicle = vehicleFilter ? vehicleFilter.value : '';
    
    // Filter by vehicle first
    let filteredByVehicle = allRows;
    if (currentVehicle !== '') {
        filteredByVehicle = allRows.filter(row => row[1] === currentVehicle);
    }
    
    if (mode === 'recent') {
        const recentFiltered = filteredByVehicle.slice(0, 10); // Most recent first
        tableHeader.textContent = `Recent Fuel Logs (Last 10${currentVehicle ? ` - ${currentVehicle}` : ''})`;
        tbody.innerHTML = recentFiltered.map(row => `
            <tr>
                ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
            </tr>
        `).join('');
    } else {
        tableHeader.textContent = `All Fuel Logs (${filteredByVehicle.length}${currentVehicle ? ` - ${currentVehicle}` : ''})`;
        tbody.innerHTML = filteredByVehicle.map(row => `
            <tr>
                ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
            </tr>
        `).join('');
    }
}

// Filter table data
function filterTable(vehicleFilter, viewMode, recentRows, allRows) {
    const tbody = document.querySelector('#fuelTable tbody');
    if (!tbody) return;
    
    // First filter by vehicle (if selected)
    let filteredByVehicle = allRows;
    if (vehicleFilter !== '') {
        filteredByVehicle = allRows.filter(row => row[1] === vehicleFilter);
    }
    
    // Then apply view mode (recent vs all)
    let finalRows;
    if (viewMode === 'recent') {
        // Get first 10 from the filtered vehicle data (most recent first)
        finalRows = filteredByVehicle.slice(0, 10);
    } else {
        // Show all filtered vehicle data
        finalRows = filteredByVehicle;
    }
    
    tbody.innerHTML = finalRows.map(row => `
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
    
    // Calculate total hours by finding differences between consecutive readings
    const totalHours = calculateTotalHours(rows);
    const uniqueVehicles = new Set(rows.map(row => row[1])).size; // Assuming machine is column 1
    
    // Calculate current month's fuel usage
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let litresThisMonth = 0;
    
    rows.forEach(row => {
        const timestamp = row[0];
        const litres = parseFloat(row[2]) || 0;
        
        if (timestamp) {
            const date = new Date(timestamp);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                litresThisMonth += litres;
            }
        }
    });
    
    // Update stat cards
    const statElements = document.querySelectorAll('.stat-card h3');
    if (statElements.length >= 4) {
        statElements[0].textContent = Math.round(litresThisMonth);
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
            background: linear-gradient(135deg, var(--secondary-color) 0%, #764ba2 100%);
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
        
        /* Mobile loading optimization */
        @media (max-width: 768px) {
            body:not(.loaded)::after {
                font-size: 1.2rem;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add mobile-specific optimizations after load
    if (window.innerWidth <= 768) {
        // Optimize for mobile performance
        document.body.style.setProperty('--transition-duration', '0.2s');
        
        // Add mobile-specific event listeners
        addMobileOptimizations();
    }
});

// Mobile-specific optimizations
function addMobileOptimizations() {
    // Optimize scroll performance
    let ticking = false;
    
    function updateScroll() {
        ticking = false;
        // Any scroll-based updates can go here
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Optimize touch events
    document.addEventListener('touchstart', function() {}, { passive: true });
    document.addEventListener('touchmove', function() {}, { passive: true });
    
    // Prevent zoom on double tap for buttons
    const buttons = document.querySelectorAll('button, .cta-button, .nav-link');
    buttons.forEach(button => {
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });
    });
    
    // Improve analytics section scrolling
    improveAnalyticsScrolling();
    
    // Optimize hero section for mobile
    optimizeHeroSection();
}

// Improve scrolling in analytics section
function improveAnalyticsScrolling() {
    const analyticsSection = document.querySelector('#analytics');
    if (!analyticsSection) return;
    
    // Add better touch handling for the analytics section
    analyticsSection.style.webkitOverflowScrolling = 'touch';
    analyticsSection.style.overflowScrolling = 'touch';
    
    // Add passive touch listeners to improve scroll performance
    analyticsSection.addEventListener('touchstart', function() {}, { passive: true });
    analyticsSection.addEventListener('touchmove', function() {}, { passive: true });
    
    // Improve chart container scrolling
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.style.webkitOverflowScrolling = 'touch';
        container.style.overflowScrolling = 'touch';
    });
}

// Optimize hero section for mobile performance
function optimizeHeroSection() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Force hardware acceleration for better performance
    heroSection.style.transform = 'translateZ(0)';
    heroSection.style.backfaceVisibility = 'hidden';
    
    // Optimize background image loading
    const heroBackground = getComputedStyle(heroSection).backgroundImage;
    if (heroBackground && heroBackground !== 'none') {
        // Preload the background image
        const img = new Image();
        img.src = heroBackground.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
        
        // Once loaded, optimize the hero section and adjust positioning
        img.onload = function() {
            heroSection.style.backgroundImage = heroBackground;
            
            // Adjust image positioning based on screen size and orientation
            adjustHeroImagePosition(heroSection, img);
            
            // Remove will-change after image is loaded to save memory
            setTimeout(() => {
                const animatedElements = heroSection.querySelectorAll('.hero-title, .hero-subtitle, .cta-button');
                animatedElements.forEach(el => {
                    el.style.willChange = 'auto';
                });
            }, 1000);
        };
    }
    
    // Reduce animation complexity on mobile
    if (window.innerWidth <= 768) {
        // Use simpler animations on mobile
        const animatedElements = heroSection.querySelectorAll('.hero-title, .hero-subtitle, .cta-button');
        animatedElements.forEach((el, index) => {
            el.style.animationDuration = '0.6s';
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    // Optimize scroll performance for hero section
    heroSection.addEventListener('touchstart', function() {}, { passive: true });
    heroSection.addEventListener('touchmove', function() {}, { passive: true });
    
    // Adjust image position on orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            const img = new Image();
            img.src = heroBackground.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            img.onload = function() {
                adjustHeroImagePosition(heroSection, img);
            };
        }, 500);
    });
    
    // Handle chart resizing on orientation change
    window.addEventListener('orientationchange', function() {
        console.log('Orientation change detected, resizing charts...');
        
        // Immediate resize attempt
        setTimeout(() => {
            resizeAllCharts();
            resizeModalCharts();
        }, 100);
        
        // Additional resize after orientation is fully changed
        setTimeout(() => {
            resizeAllCharts();
            resizeModalCharts();
        }, 500);
        
        // Final resize attempt to ensure proper sizing
        setTimeout(() => {
            resizeAllCharts();
            resizeModalCharts();
        }, 1000);
    });
    
    // Also handle window resize for better responsiveness
    window.addEventListener('resize', debounce(function() {
        resizeAllCharts();
    }, 250));
    
    // Mobile-specific orientation handling
    if (window.innerWidth <= 768) {
        let lastOrientation = window.orientation || 0;
        
        window.addEventListener('orientationchange', function() {
            const currentOrientation = window.orientation || 0;
            
            if (currentOrientation !== lastOrientation) {
                console.log(`Orientation changed from ${lastOrientation} to ${currentOrientation}`);
                lastOrientation = currentOrientation;
                
                // Force chart recreation for mobile orientation changes
                setTimeout(() => {
                    if (window.fuelData && window.fuelData.allRows) {
                        console.log('Recreating charts for mobile orientation change...');
                        createAnalyticsCharts(window.fuelData);
                    }
                }, 300);
            }
        });
    }
}

// Adjust hero image positioning for better mobile fit
function adjustHeroImagePosition(heroSection, img) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    
    // Calculate aspect ratios
    const screenRatio = screenWidth / screenHeight;
    const imgRatio = imgWidth / imgHeight;
    
    // Determine optimal positioning based on screen size and orientation
    if (screenWidth <= 480) {
        // Small screens - position to show most interesting part
        if (screenRatio < 1) {
            // Portrait - position left third, higher to show more content
            heroSection.style.backgroundPosition = '33% 40%';
        } else {
            // Landscape - position to center
            heroSection.style.backgroundPosition = 'center 30%';
        }
    } else if (screenWidth <= 768) {
        // Medium screens
        if (screenRatio < 1) {
            // Portrait - position left third
            heroSection.style.backgroundPosition = '33% 35%';
        } else {
            // Landscape
            heroSection.style.backgroundPosition = 'center 25%';
        }
    } else {
        // Large screens - default positioning
        heroSection.style.backgroundPosition = 'center center';
    }
    
    // Ensure proper background sizing
    heroSection.style.backgroundSize = 'cover';
    heroSection.style.backgroundRepeat = 'no-repeat';
}

// Resize all charts to fit current orientation
function resizeAllCharts() {
    const chartIds = [
        'efficiencyChart', 
        'monthlyChart', 
        'vehicleChart', 
        'costChart',
        'monthlyCostChart',
        'stackedMonthlyChart',
        'yearlyMachineChart',
        'monthlyTrendsChart',
        'modalChartCanvas'
    ];
    
    let chartsResized = 0;
    
    chartIds.forEach(chartId => {
        const chart = Chart.getChart(chartId);
        if (chart) {
            try {
                // Force chart to resize
                chart.resize();
                chartsResized++;
                
                // Additional resize for better mobile handling
                setTimeout(() => {
                    chart.resize();
                }, 100);
            } catch (error) {
                console.warn(`Failed to resize chart ${chartId}:`, error);
            }
        }
    });
    
    console.log(`${chartsResized} charts resized for orientation change`);
    
    // If charts are still not properly sized, recreate them
    setTimeout(() => {
        if (window.fuelData && window.fuelData.allRows) {
            console.log('Recreating charts for better orientation fit...');
            createAnalyticsCharts(window.fuelData);
        }
    }, 500);
}

// Resize modal charts specifically for better mobile fit
function resizeModalCharts() {
    const modalChart = Chart.getChart('modalChartCanvas');
    if (modalChart) {
        try {
            // Force modal chart to resize
            modalChart.resize();
            
            // Additional resize for mobile reliability
            setTimeout(() => {
                modalChart.resize();
            }, 100);
            
            // Adjust modal container if needed
            const modalContent = document.querySelector('.chart-modal-content');
            if (modalContent) {
                // Ensure modal fits screen properly
                const screenHeight = window.innerHeight;
                const screenWidth = window.innerWidth;
                
                if (screenWidth <= 768) {
                    // Mobile optimizations
                    if (window.orientation === 90 || window.orientation === -90) {
                        // Landscape
                        modalContent.style.maxHeight = '95vh';
                        modalContent.style.width = '98%';
                    } else {
                        // Portrait
                        modalContent.style.maxHeight = '90vh';
                        modalContent.style.width = '95%';
                    }
                }
            }
            
            console.log('Modal chart resized for orientation change');
        } catch (error) {
            console.warn('Failed to resize modal chart:', error);
        }
    }
}

// ===== MOBILE CHART TAP FUNCTIONALITY =====

// Add mobile tap functionality to charts
function addMobileChartTapFunctionality(chart, chartId) {
    if (!chart || !chart.canvas) return;
    
    const canvas = chart.canvas;
    let activeTooltip = null;
    
    // Create tooltip element for mobile
    const tooltip = document.createElement('div');
    tooltip.className = 'mobile-chart-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.2s ease;
        max-width: 200px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    // Add tooltip to chart container
    const chartContainer = canvas.closest('.chart-container');
    if (chartContainer) {
        chartContainer.style.position = 'relative';
        chartContainer.appendChild(tooltip);
    }
    
    // Handle tap events
    function handleTap(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Get chart elements at position
        const elements = chart.getElementsAtEventForMode(
            { x, y },
            'nearest',
            { intersect: true },
            false
        );
        
        if (elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            
            // Get data point info
            const dataset = chart.data.datasets[datasetIndex];
            const label = chart.data.labels[index];
            const value = dataset.data[index];
            
            // Create tooltip content
            let tooltipContent = '';
            if (dataset.label) {
                tooltipContent = `${dataset.label}: ${value}`;
            } else {
                tooltipContent = `${label}: ${value}`;
            }
            
            // Add units based on chart type
            if (chartId.includes('efficiency')) {
                tooltipContent += ' L/hr';
            } else if (chartId.includes('cost')) {
                tooltipContent += ' £';
            } else if (chartId.includes('monthly') || chartId.includes('trends')) {
                tooltipContent += ' L';
            }
            
            tooltip.textContent = tooltipContent;
            
            // Position tooltip
            const tooltipRect = tooltip.getBoundingClientRect();
            let tooltipX = e.clientX - tooltipRect.width / 2;
            let tooltipY = e.clientY - tooltipRect.height - 10;
            
            // Keep tooltip within viewport
            if (tooltipX < 10) tooltipX = 10;
            if (tooltipX + tooltipRect.width > window.innerWidth - 10) {
                tooltipX = window.innerWidth - tooltipRect.width - 10;
            }
            if (tooltipY < 10) tooltipY = e.clientY + 10;
            
            tooltip.style.left = tooltipX + 'px';
            tooltip.style.top = tooltipY + 'px';
            tooltip.style.opacity = '1';
            
            activeTooltip = tooltip;
            
            // Hide tooltip after 3 seconds
            setTimeout(() => {
                if (activeTooltip === tooltip) {
                    tooltip.style.opacity = '0';
                    activeTooltip = null;
                }
            }, 3000);
            
        } else {
            // Hide tooltip if tapping outside data points
            if (activeTooltip) {
                activeTooltip.style.opacity = '0';
                activeTooltip = null;
            }
        }
    }
    
    // Add event listeners for mobile with improved scroll handling
    let touchStartTime = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let isScrolling = false;
    
    canvas.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isScrolling = false;
    }, { passive: true });
    
    canvas.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const deltaY = Math.abs(touchY - touchStartY);
        const deltaX = Math.abs(touchX - touchStartX);
        
        // If vertical movement is greater than horizontal, it's likely scrolling
        if (deltaY > deltaX && deltaY > 10) {
            isScrolling = true;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchend', function(e) {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
        const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
        
        // Only handle as tap if it's a short touch and not a scroll
        if (touchDuration < 300 && !isScrolling && deltaY < 10 && deltaX < 10) {
            e.preventDefault();
            handleTap(e.changedTouches[0]);
        }
    }, { passive: false });
    
    // Also add click for desktop testing
    canvas.addEventListener('click', handleTap);
    
    // Hide tooltip when tapping outside
    document.addEventListener('touchstart', function(e) {
        if (!canvas.contains(e.target) && activeTooltip) {
            activeTooltip.style.opacity = '0';
            activeTooltip = null;
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!canvas.contains(e.target) && activeTooltip) {
            activeTooltip.style.opacity = '0';
            activeTooltip = null;
        }
    });
    
    return chart;
}

// ===== ANALYTICS DASHBOARD FUNCTIONS =====

// Initialize analytics dashboard
function initAnalytics() {
    // Set up cost calculator
    const dieselPriceInput = document.getElementById('dieselPrice');
    if (dieselPriceInput) {
        dieselPriceInput.addEventListener('change', updateCostAnalysis);
    }
    
    // Show status message in analytics if no data
    if (!window.fuelData) {
        if (DEV_MODE) {
            showAnalyticsDevMode();
        } else {
            showAnalyticsLoadingMode();
        }
    }
    
    // Load analytics when data is available
    if (window.fuelData) {
        createAnalyticsCharts(window.fuelData);
    }
}

// Show development mode in analytics section
function showAnalyticsDevMode() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6b7280;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🚧</div>
                <p style="text-align: center; font-size: 1.1rem;">Development Mode</p>
                <p style="text-align: center; font-size: 0.9rem; opacity: 0.7;">Charts will appear when data is loaded</p>
            </div>
        `;
    });
    
    // Update summary sections
    const rankingsContainer = document.getElementById('efficiencyRankings');
    const trendsContainer = document.getElementById('monthlyTrends');
    
    if (rankingsContainer) {
        rankingsContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">🚧 Development Mode - Load data to see rankings</p>';
    }
    
    if (trendsContainer) {
        trendsContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">🚧 Development Mode - Load data to see trends</p>';
    }
}

// Show production mode in analytics section
function showAnalyticsLoadingMode() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6b7280;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                <p style="text-align: center; font-size: 1.1rem;">Loading Analytics...</p>
                <p style="text-align: center; font-size: 0.9rem; opacity: 0.7;">Charts will appear automatically when data loads</p>
            </div>
        `;
    });
    
    // Update summary sections
    const rankingsContainer = document.getElementById('efficiencyRankings');
    const trendsContainer = document.getElementById('monthlyTrends');
    
    if (rankingsContainer) {
        rankingsContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">📊 Loading efficiency rankings...</p>';
    }
    
    if (trendsContainer) {
        trendsContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">📊 Loading monthly trends...</p>';
    }
}

// Show analytics error
function showAnalyticsError() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #ef4444;">
                <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
                <p style="text-align: center; font-size: 1.1rem;">Chart Error</p>
                <p style="text-align: center; font-size: 0.9rem; opacity: 0.7;">Check console for details</p>
            </div>
        `;
    });
    
    // Update summary sections
    const rankingsContainer = document.getElementById('efficiencyRankings');
    const trendsContainer = document.getElementById('monthlyTrends');
    
    if (rankingsContainer) {
        rankingsContainer.innerHTML = '<p style="text-align: center; color: #ef4444;">⚠️ Error loading rankings</p>';
    }
    
    if (trendsContainer) {
        trendsContainer.innerHTML = '<p style="text-align: center; color: #ef4444;">⚠️ Error loading trends</p>';
    }
}

// Update cost analysis based on diesel price
function updateCostAnalysis() {
    const dieselPrice = parseFloat(document.getElementById('dieselPrice').value) || 0.70;
    
    if (window.fuelData && window.fuelData.allRows) {
        // Destroy existing cost charts before recreating
        const costChartIds = ['costChart', 'monthlyCostChart'];
        costChartIds.forEach(chartId => {
            const existingChart = Chart.getChart(chartId);
            if (existingChart) {
                existingChart.destroy();
                console.log(`Destroyed existing chart: ${chartId}`);
            }
        });
        
        const costData = calculateCosts(window.fuelData.allRows, dieselPrice);
        updateCostDisplay(costData);
        createCostChart(costData);
        createMonthlyCostChart(window.fuelData.allRows, dieselPrice);
        
        // Also update efficiency rankings and monthly trends
        updateEfficiencyRankings(window.fuelData.allRows);
        updateMonthlyTrends(window.fuelData.allRows);
    }
}

// Calculate costs for all data
function calculateCosts(rows, dieselPrice) {
    const vehicleCosts = {};
    let totalCost = 0;
    let monthlyCost = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    rows.forEach(row => {
        const vehicle = row[1]; // Machine column
        const litres = parseFloat(row[2]) || 0; // Litres column
        const timestamp = row[0]; // Timestamp column
        
        const cost = litres * dieselPrice;
        totalCost += cost;
        
        // Track by machine
        if (!vehicleCosts[vehicle]) {
            vehicleCosts[vehicle] = { total: 0, monthly: 0 };
        }
        vehicleCosts[vehicle].total += cost;
        
        // Check if this month
        if (timestamp) {
            const date = new Date(timestamp);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                monthlyCost += cost;
                vehicleCosts[vehicle].monthly += cost;
            }
        }
    });
    
    return {
        totalCost,
        monthlyCost,
        vehicleCosts
    };
}

// Update cost display
function updateCostDisplay(costData) {
    document.getElementById('monthlyCost').textContent = `£${costData.monthlyCost.toFixed(2)}`;
    document.getElementById('totalCost').textContent = `£${costData.totalCost.toFixed(2)}`;
}

// Create all analytics charts
function createAnalyticsCharts(data) {
    console.log('Creating Chart.js analytics charts...');
    
    if (!data || !data.allRows) {
        console.error('No data available for analytics');
        return;
    }
    
    console.log('Data available, rows:', data.allRows.length);
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Destroy existing charts first
    destroyAllCharts();
    
    // First, ensure canvas elements are properly restored
    restoreChartCanvases();
    
    try {
        console.log('Creating efficiency chart...');
        createEfficiencyChart(data.allRows);
    } catch (error) {
        console.error('Error creating efficiency chart:', error);
    }
    
    try {
        console.log('Creating monthly chart...');
        createMonthlyChart(data.allRows);
    } catch (error) {
        console.error('Error creating monthly chart:', error);
    }
    
    try {
        console.log('Creating vehicle chart...');
        createVehicleChart(data.allRows);
    } catch (error) {
        console.error('Error creating vehicle chart:', error);
    }
    
    try {
        console.log('Creating cost chart...');
        const dieselPrice = parseFloat(document.getElementById('dieselPrice').value) || 0.70;
        const costData = calculateCosts(data.allRows, dieselPrice);
        updateCostDisplay(costData);
        createCostChart(costData);
    } catch (error) {
        console.error('Error creating cost chart:', error);
    }
    
    try {
        console.log('Creating monthly cost chart...');
        const dieselPrice = parseFloat(document.getElementById('dieselPrice').value) || 0.70;
        createMonthlyCostChart(data.allRows, dieselPrice);
    } catch (error) {
        console.error('Error creating monthly cost chart:', error);
    }
    
    try {
        console.log('Creating stacked monthly chart...');
        createStackedMonthlyChart(data.allRows);
    } catch (error) {
        console.error('Error creating stacked monthly chart:', error);
    }
    
    try {
        console.log('Creating yearly machine chart...');
        createYearlyMachineChart(data.allRows);
    } catch (error) {
        console.error('Error creating yearly machine chart:', error);
    }
    
    try {
        console.log('Creating monthly trends chart...');
        createMonthlyTrendsChart(data.allRows);
    } catch (error) {
        console.error('Error creating monthly trends chart:', error);
    }
    
    // Update summary sections
    try {
        updateEfficiencyRankings(data.allRows);
        updateMonthlyTrends(data.allRows);
        console.log('Summary sections updated');
    } catch (error) {
        console.error('Error updating summary sections:', error);
    }
    
    console.log('All charts created successfully');
    
    // Setup modal listeners for chart cards
    setupChartModalListeners();
}

// Function to destroy all existing charts
function destroyAllCharts() {
    const chartIds = [
        'efficiencyChart', 
        'monthlyChart', 
        'vehicleChart', 
        'costChart',
        'monthlyCostChart',
        'stackedMonthlyChart',
        'yearlyMachineChart',
        'monthlyTrendsChart'
    ];
    
    chartIds.forEach(chartId => {
        const existingChart = Chart.getChart(chartId);
        if (existingChart) {
            existingChart.destroy();
            console.log(`Destroyed existing chart: ${chartId}`);
        }
    });
}

// Function to restore chart canvas elements
function restoreChartCanvases() {
    const chartContainers = document.querySelectorAll('.chart-container');
    const canvasIds = [
        'efficiencyChart', 
        'monthlyChart', 
        'vehicleChart', 
        'costChart',
        'monthlyCostChart',
        'stackedMonthlyChart',
        'yearlyMachineChart',
        'monthlyTrendsChart'
    ];
    
    chartContainers.forEach((container, index) => {
        if (index < canvasIds.length) {
            // Clear all placeholder content first
            container.innerHTML = '';
            
            // Create new canvas
            const canvas = document.createElement('canvas');
            canvas.id = canvasIds[index];
            container.appendChild(canvas);
            console.log(`Created canvas: ${canvasIds[index]}`);
        }
    });
}

// Function to wait for Chart.js to load
function waitForChartJS(callback, maxAttempts = 10) {
    let attempts = 0;
    
    function checkChartJS() {
        attempts++;
        console.log(`Checking for Chart.js (attempt ${attempts})...`);
        
        if (typeof Chart !== 'undefined') {
            console.log('Chart.js is available!');
            callback();
        } else if (attempts < maxAttempts) {
            console.log('Chart.js not ready, waiting...');
            setTimeout(checkChartJS, 500);
        } else {
            console.error('Chart.js failed to load after maximum attempts');
        }
    }
    
    checkChartJS();
}

// Function to create charts when analytics section becomes visible
function createChartsWhenVisible() {
    console.log('Creating analytics charts...');
    
    if (!window.fuelData) {
        console.log('No data available. Please load data first.');
        return;
    }
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        // Ensure chart containers are properly set up
        restoreChartCanvases();
        
        // Wait for Chart.js to be available
        waitForChartJS(() => {
            createAnalyticsCharts(window.fuelData);
        });
    }, 100);
}

// Manual chart creation function for testing
function createChartsNow() {
    console.log('Manual chart creation triggered...');
    
    if (window.fuelData) {
        console.log('Data available, waiting for Chart.js...');
        waitForChartJS(() => {
            createAnalyticsCharts(window.fuelData);
        });
    } else {
        console.log('No data available. Load data first.');
    }
}

// Make it available globally for testing
window.createChartsNow = createChartsNow;

// Debug function to check chart elements
function debugChartElements() {
    console.log('=== Chart Elements Debug ===');
    console.log('Chart containers:', document.querySelectorAll('.chart-container'));
    console.log('Canvas elements:', document.querySelectorAll('canvas'));
    console.log('Canvas IDs:');
    document.querySelectorAll('canvas').forEach(canvas => {
        console.log('-', canvas.id, canvas);
    });
    console.log('Chart.js available:', typeof Chart !== 'undefined');
    console.log('Fuel data available:', !!window.fuelData);
    if (window.fuelData) {
        console.log('Fuel data rows:', window.fuelData.allRows.length);
    }
}

// Make debug function available globally
window.debugChartElements = debugChartElements;

// ===== CHART MODAL FUNCTIONS =====

// Global variable to store the current chart data for modal
let currentModalChartData = null;

// Open chart modal
function openChartModal(chartId, chartTitle) {
    console.log(`Opening modal for chart: ${chartId}`);
    
    const modal = document.getElementById('chartModal');
    const modalTitle = document.getElementById('modalChartTitle');
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    if (!modal || !modalTitle || !modalCanvas) {
        console.error('Modal elements not found');
        return;
    }
    
    // Set the modal title
    modalTitle.textContent = chartTitle;
    
    // Show the modal
    modal.classList.add('show');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Recreate the chart in the modal
    recreateChartInModal(chartId);
}

// Close chart modal
function closeChartModal() {
    const modal = document.getElementById('chartModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Destroy the modal chart
        const modalChart = Chart.getChart('modalChartCanvas');
        if (modalChart) {
            modalChart.destroy();
        }
    }
}

// Recreate chart in modal
function recreateChartInModal(chartId) {
    if (!window.fuelData || !window.fuelData.allRows) {
        console.error('No fuel data available for modal chart');
        return;
    }
    
    const modalCanvas = document.getElementById('modalChartCanvas');
    if (!modalCanvas) {
        console.error('Modal canvas not found');
        return;
    }
    
    // Destroy any existing chart in modal
    const existingModalChart = Chart.getChart('modalChartCanvas');
    if (existingModalChart) {
        existingModalChart.destroy();
    }
    
    // Create the chart based on the chartId
    switch (chartId) {
        case 'efficiencyChart':
            createModalEfficiencyChart(window.fuelData.allRows);
            break;
        case 'monthlyChart':
            createModalMonthlyChart(window.fuelData.allRows);
            break;
        case 'vehicleChart':
            createModalVehicleChart(window.fuelData.allRows);
            break;
        case 'costChart':
            const dieselPrice = parseFloat(document.getElementById('dieselPrice').value) || 0.70;
            const costData = calculateCosts(window.fuelData.allRows, dieselPrice);
            createModalCostChart(costData);
            break;
        case 'monthlyCostChart':
            const dieselPrice2 = parseFloat(document.getElementById('dieselPrice').value) || 0.70;
            createModalMonthlyCostChart(window.fuelData.allRows, dieselPrice2);
            break;
        case 'stackedMonthlyChart':
            createModalStackedMonthlyChart(window.fuelData.allRows);
            break;
        case 'yearlyMachineChart':
            createModalYearlyMachineChart(window.fuelData.allRows);
            break;
        case 'monthlyTrendsChart':
            createModalMonthlyTrendsChart(window.fuelData.allRows);
            break;
        default:
            console.error(`Unknown chart ID: ${chartId}`);
    }
}

// Modal chart creation functions
function createModalEfficiencyChart(rows) {
    const efficiencyData = calculateEfficiency(rows);
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    const chart = new Chart(modalCanvas, {
        type: 'bar',
        data: {
            labels: efficiencyData.vehicles,
            datasets: [{
                label: 'Litres per Hour',
                data: efficiencyData.efficiency,
                backgroundColor: [
                    '#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                ],
                borderColor: '#e5e7eb',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'modalEfficiencyChart');
}

function createModalMonthlyChart(rows) {
    const monthlyData = calculateMonthlyConsumption(rows);
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    new Chart(modalCanvas, {
        type: 'line',
        data: {
            labels: monthlyData.months,
            datasets: [{
                label: 'Total Litres',
                data: monthlyData.litres,
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

function createModalVehicleChart(rows) {
    const vehicleData = calculateVehicleUsage(rows);
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    new Chart(modalCanvas, {
        type: 'doughnut',
        data: {
            labels: vehicleData.vehicles,
            datasets: [{
                data: vehicleData.litres,
                backgroundColor: [
                    '#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                ],
                borderColor: '#e5e7eb',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#1f2937',
                        padding: 20,
                        font: { size: 14 }
                    }
                }
            }
        }
    });
}

function createModalCostChart(costData) {
    const vehicles = Object.keys(costData.vehicleCosts);
    const costs = vehicles.map(vehicle => costData.vehicleCosts[vehicle].total);
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    new Chart(modalCanvas, {
        type: 'bar',
        data: {
            labels: vehicles,
            datasets: [{
                label: 'Total Cost (£)',
                data: costs,
                backgroundColor: '#f59e0b',
                borderColor: '#e5e7eb',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 },
                        callback: function(value) {
                            return '£' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

function createModalMonthlyCostChart(rows, dieselPrice) {
    const monthlyCostData = calculateMonthlyCosts(rows, dieselPrice);
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    new Chart(modalCanvas, {
        type: 'line',
        data: {
            labels: monthlyCostData.months,
            datasets: [{
                label: 'Cost (£)',
                data: monthlyCostData.costs,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 },
                        callback: function(value) {
                            return '£' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

function createModalStackedMonthlyChart(rows) {
    const stackedData = calculateStackedMonthlyData(rows);
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    new Chart(modalCanvas, {
        type: 'bar',
        data: {
            labels: stackedData.months,
            datasets: stackedData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

function createModalYearlyMachineChart(rows) {
    const yearlyData = calculateYearlyMachineData(rows);
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    new Chart(modalCanvas, {
        type: 'bar',
        data: {
            labels: yearlyData.years,
            datasets: yearlyData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

function createModalMonthlyTrendsChart(rows) {
    const trendsData = calculateMonthlyTrendsData(rows);
    const modalCanvas = document.getElementById('modalChartCanvas');
    
    new Chart(modalCanvas, {
        type: 'bar',
        data: {
            labels: trendsData.months,
            datasets: [{
                label: 'Total Fuel (L)',
                data: trendsData.litres,
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

// Add click event listeners to chart cards
function setupChartModalListeners() {
    const chartCards = document.querySelectorAll('.chart-card');
    
    chartCards.forEach(card => {
        card.addEventListener('click', function() {
            const canvas = this.querySelector('canvas');
            const title = this.querySelector('h4').textContent;
            
            if (canvas && canvas.id) {
                openChartModal(canvas.id, title);
            }
        });
    });
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    // Chart modal event listeners
    const chartModal = document.getElementById('chartModal');
    if (chartModal) {
        chartModal.addEventListener('click', function(e) {
            if (e.target === chartModal) {
                closeChartModal();
            }
        });
    }
    
    // Form modal event listeners
    const formModal = document.getElementById('formModal');
    if (formModal) {
        formModal.addEventListener('click', function(e) {
            if (e.target === formModal) {
                closeFormModal();
            }
        });
    }
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeChartModal();
            closeFormModal();
        }
    });
});

// Make functions available globally
window.openChartModal = openChartModal;
window.closeChartModal = closeChartModal;

// ===== FORM MODAL FUNCTIONS =====

// Open form modal
function openFormModal() {
    console.log('Opening form modal...');
    
    const modal = document.getElementById('formModal');
    if (!modal) {
        console.error('Form modal not found');
        return;
    }
    
    // Show the modal
    modal.classList.add('show');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    console.log('Form modal opened successfully');
}

// Close form modal
function closeFormModal() {
    console.log('Closing form modal...');
    
    const modal = document.getElementById('formModal');
    if (!modal) {
        console.error('Form modal not found');
        return;
    }
    
    // Hide the modal
    modal.classList.remove('show');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    console.log('Form modal closed successfully');
}

// Make form modal functions available globally
window.openFormModal = openFormModal;
window.closeFormModal = closeFormModal;

    // Calculate total hours across all machines
function calculateTotalHours(rows) {
    // Group rows by machine and sort by timestamp
    const vehicleGroups = {};
    
    rows.forEach(row => {
        const vehicle = row[1];
        const timestamp = row[0];
        const hours = parseFloat(row[3]) || 0;
        
        if (!vehicleGroups[vehicle]) {
            vehicleGroups[vehicle] = [];
        }
        
        vehicleGroups[vehicle].push({
            timestamp: new Date(timestamp),
            hours: hours
        });
    });
    
    // Sort each machine's data by timestamp (oldest first)
    Object.keys(vehicleGroups).forEach(vehicle => {
        vehicleGroups[vehicle].sort((a, b) => a.timestamp - b.timestamp);
    });
    
    let totalHours = 0;
    
    Object.keys(vehicleGroups).forEach(vehicle => {
        const vehicleLogs = vehicleGroups[vehicle];
        
        // Calculate hours by finding the difference between consecutive readings
        for (let i = 1; i < vehicleLogs.length; i++) {
            const currentLog = vehicleLogs[i];
            const previousLog = vehicleLogs[i - 1];
            
            const hoursUsed = currentLog.hours - previousLog.hours;
            
            // Only include if hours difference is positive and reasonable
            if (hoursUsed > 0 && hoursUsed < 1000) { // Sanity check for hours
                totalHours += hoursUsed;
            }
        }
    });
    
    return totalHours;
}

    // Calculate efficiency (litres per hour) for each machine
function calculateEfficiency(rows) {
    // Group rows by machine and sort by timestamp
    const vehicleGroups = {};
    
    rows.forEach(row => {
        const vehicle = row[1];
        const timestamp = row[0];
        const litres = parseFloat(row[2]) || 0;
        const hours = parseFloat(row[3]) || 0;
        
        if (!vehicleGroups[vehicle]) {
            vehicleGroups[vehicle] = [];
        }
        
        vehicleGroups[vehicle].push({
            timestamp: new Date(timestamp),
            litres: litres,
            hours: hours
        });
    });
    
    // Sort each machine's data by timestamp (oldest first)
    Object.keys(vehicleGroups).forEach(vehicle => {
        vehicleGroups[vehicle].sort((a, b) => a.timestamp - b.timestamp);
    });
    
    const vehicles = [];
    const efficiency = [];
    
    Object.keys(vehicleGroups).forEach(vehicle => {
        const vehicleLogs = vehicleGroups[vehicle];
        let totalLitres = 0;
        let totalHours = 0;
        
        // Calculate efficiency by finding the difference between consecutive readings
        for (let i = 1; i < vehicleLogs.length; i++) {
            const currentLog = vehicleLogs[i];
            const previousLog = vehicleLogs[i - 1];
            
            const litresUsed = currentLog.litres;
            const hoursUsed = currentLog.hours - previousLog.hours;
            
            // Only include if hours difference is positive and reasonable
            if (hoursUsed > 0 && hoursUsed < 1000) { // Sanity check for hours
                totalLitres += litresUsed;
                totalHours += hoursUsed;
            }
        }
        
        // Calculate efficiency if we have valid data
        if (totalHours > 0) {
            const avgEfficiency = totalLitres / totalHours;
            vehicles.push(vehicle);
            efficiency.push(avgEfficiency.toFixed(2));
            
            console.log(`Vehicle ${vehicle}: ${totalLitres}L / ${totalHours}h = ${avgEfficiency.toFixed(2)} L/h`);
        }
    });
    
    return { vehicles, efficiency };
}

// Calculate monthly consumption
function calculateMonthlyConsumption(rows) {
    const monthlyData = {};
    
    rows.forEach(row => {
        const timestamp = row[0];
        const litres = parseFloat(row[2]) || 0;
        
        if (timestamp) {
            const date = new Date(timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += litres;
        }
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const months = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    });
    
    const litres = sortedMonths.map(month => monthlyData[month]);
    
    return { months, litres };
}

// Calculate monthly costs
function calculateMonthlyCosts(rows, dieselPrice) {
    const monthlyData = {};
    
    rows.forEach(row => {
        const timestamp = row[0];
        const litres = parseFloat(row[2]) || 0;
        
        if (timestamp) {
            const date = new Date(timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += litres * dieselPrice;
        }
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const months = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    });
    
    const costs = sortedMonths.map(month => monthlyData[month]);
    
    return { months, costs };
}

// Calculate stacked monthly data by vehicle
function calculateStackedMonthlyData(rows) {
    const monthlyData = {};
    const vehicles = new Set();
    
    rows.forEach(row => {
        const timestamp = row[0];
        const vehicle = row[1];
        const litres = parseFloat(row[2]) || 0;
        
        if (timestamp) {
            const date = new Date(timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {};
            }
            
            if (!monthlyData[monthKey][vehicle]) {
                monthlyData[monthKey][vehicle] = 0;
            }
            
            monthlyData[monthKey][vehicle] += litres;
            vehicles.add(vehicle);
        }
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const months = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    });
    
    const vehicleArray = Array.from(vehicles);
    const colors = [
        '#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    
    const datasets = vehicleArray.map((vehicle, index) => {
        const data = sortedMonths.map(monthKey => {
            return monthlyData[monthKey]?.[vehicle] || 0;
        });
        
        return {
            label: vehicle,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 1
        };
    });
    
    console.log('Stacked monthly data:', { months, datasets });
    return { months, datasets };
}

// Calculate yearly machine data
function calculateYearlyMachineData(rows) {
    const yearlyData = {};
    const vehicles = new Set();
    
    rows.forEach(row => {
        const timestamp = row[0];
        const vehicle = row[1];
        const litres = parseFloat(row[2]) || 0;
        
        if (timestamp) {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            
            if (!yearlyData[year]) {
                yearlyData[year] = {};
            }
            
            if (!yearlyData[year][vehicle]) {
                yearlyData[year][vehicle] = 0;
            }
            
            yearlyData[year][vehicle] += litres;
            vehicles.add(vehicle);
        }
    });
    
    const years = Object.keys(yearlyData).sort();
    const vehicleArray = Array.from(vehicles);
    const colors = [
        '#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    
    const datasets = vehicleArray.map((vehicle, index) => {
        const data = years.map(year => yearlyData[year]?.[vehicle] || 0);
        
        return {
            label: vehicle,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 1
        };
    });
    
    return { years, datasets };
}

// Calculate vehicle usage breakdown
function calculateVehicleUsage(rows) {
    const vehicleData = {};
    
    rows.forEach(row => {
        const vehicle = row[1];
        const litres = parseFloat(row[2]) || 0;
        
        if (!vehicleData[vehicle]) {
            vehicleData[vehicle] = 0;
        }
        vehicleData[vehicle] += litres;
    });
    
    const vehicles = Object.keys(vehicleData);
    const litres = Object.values(vehicleData);
    
    return { vehicles, litres };
}

// Create efficiency chart
function createEfficiencyChart(rows) {
    console.log('Creating efficiency chart with data:', rows.length, 'rows');
    const efficiencyData = calculateEfficiency(rows);
    console.log('Efficiency data:', efficiencyData);
    
    const ctx = document.getElementById('efficiencyChart');
    if (!ctx) {
        console.error('Efficiency chart canvas not found. Available elements:');
        console.log('Canvas elements:', document.querySelectorAll('canvas'));
        console.log('Chart containers:', document.querySelectorAll('.chart-container'));
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('efficiencyChart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    console.log('Found efficiency chart canvas:', ctx);
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: efficiencyData.vehicles,
            datasets: [{
                label: 'Litres per Hour',
                data: efficiencyData.efficiency,
                backgroundColor: [
                    '#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                ],
                borderColor: '#e5e7eb',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'efficiencyChart');
    
    console.log('Efficiency chart created successfully');
}

// Create monthly chart
function createMonthlyChart(rows) {
    const monthlyData = calculateMonthlyConsumption(rows);
    
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) {
        console.error('Monthly chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('monthlyChart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.months,
            datasets: [{
                label: 'Total Litres',
                data: monthlyData.litres,
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'monthlyChart');
    
    console.log('Monthly chart created successfully');
}

// Create vehicle chart
function createVehicleChart(rows) {
    const vehicleData = calculateVehicleUsage(rows);
    
    const ctx = document.getElementById('vehicleChart');
    if (!ctx) {
        console.error('Vehicle chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('vehicleChart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: vehicleData.vehicles,
            datasets: [{
                data: vehicleData.litres,
                backgroundColor: [
                    '#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                ],
                borderColor: '#e5e7eb',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#1f2937',
                        padding: 20
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'vehicleChart');
    
    console.log('Vehicle chart created successfully');
}

// Create cost chart
function createCostChart(costData) {
    const ctx = document.getElementById('costChart');
    if (!ctx) {
        console.error('Cost chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('costChart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    const vehicles = Object.keys(costData.vehicleCosts);
    const costs = vehicles.map(vehicle => costData.vehicleCosts[vehicle].total);
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: vehicles,
            datasets: [{
                label: 'Total Cost (£)',
                data: costs,
                backgroundColor: '#f59e0b',
                borderColor: '#e5e7eb',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        callback: function(value) {
                            return '£' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'costChart');
    
    console.log('Cost chart created successfully');
}

// Create monthly cost chart
function createMonthlyCostChart(rows, dieselPrice) {
    const monthlyCostData = calculateMonthlyCosts(rows, dieselPrice);
    
    const ctx = document.getElementById('monthlyCostChart');
    if (!ctx) {
        console.error('Monthly cost chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('monthlyCostChart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyCostData.months,
            datasets: [{
                label: 'Cost (£)',
                data: monthlyCostData.costs,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280',
                        callback: function(value) {
                            return '£' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'monthlyCostChart');
    
    console.log('Monthly cost chart created successfully');
}

// Create stacked monthly chart
function createStackedMonthlyChart(rows) {
    console.log('Creating stacked monthly chart with data:', rows.length, 'rows');
    const stackedData = calculateStackedMonthlyData(rows);
    console.log('Stacked data for chart:', stackedData);
    
    const ctx = document.getElementById('stackedMonthlyChart');
    if (!ctx) {
        console.error('Stacked monthly chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('stackedMonthlyChart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stackedData.months,
            datasets: stackedData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937'
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'stackedMonthlyChart');
    
    console.log('Stacked monthly chart created successfully');
}

// Create yearly machine chart
function createYearlyMachineChart(rows) {
    const yearlyData = calculateYearlyMachineData(rows);
    
    const ctx = document.getElementById('yearlyMachineChart');
    if (!ctx) {
        console.error('Yearly machine chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('yearlyMachineChart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yearlyData.years,
            datasets: yearlyData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'yearlyMachineChart');
    
    console.log('Yearly machine chart created successfully');
}

// Create monthly trends chart
function createMonthlyTrendsChart(rows) {
    const trendsData = calculateMonthlyTrendsData(rows);
    
    const ctx = document.getElementById('monthlyTrendsChart');
    if (!ctx) {
        console.error('Monthly trends chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('monthlyTrendsChart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trendsData.months,
            datasets: [{
                label: 'Total Fuel (L)',
                data: trendsData.litres,
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#1f2937'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Add mobile tap functionality
    addMobileChartTapFunctionality(chart, 'monthlyTrendsChart');
    
    console.log('Monthly trends chart created successfully');
}

// Calculate monthly trends data
function calculateMonthlyTrendsData(rows) {
    const monthlyData = {};
    
    rows.forEach(row => {
        const timestamp = row[0];
        const litres = parseFloat(row[2]) || 0;
        
        if (timestamp) {
            const date = new Date(timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += litres;
        }
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const months = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    });
    
    const litres = sortedMonths.map(month => monthlyData[month]);
    
    return { months, litres };
}

// Update efficiency rankings
function updateEfficiencyRankings(rows) {
    const efficiencyData = calculateEfficiency(rows);
    const rankings = efficiencyData.vehicles.map((vehicle, index) => ({
        vehicle,
        efficiency: efficiencyData.efficiency[index]
    })).sort((a, b) => parseFloat(a.efficiency) - parseFloat(b.efficiency));
    
    const rankingsContainer = document.getElementById('efficiencyRankings');
    if (!rankingsContainer) return;
    
    rankingsContainer.innerHTML = rankings.map((item, index) => `
        <div class="ranking-item">
            <span class="vehicle-name">${index + 1}. ${item.vehicle}</span>
            <span class="efficiency-value">${item.efficiency} L/hr</span>
        </div>
    `).join('');
}

// Update monthly trends
function updateMonthlyTrends(rows) {
    const monthlyData = calculateMonthlyConsumption(rows);
    const trendsContainer = document.getElementById('monthlyTrends');
    if (!trendsContainer) return;
    
    const recentMonths = monthlyData.months.slice(-6); // Last 6 months
    const recentLitres = monthlyData.litres.slice(-6);
    
    trendsContainer.innerHTML = recentMonths.map((month, index) => `
        <div class="trend-item">
            <span class="vehicle-name">${month}</span>
            <span class="efficiency-value">${recentLitres[index].toFixed(0)} L</span>
        </div>
    `).join('');
}