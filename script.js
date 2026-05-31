document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Theme Toggle (Light / Dark Mode)
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    // Load saved theme or check system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        htmlElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fa-solid fa-sun';
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        themeIcon.className = 'fa-solid fa-moon';
    }

    // Toggle theme function
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            htmlElement.setAttribute('data-theme', 'light');
            themeIcon.className = 'fa-solid fa-moon';
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fa-solid fa-sun';
            localStorage.setItem('theme', 'dark');
        }
    });

    // ==========================================
    // 2. Scroll Progress Bar & Back to Top
    // ==========================================
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    const backToTopBtn = document.getElementById('backToTop');
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        // Scroll progress
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgressBar.style.width = scrolled + '%';

        // Sticky Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button visibility
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ==========================================
    // 3. Mobile Navigation Menu
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMobileMenu() {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when resizing screen past tablet width
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // ==========================================
    // 4. Typing Effect in Hero
    // ==========================================
    const typingText = document.getElementById('typingText');
    const words = ["Scholar's Heaven School", "Leaders of Tomorrow", "Center of Excellence"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function typeEffect() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeDelay = 50; // faster deleting
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeDelay = 150; // normal typing
        }

        if (!isDeleting && charIndex === currentWord.length) {
            typeDelay = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeDelay = 500; // Pause before typing next word
        }

        setTimeout(typeEffect, typeDelay);
    }

    // Start typing effect
    if (typingText) {
        typeEffect();
    }

    // ==========================================
    // 5. Scroll-Triggered Animated Counters
    // ==========================================
    const counters = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    function animateCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            const duration = 2000; // animation time in ms
            const stepTime = Math.abs(Math.floor(duration / target));
            let current = 0;
            
            // Adjust step time and increment for large numbers
            const increment = target > 100 ? Math.ceil(target / 100) : 1;
            const intervalTime = target > 100 ? 20 : stepTime;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = current;
                }
            }, intervalTime);
        });
    }

    // Intersection Observer for stats section
    const statsSection = document.getElementById('stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    animateCounters();
                    countersAnimated = true;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    // ==========================================
    // 6. Testimonials Carousel Slider
    // ==========================================
    const track = document.getElementById('testimonialTrack');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('tNext');
    const prevBtn = document.getElementById('tPrev');
    const dotsNav = document.getElementById('tDots');
    
    let currentIndex = 0;
    let autoPlayTimer;

    // Create dot indicators dynamically
    slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.classList.add('t-dot');
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Testimonial slide ${index + 1}`);
        dotsNav.appendChild(dot);
    });

    const dots = Array.from(dotsNav.children);

    const updateSlider = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        
        // Update dots state
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        
        currentIndex = index;
    };

    const nextSlide = () => {
        let targetIndex = currentIndex + 1;
        if (targetIndex >= slides.length) targetIndex = 0;
        updateSlider(targetIndex);
    };

    const prevSlide = () => {
        let targetIndex = currentIndex - 1;
        if (targetIndex < 0) targetIndex = slides.length - 1;
        updateSlider(targetIndex);
    };

    // Controls listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateSlider(index);
            resetAutoPlay();
        });
    });

    // Auto Play functionality
    function startAutoPlay() {
        autoPlayTimer = setInterval(nextSlide, 6000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        startAutoPlay();
    }

    if (track) {
        startAutoPlay();
    }

    // ==========================================
    // 7. Interactive Photo Gallery Lightbox
    // ==========================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightboxContent');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Find img or placeholder inside the item
            const img = item.querySelector('.gallery-img');
            let contentNode;
            if (img && window.getComputedStyle(img).display !== 'none') {
                contentNode = img.cloneNode(true);
                contentNode.style.maxHeight = '80vh';
                contentNode.style.maxWidth = '100%';
                contentNode.style.width = 'auto';
                contentNode.style.objectFit = 'contain';
            } else {
                contentNode = item.querySelector('.gallery-placeholder').cloneNode(true);
            }
            const caption = item.getAttribute('data-caption');

            lightboxContent.innerHTML = '';
            lightboxContent.appendChild(contentNode);
            lightboxCaption.textContent = caption;

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close lightbox on clicking dark backdrop
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ==========================================
    // 8. Contact Form Handler (Mock API post)
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const originalBtnContent = submitBtn.innerHTML;

            // Loading state
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending message...';
            submitBtn.disabled = true;

            // Mocking server latency
            setTimeout(() => {
                // Success action
                contactForm.reset();
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;

                // Show success container overlay
                formSuccess.classList.add('active');

                // Revert success overlay after 4 seconds
                setTimeout(() => {
                    formSuccess.classList.remove('active');
                }, 4500);

            }, 1800);
        });
    }

    // Set Current Year in Footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================
    // 9. Navigation Active Link Tracking
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function trackScrollNavigation() {
        const scrollPosition = window.scrollY + 120; // offset

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', trackScrollNavigation);
});
