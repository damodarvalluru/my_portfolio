/* --- Existing Code Logic --- */
    let textElement;
    const phrases = ["A NETWORKING ENTHUSIAST", "A FRONT END DEVELOPER", "A COMPUTER SCIENCE STUDENT", "A CORE PROGRAMMER"];
    let phraseIndex = 0; let characterIndex = 0; let isDeleting = false; let typeSpeed = 150;

/* --- Conditions: Toggle Dark/Light Mode --- */
    function toggleTheme() {
        const body = document.body;
        const icon = document.getElementById('themeIcon');
        if (body.getAttribute('data-theme') === 'light') {
            body.removeAttribute('data-theme');
            icon.className = 'fas fa-moon';
        } else {
            body.setAttribute('data-theme', 'light');
            icon.className = 'fas fa-sun';
        }
    }

function handleScrollAction() {
        const icon = document.getElementById('arrowIcon');
        if (icon.classList.contains('fa-chevron-up')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }

function type() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, characterIndex - 1);
            characterIndex--;
            typeSpeed = 80;
        } else {
            textElement.textContent = currentPhrase.substring(0, characterIndex + 1);
            characterIndex++;
            typeSpeed = 150;
        }
        if (!isDeleting && characterIndex === currentPhrase.length) {
            isDeleting = true; typeSpeed = 2000;
        } else if (isDeleting && characterIndex === 0) {
            isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }

window.addEventListener('scroll', () => {

    // Active navbar
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;

        if(window.pageYOffset >= sectionTop - 150){
            current = section.id;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');

        if(link.getAttribute('href').includes(current)){
            link.classList.add('active');
        }
    });

    // Arrow logic
    const arrow = document.getElementById('scrollArrow');
    const icon = document.getElementById('arrowIcon');

    if(window.scrollY > 500){
        arrow.style.opacity = "1";
    }else{
        arrow.style.opacity = "0.8";
    }

    if(
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
    ){
        icon.className = "fas fa-chevron-up";
    }else{
        icon.className = "fas fa-chevron-down";
    }

});
    document.addEventListener('DOMContentLoaded', () => {
        textElement = document.getElementById('typewriter');
        type();

        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section, header');
        
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 'px';
        star.style.width = size; star.style.height = size;
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        starsContainer.appendChild(star);
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('section').forEach(section => sectionObserver.observe(section));

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const rotateX = ((y - rect.height/2) / (rect.height/2)) * 10; 
            const rotateY = ((x - rect.width/2) / (rect.width/2)) * 10;
            card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });
    });
        
document.getElementById("contactForm").addEventListener("submit", async function(e) {

    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
    };

    try {

        const response = await fetch("http://localhost:3000/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if(result.success){

            alert("Message sent successfully!");

            document.getElementById("contactForm").reset();

        }else{

            alert("Failed to send message.");

        }

    } catch(error){

        console.error(error);
        alert("Server Error");

    }

});