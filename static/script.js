// INZZO Order Form Handler

document.addEventListener('DOMContentLoaded', function() {
    // ==================== PARTICLES ANIMATION (только на десктопе) ====================
    if (window.innerWidth > 768) {
        initParticles();
    }
    
    // ==================== PARALLAX EFFECT ====================
    if (window.innerWidth > 768) {
        initParallax();
    }
    
    // ==================== ORDER FORM HANDLER ====================
    const orderForm = document.getElementById('orderForm');
    const orderSuccessMessage = document.getElementById('orderSuccessMessage');
    const orderErrorMessage = document.getElementById('orderErrorMessage');

    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form data
            const name = document.getElementById('order-name').value.trim();
            const telegram = document.getElementById('order-telegram').value.trim();
            const city = document.getElementById('order-city').value.trim();

            // Basic validation
            if (!name || !telegram || !city) {
                showOrderError('Пожалуйста, заполни все поля');
                return;
            }

            // Validate telegram username
            if (!telegram.startsWith('@')) {
                showOrderError('Telegram должен начинаться с @');
                return;
            }

            // Disable submit button
            const submitBtn = orderForm.querySelector('.order-submit-btn');
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'ОТПРАВЛЯЕМ...';

            try {
                // Send data to backend
                const response = await fetch('/api/submit-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        telegram: telegram,
                        city: city,
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    // Success!
                    orderForm.classList.add('hidden');
                    showOrderSuccess();
                    
                    // Reset form after delay
                    setTimeout(() => {
                        orderForm.reset();
                        orderForm.classList.remove('hidden');
                        orderSuccessMessage.classList.add('hidden');
                    }, 5000);
                } else {
                    const errorData = await response.json();
                    showOrderError(errorData.message || 'Ошибка отправки. Попробуй ещё раз.');
                }
            } catch (error) {
                console.error('Error:', error);
                showOrderError('Проблема с подключением. Проверь интернет и попробуй снова.');
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
            }
        });

        function showOrderSuccess() {
            orderErrorMessage.classList.add('hidden');
            orderSuccessMessage.classList.remove('hidden');
        }

        function showOrderError(message) {
            orderSuccessMessage.classList.add('hidden');
            orderErrorMessage.classList.remove('hidden');
            orderErrorMessage.querySelector('p').textContent = message;
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                orderErrorMessage.classList.add('hidden');
            }, 5000);
        }
    }

    // Glitch effect on title
    const glitchTitle = document.querySelector('.glitch');
    if (glitchTitle) {
        setInterval(() => {
            glitchTitle.classList.add('active');
            setTimeout(() => {
                glitchTitle.classList.remove('active');
            }, 200);
        }, 3000);
    }
    
    // Smooth scroll to order form
    const heroCta = document.querySelector('.hero-cta-btn');
    if (heroCta) {
        heroCta.addEventListener('click', function(e) {
            e.preventDefault();
            const orderForm = document.getElementById('order-form');
            if (orderForm) {
                orderForm.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Add highlight animation
                orderForm.style.animation = 'pulse-highlight 1s ease-out';
                setTimeout(() => {
                    orderForm.style.animation = '';
                }, 1000);
            }
        });
    }
    
    // Initialize scroll animations
    setTimeout(initScrollAnimations, 100);
    
    // Initialize product carousels
    initProductCarousels();
});

// ==================== PRODUCT CAROUSEL ====================
function initProductCarousels() {
    const carousels = document.querySelectorAll('.product-carousel');
    
    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('.product-image');
        const dots = carousel.querySelectorAll('.dot');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        
        let currentIndex = 0;
        
        function showImage(index) {
            // Remove active class from all
            images.forEach(img => img.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Add active to current
            images[index].classList.add('active');
            dots[index].classList.add('active');
            currentIndex = index;
        }
        
        function nextImage() {
            const nextIndex = (currentIndex + 1) % images.length;
            showImage(nextIndex);
        }
        
        function prevImage() {
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(prevImage);
        }
        
        // Button clicks
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                nextImage();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prevImage();
            });
        }
        
        // Dot clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showImage(index);
            });
        });
        
        // Swipe support for touch devices
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextImage();
                } else {
                    prevImage();
                }
            }
        }
    });
}

// ==================== PARTICLES (FALLING SAKURA) ====================
function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.querySelector('.hero').insertBefore(canvas, document.querySelector('.hero-bg').nextSibling);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 20;
    
    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -10;
            this.size = Math.random() * 4 + 2;
            this.speedY = Math.random() * 1 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            
            if (this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 0, 51, ${this.opacity})`;
            ctx.fill();
            
            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 0, 51, 0.5)';
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    let lastFrameTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    
    function animateParticles(currentTime) {
        const deltaTime = currentTime - lastFrameTime;
        
        if (deltaTime >= frameInterval) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            lastFrameTime = currentTime - (deltaTime % frameInterval);
        }
        
        requestAnimationFrame(animateParticles);
    }
    
    requestAnimationFrame(animateParticles);
    
    // Resize handler с debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }, 250);
    }, { passive: true });
}

// ==================== PARALLAX EFFECT ====================
function initParallax() {
    const heroImage = document.querySelector('.hero-image');
    const heroContent = document.querySelector('.hero-content');
    
    let ticking = false;
    let lastScrollY = 0;
    
    const updateParallax = () => {
        const scrolled = lastScrollY;
        const parallaxSpeed = 0.5;
        
        if (heroImage && scrolled < window.innerHeight) {
            heroImage.style.transform = `translate3d(0, ${scrolled * parallaxSpeed}px, 0) scale(1.1)`;
        }
        
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translate3d(0, ${scrolled * 0.3}px, 0)`;
        }
        
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        lastScrollY = window.pageYOffset;
        
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });
    
    // Observe product cards
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.3}s`;
        observer.observe(card);
    });
}
