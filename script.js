// ========================================
// Navigation & Mobile Menu
// ========================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

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
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// Hero Stats Counter Animation
// ========================================
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
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
                animateCounter(stat, target);
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
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
};

const hideScrollElement = (element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 100)) {
            displayScrollElement(el);
        }
    });
};

// Initialize elements with hidden state
scrollElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
});

window.addEventListener('scroll', handleScrollAnimation);
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
                    entry.target.style.transition = 'none';
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
        document.querySelectorAll('*').forEach(el => {
            el.style.animation = 'none';
            el.style.transition = 'none';
        });
    }
})();

// ========================================
// Contact Form Handling
// ========================================
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
    };
    
    // Simulate form submission
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.innerHTML = '<span>Message Sent ✓</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00cc66);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease;
        `;
        successMessage.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <strong>Thank you! We'll contact you soon.</strong>
            </div>
        `;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.style.animation = 'slideInRight 0.5s ease reverse';
            setTimeout(() => successMessage.remove(), 500);
        }, 4000);
        
        // Reset form
        setTimeout(() => {
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }, 2000);
    }, 1500);
});

// ========================================
// Route Animation
// ========================================
const routeLines = document.querySelectorAll('.route-line');
let routeCounter = 0;

const animateRoutes = () => {
    routeLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.animation = 'none';
            setTimeout(() => {
                line.style.animation = 'routeDraw 2s ease';
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
// Console Easter Egg
// ========================================
console.log('%c🚀 A2Logistics', 'font-size: 24px; font-weight: bold; color: #0066ff;');
console.log('%cMoving the world with precision, innovation, and unmatched reliability.', 'font-size: 14px; color: #495057;');
console.log('%cWebsite redesigned for 10/10 excellence ✨', 'font-size: 12px; color: #6c757d;');
