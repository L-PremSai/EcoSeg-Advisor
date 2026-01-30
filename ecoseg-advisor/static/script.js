// EcoSeg Advisor - Frontend JavaScript
// Implements user interaction and API communication

class EcoSegApp {
    constructor() {
        this.form = document.getElementById('wasteForm');
        this.wasteItemInput = document.getElementById('wasteItem');
        this.citySelect = document.getElementById('city');
        this.classifyBtn = document.getElementById('classifyBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.clarificationSection = document.getElementById('clarificationSection');
        this.loading = document.getElementById('loading');
        
        this.initializeEventListeners();
        this.initializeExamples();
    }
    
    initializeEventListeners() {
        // Main form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.classifyWaste();
        });
        
        // Try again button for clarifications
        document.getElementById('tryAgainBtn').addEventListener('click', () => {
            this.hideSections();
            this.wasteItemInput.focus();
        });
        
        // Enter key support
        this.wasteItemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.classifyWaste();
            }
        });
    }
    
    initializeExamples() {
        // Add example suggestions for better user experience
        const examples = [
            'empty plastic bottle with label',
            'kitchen vegetable peels',
            'old mobile phone',
            'expired medicines',
            'newspaper',
            'food leftovers',
            'battery',
            'glass jar'
        ];
        
        // Simple example rotation on input focus
        let exampleIndex = 0;
        this.wasteItemInput.addEventListener('focus', () => {
            if (!this.wasteItemInput.value) {
                this.wasteItemInput.placeholder = `e.g., ${examples[exampleIndex]}`;
                exampleIndex = (exampleIndex + 1) % examples.length;
            }
        });
    }
    
    async classifyWaste() {
        const item = this.wasteItemInput.value.trim();
        const city = this.citySelect.value;
        
        // Input validation
        if (!item) {
            this.showError('Please describe your waste item');
            return;
        }
        
        if (item.length < 3) {
            this.showError('Please provide a more detailed description');
            return;
        }
        
        try {
            this.showLoading();
            
            // API call to backend
            const response = await fetch('/classify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    item: item,
                    city: city
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Classification failed');
            }
            
            this.hideLoading();
            
            // Handle different response types
            if (data.clarification_needed) {
                this.showClarification(data);
            } else {
                this.showResults(data);
            }
            
        } catch (error) {
            this.hideLoading();
            this.showError(`Error: ${error.message}`);
            console.error('Classification error:', error);
        }
    }
    
    showResults(data) {
        this.hideSections();
        
        // Populate result fields
        document.getElementById('wasteCategory').textContent = data.waste_category;
        document.getElementById('binColor').textContent = data.bin_color;
        document.getElementById('preparation').textContent = data.preparation;
        document.getElementById('disposal').textContent = data.disposal;
        document.getElementById('reasoning').textContent = data.reasoning;
        document.getElementById('citation').textContent = data.citation;
        
        // Show results section
        this.resultsSection.style.display = 'block';
        
        // Smooth scroll to results
        this.resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        // Analytics tracking (demo purposes)
        this.trackClassification(data.waste_category);
    }
    
    showClarification(data) {
        this.hideSections();
        
        document.getElementById('clarificationQuestion').textContent = data.question;
        this.clarificationSection.style.display = 'block';
        
        // Scroll to clarification
        this.clarificationSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    showLoading() {
        this.hideSections();
        this.loading.style.display = 'block';
        this.classifyBtn.disabled = true;
        this.classifyBtn.innerHTML = '<span>🔄 Analyzing...</span>';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
        this.classifyBtn.disabled = false;
        this.classifyBtn.innerHTML = '<span>🔍 Check Waste Category</span>';
    }
    
    hideSections() {
        this.resultsSection.style.display = 'none';
        this.clarificationSection.style.display = 'none';
        this.loading.style.display = 'none';
    }
    
    showError(message) {
        // Simple error display
        alert(`❌ ${message}`);
        this.hideLoading();
    }
    
    trackClassification(category) {
        // Demo analytics - in production, use proper analytics
        console.log(`✅ Classification completed: ${category}`);
        
        // Could integrate with Google Analytics, Mixpanel, etc.
        // gtag('event', 'waste_classified', {
        //     'event_category': 'engagement',
        //     'event_label': category
        // });
    }
}

// Utility functions for enhanced UX
class UIEnhancements {
    static addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                document.getElementById('classifyBtn').click();
            }
            
            // Escape to clear form
            if (e.key === 'Escape') {
                document.getElementById('wasteItem').value = '';
                document.getElementById('wasteItem').focus();
            }
        });
    }
    
    static addProgressiveEnhancement() {
        // Check if JavaScript is working
        document.body.classList.add('js-enabled');
        
        // Add loading states for better perceived performance
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.add('has-content');
            });
        });
    }
    
    static addAccessibilityFeatures() {
        // Announce results to screen readers
        const resultsSection = document.getElementById('resultsSection');
        const observer = new MutationObserver(() => {
            if (resultsSection.style.display === 'block') {
                resultsSection.setAttribute('aria-live', 'polite');
                resultsSection.focus();
            }
        });
        
        observer.observe(resultsSection, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌱 EcoSeg Advisor initialized');
    console.log('🎯 Supporting UN SDG 12: Responsible Consumption & Production');
    
    // Initialize main application
    new EcoSegApp();
    
    // Add enhanced features
    UIEnhancements.addKeyboardShortcuts();
    UIEnhancements.addProgressiveEnhancement();
    UIEnhancements.addAccessibilityFeatures();
    
    // Service worker for offline capability (optional enhancement)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/sw.js')
            .then(() => console.log('📱 Service Worker registered'))
            .catch(() => console.log('📱 Service Worker registration failed'));
    }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcoSegApp, UIEnhancements };
}
