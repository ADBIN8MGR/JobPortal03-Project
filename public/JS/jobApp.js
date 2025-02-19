document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section'); 
    const navLinks = document.querySelectorAll('.navbar ul li a'); 

    const hideAllSections = () => {
        sections.forEach(section => {
            section.style.display = 'none';
        });
    };

    const showSection = (sectionId) => {
        hideAllSections(); 
        const section = document.querySelector(sectionId); 
        if (section) {
            section.style.display = 'block'; 
        } 
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            const targetSection = link.getAttribute('href'); 

            if (targetSection.startsWith('#')) {
                showSection(targetSection);
            } else if (targetSection === '/auth/logout') {
                window.location.href = targetSection;
            }
        });
    });

    if (navLinks.length > 0) {
        const defaultSection = navLinks[0].getAttribute('href'); 
        if (defaultSection.startsWith('#')) {
            showSection(defaultSection); 
        }
    }
});
