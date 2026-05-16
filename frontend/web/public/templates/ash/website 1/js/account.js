// Account Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Login Modal
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeModal && loginModal) {
        closeModal.addEventListener('click', function() {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close modal on overlay click
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Login form handling
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const emailInput = this.querySelector('input[type="text"]');
            const passwordInput = this.querySelector('input[type="password"]');
            
            if (emailInput.value && passwordInput.value) {
                // Simulate login
                alert('Login successful! Welcome back.');
                loginModal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Update welcome section (demo)
                updateWelcomeSection('Guest User');
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // OTP button handling
    const otpBtn = document.querySelector('.btn-otp');
    if (otpBtn) {
        otpBtn.addEventListener('click', function() {
            alert('OTP will be sent to your registered mobile number.');
        });
    }

    // Newsletter form on account page
    const newsletterForm = document.querySelector('.newsletter-form-inline');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }

    // Menu card interactions
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Add a subtle click effect
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Forgot password link
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Password reset link will be sent to your email.');
        });
    }

    // Sign up link
    const signupLink = document.querySelector('.signup-link a');
    if (signupLink) {
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Sign up form coming soon!');
        });
    }

    // Helper function to update welcome section after login
    function updateWelcomeSection(userName) {
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) {
            const title = welcomeCard.querySelector('h2');
            const subtitle = welcomeCard.querySelector('p');
            const loginButton = welcomeCard.querySelector('.btn-login');
            
            if (title) title.textContent = `Welcome, ${userName}!`;
            if (subtitle) subtitle.textContent = 'Manage your orders, addresses, and preferences.';
            if (loginButton) {
                loginButton.textContent = 'My Profile';
                loginButton.href = '#';
            }
        }
    }

    // Animation on scroll for menu cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    menuCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;
        observer.observe(card);
    });

    console.log('Koskii Account Page - Loaded Successfully');
});
