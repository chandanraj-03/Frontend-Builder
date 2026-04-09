"""HTML Agent - Generates HTML code for web pages."""

import re
from colorama import Fore
from .base_agent import BaseAgent
from config import SYSTEM_PROMPTS


class HTMLAgent(BaseAgent):
    """Agent that generates HTML code for web pages."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="HTML Agent",
            system_prompt=SYSTEM_PROMPTS["html"],
            model=model
        )
    
    def _clean_html_response(self, response: str) -> str:
        """Clean up HTML response, removing markdown blocks and thinking."""
        response = response.strip()
        
        # Remove thinking blocks if present (qwen3 uses <think> tags)
        if "<think>" in response:
            response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL)
            response = response.strip()
        
        # Remove markdown code blocks if present
        if response.startswith("```"):
            lines = response.split("\n")
            # Remove first line (```html)
            lines = lines[1:]
            # Remove last line if it's ```
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response = "\n".join(lines)
        
        # If response still doesn't start with <!DOCTYPE or <html, try to find HTML
        if not response.strip().lower().startswith(('<!doctype', '<html')):
            # Try to extract HTML from the response
            html_match = re.search(r'(<!DOCTYPE.*|<html.*)', response, re.IGNORECASE | re.DOTALL)
            if html_match:
                response = response[html_match.start():]
        
        return response.strip()
    
    def run(self, page_info: dict, all_pages: list, css_path: str = "css/style.css", js_files: list = None, css_classes: list = None) -> str:
        """Generate HTML code for a specific page.
        
        Args:
            page_info: Information about the page to generate
            all_pages: List of all pages for navigation
            css_path: Path to CSS file
            js_files: List of JS file paths to include
            css_classes: List of available CSS classes from the stylesheet
            
        Returns:
            HTML code as string
        """
        if js_files is None:
            js_files = ["js/script.js"]
        
        page_name = page_info.get('name', 'Page')
        page_filename = page_info.get('filename', 'index.html')
        page_purpose = page_info.get('purpose', 'Page content')
        page_components = page_info.get('components', [])
        
        self.log(f"Generating HTML for: {page_name}", Fore.CYAN)
        
        # Create navigation info with proper filenames
        nav_pages = []
        for p in all_pages:
            filename = p.get('filename', '')
            if not filename:
                filename = p.get('name', 'page').lower().replace(' ', '_') + '.html'
            if not filename.endswith('.html'):
                filename = filename + '.html'
            nav_pages.append({"name": p.get('name', 'Page'), "file": filename, "link": filename})
        
        components = page_info.get('components', [])
        purpose = page_info.get('purpose', 'Main page')
        
        # Build CSS classes hint if available
        css_hint = ""
        if css_classes:
            css_hint = f"\nRecommended CSS Classes to use: {', '.join(css_classes[:30])}"
        
        # Create component-specific content guidance
        component_guidance = self._get_component_guidance(components, page_name)
        
        # Build JS script tags
        js_script_tags = "\n    ".join([f'<script src="{js}"></script>' for js in js_files])
        
        # Build navigation links HTML example
        nav_html_example = ""
        if nav_pages:
            nav_html_example = "Example navigation links:\n" + "\n".join([f"    <li><a href=\"{p['file']}\">{p['name']}</a></li>" for p in nav_pages])
        
        prompt = f"""Create a COMPLETE, CONTENT-RICH HTML page for: {page_name}

PURPOSE: {purpose}
COMPONENTS: {components}
ALL NAVIGATION PAGES: {nav_pages}

YOUR PAGE MUST INCLUDE:
1. Full HTML5 structure (<!DOCTYPE html>, <html>, <head>, <body>)
2. Navigation menu with links to ALL pages: {nav_pages}
3. REAL, MEANINGFUL CONTENT - NOT placeholders
4. Proper semantic HTML: <header>, <nav>, <main>, <section>, <footer>
5. Link to CSS: <link rel="stylesheet" href="{css_path}">
6. These script tags before </body>:
{js_script_tags}

CRITICAL - MUST GENERATE REAL CONTENT:
{component_guidance}

NAVIGATION EXAMPLE:
{nav_html_example}

FORBIDDEN:
- Empty divs or "content goes here" placeholders
- Markdown code blocks
- Explanations or comments
- Return ONLY raw HTML

Return the COMPLETE HTML starting with <!DOCTYPE html>"""
        
        result = self.send_prompt(prompt)
        result = self._clean_html_response(result)
        
        self.log(f"Generated HTML ({len(result)} characters)", Fore.CYAN)
        return result
    
    def _get_component_guidance(self, components: list, page_name: str) -> str:
        """Generate specific guidance based on page components."""
        guidance_parts = []
        
        component_hints = {
            "product": "Create 6-8 product cards with: image placeholder (use data-src), product name, price ($X.XX format), 'Add to Cart' button, and stock status",
            "cart": "Include shopping cart section with: item list, quantity controls, remove buttons, subtotal, and checkout button",
            "category": "Show category cards/filters with: category names, item counts, and clickable links",
            "header": "Create header with: logo/brand name, navigation menu, search bar, and cart icon with item count",
            "hero": "Add hero section with: large headline, subtext, and prominent CTA button",
            "footer": "Include footer with: about section, quick links, contact info, social icons, and copyright",
            "form": "Create form with: labeled inputs, validation attributes, and styled submit button",
            "gallery": "Add image gallery grid with: thumbnails, lightbox data attributes, and captions",
            "testimonial": "Include 3-4 testimonial cards with: quote, author name, role, and avatar placeholder",
            "pricing": "Create pricing table with: plan names, features lists, prices, and CTA buttons",
            "search": "Add search component with: input field, search button, and filter options",
            "navigation": "Build navigation with: logo, menu items, dropdown if needed, and mobile toggle",
            "sidebar": "Create sidebar with: category filters, price range, sort options",
            "checkout": "Build checkout form with: shipping info, payment fields, order summary",
            "inventory": "Show inventory management with: stock levels, reorder buttons, status indicators"
        }
        
        for component in components:
            component_lower = component.lower()
            for key, hint in component_hints.items():
                if key in component_lower:
                    guidance_parts.append(f"- {component}: {hint}")
                    break
        
        if guidance_parts:
            return "COMPONENT-SPECIFIC GUIDANCE:\n" + "\n".join(guidance_parts)
        return ""
