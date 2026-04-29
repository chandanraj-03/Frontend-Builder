/*
 * TestimonialSlider: Handles the testimonial slider component for the application.
 * Features:
 *   - Display one testimonial at a time with smooth slide transition
 *   - Auto-play transitions every 5 seconds with pause on hover
 *   - Previous and next arrow navigation buttons
 *   - Dot indicators showing total count and current position
 *   - Swipe gestures for touch/mobile devices
 *   - Configuration of animation speed via settings
 */
class TestimonialSlider {
  constructor(container, settings = {}) {
    this.container = container;
    this.settings = {
      autoPlayInterval: 5000,
      transitionDuration: 500,
      swipeSensitivity: 50,
      ...settings
    };
    document.documentElement.style.setProperty('--testimonial-transition-duration', `${this.settings.transitionDuration}ms`);
    this.slides = this.container.querySelectorAll('.slide');
    this.prevButton = this.container.querySelector('.prev');
    this.nextButton = this.container.querySelector('.next');
    this.dotsContainer = this.container.querySelector('.dots');
    if (!this.dotsContainer) {
      this.dotsContainer = document.createElement('div');
      this.dotsContainer.className = 'dots';
      this.container.appendChild(this.dotsContainer);
    }
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.slides.length; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      this.dotsContainer.appendChild(dot);
    }
    this.dots = this.dotsContainer.querySelectorAll('.dot');
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.currentSlideIndex = index;
        this.showSlide(index);
      });
    });
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prevSlide());
    }
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.container.addEventListener('mouseenter', this.stopAutoPlay.bind(this));
    this.container.addEventListener('mouseleave', this.startAutoPlay.bind(this));
    this.currentSlideIndex = 0;
    this.showSlide(0);
    this.startAutoPlay();
  }
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }
  handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = this.touchStartX - touchEndX;
    const diffY = this.touchStartY - touchEndY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.settings.swipeSensitivity) {
      if (diffX > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }
  showSlide(index) {
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.slides[index].classList.add('active');
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    this.currentSlideIndex = index;
  }
  nextSlide() {
    const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.showSlide(nextIndex);
  }
  prevSlide() {
    const prevIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prevIndex);
  }
  startAutoPlay() {
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.settings.autoPlayInterval);
  }
  stopAutoPlay() {
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.testimonial-slider').forEach(container => {
    new TestimonialSlider(container);
  });
});