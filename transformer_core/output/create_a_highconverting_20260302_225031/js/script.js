// Handles general application interactivity and event handling for the website

const header = document.querySelector('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('sticky', window.scrollY > 50);
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
const highlightActiveSection = () => {
  let currentSection = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 100) {
      currentSection = section.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
  });
};
window.addEventListener('scroll', highlightActiveSection);

let exitIntentTriggered = false;
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 0 && !exitIntentTriggered) {
    exitIntentTriggered = true;
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
      popup.classList.add('show');
    }
  }
});
const closePopup = document.querySelector('#exit-intent-popup .close');
if (closePopup) {
  closePopup.addEventListener('click', () => {
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
      popup.classList.remove('show');
    }
  });
}

const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    answer.classList.toggle('active');
    faqQuestions.forEach(q => {
      if (q !== question) {
        q.nextElementSibling.classList.remove('active');
      }
    });
  });
});

const features = document.querySelectorAll('.feature-item');
features.forEach(item => {
  item.addEventListener('mouseenter', () => item.classList.add('hover'));
  item.addEventListener('mouseleave', () => item.classList.remove('hover'));
});

const socialProofItems = document.querySelectorAll('.social-proof-item');
const socialObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      socialObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
socialProofItems.forEach(item => socialObserver.observe(item));

const pricingToggle = document.querySelector('.pricing-toggle');
if (pricingToggle) {
  pricingToggle.addEventListener('change', (e) => {
    const isYearly = e.target.checked;
    document.querySelectorAll('.pricing-card').forEach(card => {
      const priceElement = card.querySelector('.price');
      if (priceElement) {
        priceElement.textContent = isYearly ? card.dataset.yearly : card.dataset.monthly;
      }
    });
  });
}

const form = document.querySelector('#lead-capture-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[name="email"]').value;
    const name = form.querySelector('input[name="name"]').value;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    console.log('Form submitted', { email, name });
    form.reset();
  });
}

const heroCta = document.querySelector('.hero-cta');
if (heroCta) {
  heroCta.classList.add('animate-cta');
}

const trustBadges = document.querySelectorAll('.trust-badge');
const trustObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      trustObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
trustBadges.forEach(badge => trustObserver.observe(badge));

const menuButton = document.querySelector('.menu-button');
const navMenu = document.querySelector('.nav-menu');
if (menuButton && navMenu) {
  menuButton.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

document.addEventListener('click', (e) => {
  if (menuButton && navMenu && !menuButton.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
  }
});