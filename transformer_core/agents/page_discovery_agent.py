"""Page Discovery Agent - Determines all pages needed for the application."""

from colorama import Fore
from .base_agent import BaseAgent
from config import SYSTEM_PROMPTS


class PageDiscoveryAgent(BaseAgent):
    """Agent that analyzes requirements and lists all pages needed."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="Page Discovery Agent",
            system_prompt=SYSTEM_PROMPTS["page_discovery"],
            model=model
        )
    
    def run(self, requirements: dict, conversation_data: dict) -> dict:
        """Discover all pages needed for the web application.
        
        Args:
            requirements: Output from RequirementAgent
            conversation_data: Output from ConversationAgent
            
        Returns:
            Dictionary with page information
        """
        self.log(f"Discovering pages needed...", Fore.BLUE)
        
        prompt = f"""Based on these requirements, determine ALL pages needed for the web application:

Application Type: {conversation_data.get('app_type', 'Unknown')}
Functional Requirements: {requirements.get('functional_requirements', [])}
UI/UX Requirements: {requirements.get('ui_ux_requirements', [])}

Must respond in valid JSON format only:
{{
    "pages": [
        {{
            "name": "Page Name",
            "filename": "page-name.html",
            "purpose": "Brief purpose",
            "components": ["component1", "component2"]
        }}
    ]
}}

Requirements:
- Generate MULTIPLE pages (at least 2-4 for any app, 5+ for e-commerce/sites)
- Each page MUST have: name, filename, purpose, components
- Return ONLY valid JSON, no explanations
- Do NOT use markdown code blocks, return raw JSON"""

        try:
            result = self.send_prompt(prompt, expect_json=True)
        except Exception as e:
            self.log(f"Error getting page discovery response: {e}", Fore.RED)
            # Fallback to a default single page
            result = {'pages': [{"name": "Home", "filename": "index.html", "purpose": "Main page", "components": ["header", "content", "footer"]}]}
        
        # Validate and normalize result
        if not isinstance(result, dict):
            self.log(f"Warning: Expected dict, got {type(result)}", Fore.YELLOW)
            result = {}
        
        pages = result.get('pages', [])
        if not pages:
            self.log(f"Warning: No pages discovered, creating default", Fore.YELLOW)
            pages = [{"name": "Home", "filename": "index.html", "purpose": "Main page", "components": ["header", "content", "footer"]}]
            result = {'pages': pages}
        
        # Validate each page has required fields
        valid_pages = []
        for page in pages:
            if not isinstance(page, dict):
                continue
            # Ensure required fields exist
            if not page.get('name'):
                page['name'] = f"Page {len(valid_pages) + 1}"
            if not page.get('filename'):
                page['filename'] = page['name'].lower().replace(' ', '-') + '.html'
            if not page.get('filename').endswith('.html'):
                page['filename'] = page['filename'] + '.html'
            if not page.get('purpose'):
                page['purpose'] = f"{page['name']} page"
            if not page.get('components'):
                page['components'] = ['header', 'content', 'footer']
            valid_pages.append(page)
        
        result['pages'] = valid_pages
        
        self.log(f"Discovered {len(valid_pages)} pages needed", Fore.BLUE)
        for page in valid_pages:
            self.log(f"  - {page.get('name', 'Unknown')}: {page.get('purpose', '')} ({page.get('filename', '')})", Fore.BLUE)
        
        return result
