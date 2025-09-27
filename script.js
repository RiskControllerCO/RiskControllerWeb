// Language management
class LanguageManager {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTranslations();
        this.setLanguage(this.getPreferredLanguage());
    }

    getPreferredLanguage() {
        const saved = localStorage.getItem('preferred-language');
        if (saved && ['en', 'es'].includes(saved)) {
            return saved;
        }
        
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('es') ? 'es' : 'en';
    }

    bindEvents() {
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }
    }

    loadTranslations() {
        // Extract translations from data attributes
        const elements = document.querySelectorAll('[data-en][data-es]');
        elements.forEach(element => {
            const key = element.textContent.trim();
            this.translations[key] = {
                en: element.getAttribute('data-en'),
                es: element.getAttribute('data-es')
            };
        });
    }

    setLanguage(lang) {
        if (!['en', 'es'].includes(lang)) return;
        
        this.currentLang = lang;
        localStorage.setItem('preferred-language', lang);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Update all translatable elements
        const elements = document.querySelectorAll('[data-en][data-es]');
        elements.forEach(element => {
            const translation = element.getAttribute(`data-${lang}`);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update form labels
        this.updateFormLabels(lang);
        
        // Update language toggle button
        this.updateLanguageToggle();
        
        // Update page title
        this.updatePageTitle(lang);
    }

    updateFormLabels(lang) {
        const labels = document.querySelectorAll('label[data-en][data-es]');
        labels.forEach(label => {
            const translation = label.getAttribute(`data-${lang}`);
            if (translation) {
                label.textContent = translation;
            }
        });
    }

    updatePageTitle(lang) {
        const titles = {
            en: 'RiskController - Advanced Risk Assessment Solutions',
            es: 'RiskController - Soluciones Avanzadas de Evaluación de Riesgo'
        };
        document.title = titles[lang];
    }

    updateLanguageToggle() {
        const langToggle = document.getElementById('langToggle');
        const langText = langToggle?.querySelector('.lang-text');
        
        if (langText) {
            langText.textContent = this.currentLang.toUpperCase();
        }
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'es' : 'en';
        this.setLanguage(newLang);
    }

    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Form validation and handling
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.bindEvents();
        this.createSuccessMessage();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    createSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.id = 'successMessage';
        this.form.insertBefore(successDiv, this.form.firstChild);
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            this.showSuccess();
            this.resetForm();
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        this.clearFieldError(field);
        
        let isValid = true;
        let errorMessage = '';
        
        const lang = window.languageManager?.getCurrentLanguage() || 'en';
        const errorMessages = {
            en: {
                required: 'This field is required',
                email: 'Please enter a valid email address'
            },
            es: {
                required: 'Este campo es obligatorio',
                email: 'Por favor ingrese una dirección de correo válida'
            }
        };
        
        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = errorMessages[lang].required;
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = errorMessages[lang].email;
            }
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showSuccess() {
        const successMessage = document.getElementById('successMessage');
        const lang = window.languageManager?.getCurrentLanguage() || 'en';
        
        const messages = {
            en: 'Thank you for your message! We will get back to you soon.',
            es: '¡Gracias por tu mensaje! Te contactaremos pronto.'
        };
        
        if (successMessage) {
            successMessage.textContent = messages[lang];
            successMessage.classList.add('show');
            
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
        }
    }

    resetForm() {
        this.form.reset();
        
        // Clear any remaining error states
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => this.clearFieldError(field));
    }
}

// Smooth scrolling for navigation links
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e));
        });
    }

    handleClick(e) {
        e.preventDefault();
        
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Intersection Observer for fade-in animations
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFadeInAnimations();
    }

    setupFadeInAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Add fade-in class to elements that should animate
        const animatedElements = document.querySelectorAll(
            '.service-card, .pricing-card, .contact-info, .contact-form'
        );
        
        animatedElements.forEach(element => {
            element.classList.add('fade-in');
            observer.observe(element);
        });
    }
}

// Logo fallback handler
class LogoManager {
    constructor() {
        this.init();
    }

    init() {
        const logo = document.getElementById('logo');
        if (logo) {
            logo.addEventListener('error', () => this.handleLogoError(logo));
        }
    }

    handleLogoError(logo) {
        // Create a simple text-based logo as fallback
        const placeholder = logo.parentNode;
        placeholder.innerHTML = '<span style="color: white; font-weight: bold; font-size: 20px;">RC</span>';
        placeholder.style.fontSize = '20px';
        placeholder.style.fontWeight = 'bold';
        placeholder.style.color = 'white';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    window.languageManager = new LanguageManager();
    window.contactForm = new ContactForm();
    window.smoothScroll = new SmoothScroll();
    window.animationManager = new AnimationManager();
    window.logoManager = new LogoManager();
    
    console.log('RiskController landing page initialized successfully');
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', () => {
    // Add any resize-specific logic here if needed
});