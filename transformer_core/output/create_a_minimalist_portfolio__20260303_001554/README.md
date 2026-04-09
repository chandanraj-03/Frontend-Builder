<div class="container">...</div>
        </footer>
    </body>
</html>         
```css
/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #fff;
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
}

/* Header styles */
header {
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-links {
    display: flex;
    list-style: none;
}

.nav-links li {
    margin-left: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: #333;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: #007bff;
}

/* Hero section */
.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

.btn {
    display: inline-block;
    padding: 0.8rem 2rem;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: #0056b3;
}

/* Sections */
section {
    padding: 5rem 0;
}

h2 {
    text-align: center;
    margin-bottom: 3rem;
    font-size: 2.5rem;
}

/* About section */
.about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
}

/* Projects section */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.project-card {
    background-color: #f8f9fa;
    padding: 2rem;
    border-radius: 10px;
    transition: transform 0.3s;
}

.project-card:hover {
    transform: translateY(-5px);
}

/* Contact section */
#contact {
    background-color: #f8f9fa;
}

.contact-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 5px;
}

/* Footer */
footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }
    
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .about-content {
        grid-template-columns: 1fr;
    }
}
```js
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Here you would typically send the form data to a server
        alert('Thank you for your message! I will get back to you soon.');
        this.reset();
    });
}

// Header background change on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.createElement('button');
mobileMenuBtn.innerHTML = '☰';
mobileMenuBtn.style.display = 'none';
mobileMenuBtn.classList.add('mobile-menu-btn');

document.querySelector('nav').appendChild(mobileMenuBtn);

mobileMenuBtn.addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Show/hide mobile menu based on screen size
function handleResize() {
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (window.innerWidth <= 768) {
        mobileMenuBtn.style.display = 'block';
        navLinks.style.display = 'none';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.backgroundColor = 'white';
        navLinks.style.padding = '1rem';
    } else {
        mobileMenuBtn.style.display = 'none';
        navLinks.style.display = 'flex';
        navLinks.style.position = 'static';
    }
}

window.addEventListener('resize', handleResize);
handleResize();

// Project card animations
const projectCards = document.querySelectorAll('.project-card');
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

projectCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});
```

# README.md

# Portfolio Website

A modern, responsive portfolio website built with HTML5, CSS3, and JavaScript.

## Features

- **Responsive Design**: Optimized for all devices
- **Smooth Animations**: CSS transitions and JavaScript animations
- **Modern UI**: Clean, professional design
- **Project Showcase**: Grid layout for projects
- **Contact Form**: Functional contact section

## Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript
- Google Fonts

## Project Structure

```
portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── animations.js
└── assets/
    └── images/
```

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio.git
```

2. Navigate to the project directory:
```bash
cd portfolio
```

3. Open `index.html` in your web browser or use a local server.

## Usage

Simply open `index.html` in a web browser to view the portfolio. The website includes:

- Home section with hero area
- About section
- Projects showcase
- Contact information

## Customization

To customize this portfolio for your own use:

1. Update personal information in `index.html`
2. Replace placeholder images in `assets/images/`
3. Modify colors and styles in `css/style.css`
4. Add your own projects to the projects section

## Browser Support

This website supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/portfolio](https://github.com/yourusername/portfolio)