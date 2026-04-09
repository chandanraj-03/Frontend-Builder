To solve this problem, we need to create a JavaScript function that dynamically shows and hides tooltips for multiple project cards based on user hover interactions. The tooltips are initially hidden using CSS (`display: none` or `opacity: 0`), and our JavaScript will manage their visibility when the user hovers over or moves away from the card.

### Approach
1. **Detect Reduced Motion Preference**: Modern browsers support the `prefers-reduced-motion` media query, which helps in optimizing user experience for users who prefer minimal animations. We'll check this preference to decide whether to apply transitions or not.
2. **Iterate Over Project Cards**: For each project card in the HTML document, we'll locate the hidden tooltip element.
3. **Handle Hover Events**:
   - **mouseenter**: When the user hovers over the card, the tooltip becomes visible. If reduced motion is preferred, we skip the transition for smoother performance; otherwise, we apply a smooth opacity transition.
   - **mouseleave**: When the user moves the mouse away, the tooltip hides. Again, we handle transitions based on the reduced motion preference.

### Solution Code
```javascript
document.addEventListener('DOMContentLoaded', function() {
  const isReducedMotion = (window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false;
  
  document.querySelectorAll('.project-card').forEach(card => {
    const tooltip = card.querySelector('.project-tooltip');
    if (!tooltip) return;
    
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
    
    card.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
      if (!isReducedMotion) {
        tooltip.style.transition = 'opacity 0.3s ease';
      }
    });
    
    card.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      if (!isReducedMotion) {
        tooltip.style.transition = 'opacity 0.3s ease';
      }
      setTimeout(() => {
        tooltip.style.display = 'none';
      }, 300);
    });
  });
});
```

### Explanation
1. **Reduced Motion Detection**: 
   - We first check if the browser supports the `prefers-reduced-motion` media query and if the user has set a preference for reduced motion. This helps us skip animations for better accessibility and performance.
   
2. **Card Processing**:
   - We select all elements with the class `.project-card` using `document.querySelectorAll`.
   - For each card, we locate the tooltip element with the class `.project-tooltip`.
   - Initially, the tooltip is hidden (`display: none`) and its opacity is set to 0.

3. **Hover Event Handling**:
   - **mouseenter**: When the user hovers over the card, we:
     - Set the tooltip's display to `block` to make it visible.
     - Set its opacity to 1.
     - If reduced motion is not preferred, we add a smooth transition (0.3 seconds) for the opacity change.
   - **mouseleave**: When the user moves the mouse away, we:
     - Set the tooltip's opacity to 0.
     - Add a transition if reduced motion is not preferred.
     - After a short delay (300ms), we set the display to `none` to fully hide the tooltip, ensuring it doesn't linger.

This approach ensures that tooltips are seamlessly visible during hover interactions while respecting user preferences for reduced motion, providing a smooth and accessible user experience. The solution dynamically adapts based on user settings and handles multiple project cards efficiently.