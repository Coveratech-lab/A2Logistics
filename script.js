// ========================================
// Navigation & Mobile Menu
// ========================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect (throttled)
let navbarScrollTicking = false;
const handleNavbarScroll = () => {
    if (navbar && window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else if (navbar) {
        navbar.classList.remove('scrolled');
    }
    navbarScrollTicking = false;
};

window.addEventListener('scroll', () => {
    if (!navbarScrollTicking) {
        window.requestAnimationFrame(handleNavbarScroll);
        navbarScrollTicking = true;
    }
}, { passive: true });

// Update CSS var with dynamic navbar height (for safe hero offset)
const setNavbarHeightVar = () => {
    if (!navbar) return;
    const h = navbar.offsetHeight;
    document.documentElement.style.setProperty('--navbar-height-dyn', h + 'px');
};
window.addEventListener('load', setNavbarHeightVar);
window.addEventListener('resize', setNavbarHeightVar);
const resizeObserver = window.ResizeObserver ? new ResizeObserver(setNavbarHeightVar) : null;
if (resizeObserver && navbar) resizeObserver.observe(navbar);

// Mobile menu toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
if (navLinks.length > 0 && navMenu && navToggle) {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Helper function to scroll to an element
const scrollToElement = (target, offset = 20) => {
    if (!target) return;
    
    const navHeight = navbar ? navbar.offsetHeight : 0;
    const targetRect = target.getBoundingClientRect();
    const targetPosition = window.pageYOffset + targetRect.top - navHeight - offset;
    
    window.scrollTo({
        top: Math.max(0, targetPosition), // Ensure we don't scroll to negative position
        behavior: 'smooth'
    });
};

// Smooth scroll for anchor links (same-page navigation)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Check if it's a link to another page (contains .html)
        const href = this.getAttribute('href');
        if (href.includes('.html')) {
            // Let the browser handle cross-page navigation
            // The hash will be handled by scrollToHash on page load
            return;
        }
        
        // Same-page anchor link
        e.preventDefault();
        const target = document.querySelector(href);
        scrollToElement(target, 20);
    });
});

// Handle scrolling to hash on page load (consolidated handler)
let hashHandled = false;
const scrollToHash = () => {
    // Prevent duplicate scroll operations
    if (hashHandled && !window.location.hash) {
        hashHandled = false;
        return;
    }
    
    if (window.location.hash && !hashHandled) {
        const hash = window.location.hash;
        const target = document.querySelector(hash);
        if (target) {
            hashHandled = true;
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                scrollToElement(target, 20);
            });
        }
    }
};

// Consolidate hash handling - use DOMContentLoaded as primary, fallback to load
let hashHandlerAttached = false;
const attachHashHandler = () => {
    if (hashHandlerAttached) return;
    hashHandlerAttached = true;
    
    // Handle hash on DOMContentLoaded (faster than load event)
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(scrollToHash, 100);
    }, { once: true });
    
    // Fallback for slow-loading pages (only if DOMContentLoaded hasn't fired)
    if (document.readyState === 'loading') {
        window.addEventListener('load', () => {
            if (!hashHandled && window.location.hash) {
                setTimeout(scrollToHash, 200);
            }
        }, { once: true });
    } else {
        // DOM already loaded, handle immediately
        setTimeout(scrollToHash, 100);
    }
    
    // Handle hash changes (when hash changes without page reload)
    window.addEventListener('hashchange', () => {
        hashHandled = false; // Reset flag for new hash
        setTimeout(scrollToHash, 100);
    });
};

attachHashHandler();

// ========================================
// Hero Stats Counter Animation
// ========================================
const animateCounter = (element, target, duration = 2000) => {
    if (!element || typeof target !== 'number') return;
    
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        if (!element) return; // Safety check in case element is removed
        start += increment;
        if (start < target) {
            if (target % 1 === 0) {
                element.textContent = Math.floor(start);
            } else {
                element.textContent = start.toFixed(1);
            }
            requestAnimationFrame(updateCounter);
        } else {
            if (target % 1 === 0) {
                element.textContent = target;
            } else {
                element.textContent = target.toFixed(1);
            }
        }
    };
    
    updateCounter();
};

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number-inline');
            statNumbers.forEach(stat => {
                const target = parseFloat(stat.getAttribute('data-target'));
                if (!isNaN(target)) {
                    animateCounter(stat, target);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const heroStatsInline = document.querySelector('.hero-stats-inline');
if (heroStatsInline) {
    statsObserver.observe(heroStatsInline);
}

// ========================================
// Scroll Animations
// ========================================
const scrollElements = document.querySelectorAll('.service-card, .value-item, .network-feature, .contact-item');

const elementInView = (el, offset = 100) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
        elementTop <= (window.innerHeight || document.documentElement.clientHeight) - offset
    );
};

const displayScrollElement = (element) => {
    element.classList.add('scroll-revealed');
    element.classList.remove('scroll-hidden');
};

const hideScrollElement = (element) => {
    element.classList.add('scroll-hidden');
    element.classList.remove('scroll-revealed');
};

// Throttled scroll animation handler
let scrollAnimationTicking = false;
const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 100)) {
            displayScrollElement(el);
        }
    });
    scrollAnimationTicking = false;
};

// Initialize elements with hidden state
scrollElements.forEach(el => {
    el.classList.add('scroll-hidden');
});

// Throttled scroll listener
window.addEventListener('scroll', () => {
    if (!scrollAnimationTicking) {
        window.requestAnimationFrame(handleScrollAnimation);
        scrollAnimationTicking = true;
    }
}, { passive: true });

handleScrollAnimation(); // Check on load

// ========================================
// Global Fade-In Observer (reusable utility)
// ========================================
(() => {
    const fadeEls = document.querySelectorAll('.fade-in');
    if (!fadeEls.length) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (prefersReduced) {
                    entry.target.classList.add('no-transition');
                }
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    fadeEls.forEach(el => observer.observe(el));
})();

// ========================================
// Sample-compatible reveal observer & stagger
// ========================================
(() => {
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
        revealEls.forEach(el => revealObserver.observe(el));
    }

    const addStaggerDelay = (selector, delay = 150) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.style.transitionDelay = `${index * delay}ms`;
        });
    };
    addStaggerDelay('.service-card', 150);
    addStaggerDelay('.value-item', 150);
    addStaggerDelay('.network-feature', 150);
    addStaggerDelay('.contact-item', 120);
})();

// ========================================
// Reduced motion: match sample behavior
// ========================================
(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('prefers-reduced-motion');
    }
})();

// ========================================
// Contact Form Handling
// ========================================

// Validation utilities
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

const validatePhone = (phone) => {
    // Accepts international format: +234, spaces, dashes, parentheses
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.trim());
};

const showErrorMessage = (message, element = null) => {
    // Remove existing error messages
    const existingError = element?.parentElement?.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Remove error styling
    if (element) {
        element.classList.remove('error');
        element.style.borderColor = '';
    }
    
    // Show new error message
    if (element && element.parentElement) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>${message}</span>
        `;
        element.parentElement.appendChild(errorDiv);
        element.classList.add('input-error');
        
        // Scroll to first error
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

const clearErrorMessage = (element) => {
    if (element) {
        const errorMessage = element.parentElement?.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        element.classList.remove('input-error');
    }
};

const showSuccessMessage = () => {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div class="success-message-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <strong>Thank you! We'll contact you soon.</strong>
        </div>
    `;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.classList.add('success-message-hide');
        setTimeout(() => successMessage.remove(), 500);
    }, 4000);
};

// Initialize contact form handling only if form exists
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const serviceInput = document.getElementById('service');
    const messageInput = document.getElementById('message');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    
    // Clear error messages on input
    [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => clearErrorMessage(input));
        }
    });
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Clear previous errors
        [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
            if (input) clearErrorMessage(input);
        });
        
        // Validate required fields
        let isValid = true;
        
        if (!nameInput || !nameInput.value.trim()) {
            showErrorMessage('Name is required', nameInput);
            isValid = false;
        }
        
        if (!emailInput || !emailInput.value.trim()) {
            showErrorMessage('Email is required', emailInput);
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showErrorMessage('Please enter a valid email address', emailInput);
            isValid = false;
        }
        
        if (!phoneInput || !phoneInput.value.trim()) {
            showErrorMessage('Phone number is required', phoneInput);
            isValid = false;
        } else if (!validatePhone(phoneInput.value)) {
            showErrorMessage('Please enter a valid phone number', phoneInput);
            isValid = false;
        }
        
        if (!messageInput || !messageInput.value.trim()) {
            showErrorMessage('Message is required', messageInput);
            isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            showErrorMessage('Message must be at least 10 characters', messageInput);
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        // Prepare form data with sanitization
        const sanitizeInput = (str) => {
            const div = document.createElement('div');
            div.textContent = str.trim();
            return div.textContent || '';
        };
        
        const formData = {
            name: sanitizeInput(nameInput.value),
            email: sanitizeInput(emailInput.value),
            phone: sanitizeInput(phoneInput.value),
            service: serviceInput ? sanitizeInput(serviceInput.value) : '',
            message: sanitizeInput(messageInput.value)
        };
        
        // Show loading state
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;
            
            // TODO: Replace with actual form submission endpoint
            // Currently simulating submission for development
            // Future: Replace setTimeout with fetch() to backend API
            setTimeout(() => {
                submitBtn.innerHTML = '<span>Message Sent ✓</span>';
                submitBtn.classList.add('btn-success');
                
                // Show success message
                showSuccessMessage();
                
                // Reset form
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-success');
                }, 2000);
            }, 1500);
        }
    });
}

// ========================================
// Route Animation
// ========================================
const routeLines = document.querySelectorAll('.route-line');
let routeCounter = 0;

const animateRoutes = () => {
    routeLines.forEach((line, index) => {
        setTimeout(() => {
            line.classList.remove('route-animate');
            // Force reflow
            void line.offsetWidth;
            setTimeout(() => {
                line.classList.add('route-animate');
            }, 10);
        }, index * 500);
    });
};

// Animate routes on load
window.addEventListener('load', () => {
    setTimeout(animateRoutes, 1000);
});

// Re-animate every 5 seconds
setInterval(animateRoutes, 5000);

// ========================================
// Add loading class removal
// ========================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ========================================
// Console Easter Egg (Development Only)
// ========================================
// Only show console messages in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('dev')) {
    console.log('%c🚀 A2Logistics', 'font-size: 24px; font-weight: bold; color: #0066ff;');
    console.log('%cMoving the world with precision, innovation, and unmatched reliability.', 'font-size: 14px; color: #495057;');
    console.log('%cWebsite redesigned for 10/10 excellence ✨', 'font-size: 12px; color: #6c757d;');
}
