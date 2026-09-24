/* ==========================================================================
   DAMODAR VALLURU | PORTFOLIO DOSSIER JAVASCRIPT
   Synthesizing dynamic features from Videos 1, 2, and 3:
   - High-Tech Preloader Counter (Video 1 & 2)
   - Kinetic Role Switcher (Video 3 & 1)
   - Live Dispatch JSON Mode Sync (Video 3)
   - Real-time IST Status Clock (Video 3)
   - 3D Interactive Card & Frame Tilt (Video 2)
   - Scroll Tracking, Nav Indicator & Preserved Backend API
   ========================================================================== */

/* --- 1. PRELOADER COUNTER (Reference Videos 1 & 2) --- */
(() => {
    const preloader = document.getElementById('preloader');
    const loaderNumber = document.getElementById('loaderNumber');
    const loaderProgress = document.getElementById('loaderProgress');

    if (preloader && loaderNumber && loaderProgress) {
        let count = 0;
        const totalDuration = 750; // ms
        const startTime = performance.now();

        function updateLoader(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);
            
            // Ease out quad
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            count = Math.floor(easeProgress * 100);

            loaderNumber.textContent = count;
            loaderProgress.style.width = count + '%';

            if (progress < 1) {
                requestAnimationFrame(updateLoader);
            } else {
                loaderNumber.textContent = 100;
                loaderProgress.style.width = '100%';
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    document.body.classList.add('loaded');
                }, 180);
            }
        }

        requestAnimationFrame(updateLoader);
    }
})();

/* --- 2. KINETIC TYPEWRITER / ROLE ROTATOR --- */
const phrases = [
    "A FULL STACK DEVELOPER",
    "A DSA LOGIC SOLVER",
    "A SYSTEM ARCHITECT",
    "A COMPUTER SCIENCE SCHOLAR"
];

let phraseIndex = 0;
let characterIndex = 0;
let isDeleting = false;
let typeSpeed = 120;
let textElement = null;

function type() {
    if (!textElement) return;
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        textElement.textContent = currentPhrase.substring(0, characterIndex - 1);
        characterIndex--;
        typeSpeed = 60;
    } else {
        textElement.textContent = currentPhrase.substring(0, characterIndex + 1);
        characterIndex++;
        typeSpeed = 120;
    }

    if (!isDeleting && characterIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 2200; // Pause at full word
    } else if (isDeleting && characterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 400; // Pause before typing next word
    }

    setTimeout(type, typeSpeed);
}

/* --- 3. LIVE DISPATCH MODE (Reference Video 3) --- */
function setupLiveDispatch() {
    const nameIn = document.getElementById('name');
    const phoneIn = document.getElementById('phone');
    const emailIn = document.getElementById('email');
    const messageIn = document.getElementById('message');

    const jsonName = document.getElementById('jsonName');
    const jsonPhone = document.getElementById('jsonPhone');
    const jsonEmail = document.getElementById('jsonEmail');
    const jsonMessage = document.getElementById('jsonMessage');
    const jsonStatus = document.getElementById('jsonStatus');
    const jsonTime = document.getElementById('jsonTime');

    if (!nameIn || !jsonName) return;

    function updateTimestamp() {
        if (jsonTime) {
            jsonTime.textContent = `"${new Date().toISOString()}"`;
        }
    }

    function syncPayload() {
        const hasContent = nameIn.value || phoneIn.value || emailIn.value || messageIn.value;

        jsonName.textContent = JSON.stringify(nameIn.value || "");
        jsonPhone.textContent = JSON.stringify(phoneIn.value || "");
        jsonEmail.textContent = JSON.stringify(emailIn.value || "");
        
        const truncatedMsg = messageIn.value.length > 45 
            ? messageIn.value.substring(0, 45) + "..." 
            : messageIn.value;
        jsonMessage.textContent = JSON.stringify(truncatedMsg || "");

        if (jsonStatus) {
            if (hasContent) {
                jsonStatus.textContent = '"COMPOSING_PAYLOAD..."';
                jsonStatus.style.color = '#38bdf8';
            } else {
                jsonStatus.textContent = '"AWAITING_INPUT"';
                jsonStatus.style.color = '#facc15';
            }
        }
        updateTimestamp();
    }

    [nameIn, phoneIn, emailIn, messageIn].forEach(input => {
        if (input) {
            input.addEventListener('input', syncPayload);
        }
    });

    updateTimestamp();
}

/* --- 4. LIVE FOOTER CLOCK (Reference Video 3) --- */
function updateFooterClock() {
    const clockEl = document.getElementById('footerClock');
    if (!clockEl) return;

    const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const istTime = new Intl.DateTimeFormat('en-GB', options).format(new Date());
    clockEl.textContent = `${istTime} IST`;
}

/* --- 5. THEME TOGGLE & PERSISTENCE --- */
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    const isLight = body.getAttribute('data-theme') === 'light';

    if (isLight) {
        body.removeAttribute('data-theme');
        if (icon) icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        if (icon) icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    }
}

// Restore theme from localStorage
(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        window.addEventListener('DOMContentLoaded', () => {
            const icon = document.getElementById('themeIcon');
            if (icon) icon.className = 'fas fa-sun';
        });
    }
})();

/* --- 6. SCROLL ACTION TOGGLE --- */
function handleScrollAction() {
    const icon = document.getElementById('arrowIcon');
    if (icon && icon.classList.contains('fa-chevron-up')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
}

/* --- 7. 3D TILT MICRO-INTERACTIONS (Reference Videos 2 & 3) --- */
function setup3DTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt], .dossier-card, .metric-card');
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Normalize between -1 and 1
            const xPercent = (x / rect.width - 0.5) * 2;
            const yPercent = (y / rect.height - 0.5) * 2;

            // Restrict maximum rotation angle
            const maxTilt = el.classList.contains('dossier-card') ? 7 : 9;
            const rotateX = -yPercent * maxTilt;
            const rotateY = xPercent * maxTilt;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

            // Spotlight coordinate
            el.style.setProperty('--mx', `${x}px`);
            el.style.setProperty('--my', `${y}px`);
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

/* --- 8. GLOBAL SCROLL & NAVIGATION SYNCHRONIZATION --- */
window.addEventListener('scroll', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section, header');

    let currentSection = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
            currentSection = section.id;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === "#" + currentSection) {
            link.classList.add('active');
        }
    });

    // Scroll progress bar
    const doc = document.documentElement;
    const scrollRatio = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight);
    const progressSpan = document.querySelector('.progress-bar span');
    if (progressSpan) {
        progressSpan.style.transform = `scaleX(${scrollRatio})`;
    }

    // Scroll arrow direction
    const icon = document.getElementById('arrowIcon');
    if (icon) {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 80) {
            icon.className = "fas fa-chevron-up";
        } else {
            icon.className = "fas fa-chevron-down";
        }
    }
});

/* --- 9. DOM INITIALIZATION & PRESERVED FORM SUBMISSION --- */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize typewriter
    textElement = document.getElementById('typewriter');
    if (textElement) {
        type();
    }

    // 2. Initialize live dispatch mode
    setupLiveDispatch();

    // 3. Initialize live IST clock
    updateFooterClock();
    setInterval(updateFooterClock, 1000);

    // 4. Initialize 3D tilt
    setup3DTilt();

    // 5. Generate twinkling stars in background
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        const starCount = window.innerWidth < 768 ? 60 : 120;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = (Math.random() * 2 + 1).toFixed(1) + 'px';
            star.style.width = size;
            star.style.height = size;
            star.style.top = Math.random() * 100 + '%';
            star.style.left = Math.random() * 100 + '%';
            star.style.setProperty('--duration', (Math.random() * 3 + 2).toFixed(1) + 's');
            starsContainer.appendChild(star);
        }
    }

    // 6. Intersection Observer for Scroll Reveals
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('section').forEach(sec => sectionObserver.observe(sec));

    // 7. Preserved Contact Form Submission Logic with Live Dispatch Visuals
    const form = document.getElementById("contactForm");
    const jsonStatus = document.getElementById("jsonStatus");
    const submitBtn = document.getElementById("submitBtn");

    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            const nameVal = document.getElementById("name").value.trim();
            const phoneVal = document.getElementById("phone").value.trim();
            const emailVal = document.getElementById("email").value.trim();
            const messageVal = document.getElementById("message").value.trim();

            const data = {
                name: nameVal,
                phone: phoneVal,
                email: emailVal,
                message: messageVal
            };

            // Visual feedback
            if (jsonStatus) {
                jsonStatus.textContent = '"TRANSMITTING_PAYLOAD..."';
                jsonStatus.style.color = '#38bdf8';
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Transmitting...</span>';
            }

            try {
                // Try production Render URL first, fallback to relative endpoint
                let response;
                try {
                    response = await fetch("https://my-portfolio-1-aevn.onrender.com/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } catch (netErr) {
                    // Fallback to local server endpoint if render is asleep
                    response = await fetch("/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                }

                const result = await response.json();

                if (result.success) {
                    if (jsonStatus) {
                        jsonStatus.textContent = '"DISPATCHED_SUCCESSFULLY"';
                        jsonStatus.style.color = '#22c55e';
                    }
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Proposal Sent!</span>';
                    }

                    // If server provided WhatsApp URL, redirect or show message
                    if (result.whatsappURL) {
                        window.open(result.whatsappURL, '_blank');
                    }

                    setTimeout(() => {
                        alert("Thank you! Your proposal has been transmitted successfully.");
                        form.reset();
                        setupLiveDispatch();
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Send Proposal</span>';
                        }
                    }, 600);
                } else {
                    throw new Error("Dispatch failed at endpoint");
                }
            } catch (error) {
                console.error("Submission error:", error);
                if (jsonStatus) {
                    jsonStatus.textContent = '"DISPATCH_FAILED_FALLBACK_WA"';
                    jsonStatus.style.color = '#ef4444';
                }
                
                // Fallback direct WhatsApp option
                const fallbackWA = `https://wa.me/919573102505?text=${encodeURIComponent(
                    `Hello Damodar, I am ${nameVal} (${phoneVal}, ${emailVal}). ${messageVal}`
                )}`;
                
                const openWA = confirm("The cloud mail server is currently spinning up. Would you like to transmit your proposal directly via WhatsApp?");
                if (openWA) {
                    window.open(fallbackWA, '_blank');
                }

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Send Proposal</span>';
                }
            }
        });
    }

    // 8. Custom Cursor (Fine Pointers Only)
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (finePointer && !reduceMotion) {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        if (dot && ring) {
            let rx = -100, ry = -100, tx = -100, ty = -100;
            let frame = null;

            document.querySelectorAll('a, button, .card, .project-card, .metric-card, .theme-toggle, .scroll-arrow, .submit-btn, .social-icon, input, textarea').forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
            });

            document.addEventListener('mousemove', (e) => {
                tx = e.clientX;
                ty = e.clientY;
                if (!frame) {
                    frame = requestAnimationFrame(tickCursor);
                }
            });

            document.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-on');
            });

            document.documentElement.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-on');
            });

            function tickCursor() {
                rx += (tx - rx) * 0.2;
                ry += (ty - ry) * 0.2;
                dot.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
                ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
                frame = null;
                if (Math.abs(tx - rx) > 0.5 || Math.abs(ty - ry) > 0.5) {
                    frame = requestAnimationFrame(tickCursor);
                }
            }
        }
    }
});