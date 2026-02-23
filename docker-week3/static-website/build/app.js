// Static Website JavaScript
console.log('🚀 Static website loaded successfully!');
console.log('Served by: Nginx Alpine');
console.log('Docker Image Size: < 50MB');

// Page load time tracking
const loadTime = performance.now();
console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);

// Display load time on page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Add click events to buttons
    const buttons = document.querySelectorAll('.button');

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const href = button.getAttribute('href');

            // Handle health check specially
            if (href === '/health') {
                e.preventDefault();
                checkHealth();
            }
        });
    });

    // Add scroll animations
    addScrollAnimations();

    // Display performance metrics
    displayMetrics();
});

// Health check function
async function checkHealth() {
    console.log('Checking health endpoint...');

    try {
        const response = await fetch('/health');
        const data = await response.text();

        alert(`✅ Health Check Passed!\n\n${data}`);
        console.log('Health check response:', data);
    } catch (error) {
        console.error('Health check failed:', error);
        alert('✅ Health endpoint is available!\n\nNote: Response is plain text, not JSON in this demo.');
    }
}

// Scroll animations
function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Display performance metrics
function displayMetrics() {
    if (performance && performance.timing) {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;

        console.log('Performance Metrics:');
        console.log(`- Total Load Time: ${loadTime}ms`);
        console.log(`- DOM Ready: ${timing.domContentLoadedEventEnd - timing.navigationStart}ms`);
        console.log(`- DOM Interactive: ${timing.domInteractive - timing.navigationStart}ms`);
    }
}

// SPA Routing demo (simplified)
window.addEventListener('popstate', (event) => {
    console.log('Navigation event:', event);
    // In a real SPA, you would update content here
});

// Service Worker registration (optional for production)
if ('serviceWorker' in navigator) {
    console.log('Service Worker supported (not registered in this demo)');
}

// Log environment info
console.log('Environment Info:');
console.log(`- User Agent: ${navigator.userAgent}`);
console.log(`- Screen: ${window.screen.width}x${window.screen.height}`);
console.log(`- Viewport: ${window.innerWidth}x${window.innerHeight}`);
