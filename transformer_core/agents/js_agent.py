"""JS Agent - Generates JavaScript code for interactivity."""

import re
from colorama import Fore
from .base_agent import BaseAgent
from config import SYSTEM_PROMPTS


class JSAgent(BaseAgent):
    """Agent that generates JavaScript code for interactivity."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="JS Agent",
            system_prompt=SYSTEM_PROMPTS["js"],
            model=model
        )
    
    def _clean_js_response(self, response: str) -> str:
        """Clean up JavaScript response, removing markdown blocks and thinking."""
        response = response.strip()
        
        # Remove thinking blocks if present (qwen3 uses <think> tags)
        if "<think>" in response:
            response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL)
            response = response.strip()
        
        # Remove markdown code blocks if present
        if response.startswith("```"):
            lines = response.split("\n")
            # Remove first line (```javascript, ```js)
            lines = lines[1:]
            # Remove last line if it's ```
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response = "\n".join(lines)
        
        return response.strip()
    
    def run(self, pages: list, requirements: dict) -> str:
        """Generate JavaScript code for application interactivity.
        
        Args:
            pages: List of all pages with their components
            requirements: Functional requirements
            
        Returns:
            JavaScript code as string
        """
        self.log(f"Generating JavaScript...", Fore.YELLOW)
        
        # Collect all components and their interactions
        all_components = set()
        for page in pages:
            for component in page.get('components', []):
                all_components.add(component)
        
        func_reqs = requirements.get('functional_requirements', [])
        
        prompt = f"""Create JavaScript code for a web application. Return ONLY the JavaScript code, no explanations:

Components: {list(all_components)}
Functional Requirements: {func_reqs}
Number of Pages: {len(pages)}

Create JavaScript that:
- Handles button clicks and form submissions
- Provides smooth animations
- Manages any interactive components
- Uses modern ES6+ syntax
- Includes helpful comments

Requirements:
- Do NOT use markdown code blocks
- Return ONLY pure JavaScript code
- Start with a DOMContentLoaded event listener"""

        result = self.send_prompt(prompt)
        result = self._clean_js_response(result)
        
        self.log(f"Generated JavaScript ({len(result)} characters)", Fore.YELLOW)
        return result
    
    def run_for_file(self, js_file: str, pages: list, requirements: dict) -> str:
        """Generate JavaScript for a specific file based on its purpose.
        
        Args:
            js_file: The JS filename (e.g., 'js/cart.js')
            pages: List of all pages with their components
            requirements: Functional requirements
            
        Returns:
            JavaScript code as string
        """
        import os
        filename = os.path.basename(js_file)
        purpose = self._get_purpose_from_filename(filename)
        
        self.log(f"Generating JavaScript for: {js_file} ({purpose})", Fore.YELLOW)
        
        # Collect all components and their interactions
        all_components = set()
        for page in pages:
            for component in page.get('components', []):
                all_components.add(component)
        
        func_reqs = requirements.get('functional_requirements', [])
        
        prompt = f"""Create JavaScript code for {js_file}. Return ONLY the JavaScript code, no explanations:

File Purpose: {purpose}
Components: {list(all_components)}
Functional Requirements: {func_reqs}
Number of Pages: {len(pages)}

Create JavaScript that:
- Handles {purpose} functionality specifically
- Provides smooth animations
- Manages interactive components related to {purpose}
- Uses modern ES6+ syntax
- Includes helpful comments

Requirements:
- Do NOT use markdown code blocks
- Return ONLY pure JavaScript code
- Start with appropriate comments explaining this module's purpose"""

        result = self.send_prompt(prompt)
        result = self._clean_js_response(result)
        
        self.log(f"Generated {js_file} ({len(result)} characters)", Fore.YELLOW)
        return result
    
    def _get_purpose_from_filename(self, filename: str) -> str:
        """Determine the purpose of a JS file from its filename."""
        name = filename.replace('.js', '').lower()
        
        purpose_map = {
            'main': 'core application logic, initialization, and shared utilities',
            'script': 'general application interactivity and event handling',
            'catalog': 'product catalog display, filtering, searching, and product cards',
            'cart': 'shopping cart functionality including add/remove items and quantity management',
            'checkout': 'checkout process, form validation, payment flow, and order submission',
            'navigation': 'navigation menu, mobile menu toggle, and routing',
            'utils': 'utility functions and helpers',
            'api': 'API calls and data fetching',
            'auth': 'authentication and user session management',
            'forms': 'form validation and submission handling',
        }
        
        return purpose_map.get(name, f'{name} related functionality')
