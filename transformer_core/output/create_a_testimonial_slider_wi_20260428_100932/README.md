# Professional Portfolio Website with Testimonial Slider

A responsive portfolio website featuring an interactive testimonial slider component that showcases customer reviews with smooth animations, touch support, and customizable settings for an engaging user experience.

## Features

- **Multi-page portfolio structure** (Home, About, Projects, Contact)
- **Responsive testimonial slider** on the home page with:
  - Single testimonial display with smooth slide transitions
  - Complete testimonial cards showing quote text, avatar image, name, role/company, and star rating
  - Auto-play transitions every 5 seconds with pause-on-hover functionality
  - Previous/next navigation arrows with keyboard support
  - Dot indicators showing current position and total testimonials
  - Full swipe support for touch/mobile devices
  - Configurable animation speed via JavaScript settings
  - Mobile-first responsive design for all screen sizes

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- JavaScript (ES6+)

## Setup

1. Download or clone the repository
2. Open `index.html` in any modern web browser
3. Navigate between pages using the navigation menu

*No build process or dependencies required - works with any modern browser*

## Usage Guide

### Home Page
- The testimonial slider automatically cycles through customer reviews every 5 seconds
- Hover over the slider to pause auto-play
- Use left/right arrow buttons for manual navigation
- Tap or swipe on mobile devices to change testimonials
- Dot indicators show current position (e.g., "• • ★ •" for 4th of 4 testimonials)
- Star ratings visually represent review quality

### Other Pages
- **About**: Professional bio and skills section
- **Projects**: Gallery of work with project descriptions
- **Contact**: Simple contact form with validation

![Portfolio Screenshot Description](screenshot-placeholder.png)  
*Example: Testimonial slider showing a customer quote with avatar, name, role, and star ratings. Navigation arrows and dot indicators visible below.*

## File Structure

```
portfolio/
├── css/
│   └── style.css          # All CSS styles and responsive media queries
├── js/
│   └── script.js          # JavaScript for testimonial slider and page navigation
├── index.html             # Home page with testimonial slider
├── about.html             # About section page
├── projects.html          # Projects showcase page
└── contact.html           # Contact form page
```

## Target Audience

This portfolio is designed for potential employers, clients, and collaborators to view professional work and background information. The specific target audience was not defined in project requirements, but it serves general professional networking purposes.

## Future Enhancements

- Dynamic testimonial loading from JSON/API
- Dark/light mode toggle
- Project filtering and sorting
- Contact form with server-side processing
- Social media integration
- Project detail pages with galleries
- Animation enhancements for page transitions

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.