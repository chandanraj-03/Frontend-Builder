"""CSS Agent - Generates CSS styles for web pages."""

import re
from colorama import Fore
from .base_agent import BaseAgent
from config import SYSTEM_PROMPTS


class CSSAgent(BaseAgent):
    """Agent that generates CSS styles."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="CSS Agent",
            system_prompt=SYSTEM_PROMPTS["css"],
            model=model
        )
    
    def _clean_css_response(self, response: str) -> str:
        """Clean up CSS response, removing markdown blocks, thinking, and explanatory text."""
        response = response.strip()
        
        # Remove thinking blocks if present (qwen3 uses <think> tags)
        if "<think>" in response:
            response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL)
            response = response.strip()
        
        # Extract CSS from markdown code blocks anywhere in the response
        css_block_match = re.search(r'```(?:css)?\s*\n(.*?)```', response, re.DOTALL | re.IGNORECASE)
        if css_block_match:
            response = css_block_match.group(1).strip()
        else:
            # Try to find CSS content by looking for :root or first CSS selector
            css_start = re.search(r'(:root\s*\{|[a-zA-Z\.#\*\[\@][^{]*\{)', response)
            if css_start:
                response = response[css_start.start():]
        
        # Remove any trailing explanatory text (after last closing brace)
        last_brace = response.rfind('}')
        if last_brace != -1:
            response = response[:last_brace + 1]
        
        # Remove any leading text before CSS (look for :root or first selector)
        css_start = re.search(r'(:root\s*\{|/\*|[a-zA-Z\.#\*\[\@][^{]*\{)', response)
        if css_start and css_start.start() > 0:
            response = response[css_start.start():]
        
        return response.strip()
    
    def run(self, pages: list, requirements: dict, color_theme: dict = None) -> str:
        """Generate CSS styles for the entire application.
        
        Args:
            pages: List of all pages with their components
            requirements: Requirements including UI/UX preferences
            color_theme: Optional color theme dict with primary, secondary, accent, etc.
            
        Returns:
            CSS code as string
        """
        self.log(f"Generating CSS styles...", Fore.MAGENTA)
        
        # Collect all components across pages
        all_components = set()
        for page in pages:
            for component in page.get('components', []):
                all_components.add(component)
        
        ui_reqs = requirements.get('ui_ux_requirements', [])
        
        # Build theme instruction
        theme_instruction = ""
        if color_theme:
            theme_instruction = f"""
Use EXACTLY these colors in your CSS variables:
- Primary color: {color_theme.get('primary', '#3498db')}
- Secondary color: {color_theme.get('secondary', '#2ecc71')}
- Accent color: {color_theme.get('accent', '#e74c3c')}
- Background color: {color_theme.get('background', '#f8f9fa')}
- Text color: {color_theme.get('text', '#2c3e50')}
- Surface/card color: {color_theme.get('surface', '#ffffff')}
Theme name: {color_theme.get('name', 'Custom')}
"""
        
        prompt = f"""Create CSS styles for a web application. Return ONLY the CSS code, no explanations:

Components to Style: {list(all_components)}
UI/UX Requirements: {ui_reqs}
Number of Pages: {len(pages)}
{theme_instruction}
Create modern, responsive CSS with:
- CSS variables for colors and spacing
- Mobile-first responsive design
- Flexbox/Grid layouts
- Hover effects and transitions
- Clean navigation styles
- Beautiful form styles if needed

Requirements:
- Do NOT use markdown code blocks
- Return ONLY pure CSS code
- Start with CSS custom properties (:root)"""
        
        result = self.send_prompt(prompt)
        result = self._clean_css_response(result)
        
        self.log(f"Generated CSS ({len(result)} characters)", Fore.MAGENTA)
        return result
