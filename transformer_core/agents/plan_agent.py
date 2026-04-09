"""Plan Agent - Breaks work into tasks and designs folder structure."""

from colorama import Fore
from .base_agent import BaseAgent
from config import SYSTEM_PROMPTS


class PlanAgent(BaseAgent):
    """Agent that breaks work into tasks and designs folder structure."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="Plan & Architecture Agent",
            system_prompt=SYSTEM_PROMPTS["plan"],
            model=model
        )
    
    def run(self, pages: dict, requirements: dict) -> dict:
        """Create development plan and folder structure.
        
        Args:
            pages: Output from PageDiscoveryAgent
            requirements: Output from RequirementAgent
            
        Returns:
            Dictionary with folder structure and tasks
        """
        self.log(f"Planning architecture...", Fore.YELLOW)
        
        page_list = pages.get('pages', [])
        page_names = [p.get('name', 'unknown') for p in page_list]
        
        prompt = f"""Create a development plan for a web application with these pages and requirements:

Pages: {page_names}
Page Details: {page_list}
Functional Requirements: {requirements.get('functional_requirements', [])}
UI/UX Requirements: {requirements.get('ui_ux_requirements', [])}

Design the folder structure and list all files to create in JSON format."""

        result = self.send_prompt(prompt, expect_json=True)
        
        # Handle case where LLM returns a list instead of a dict
        if isinstance(result, list):
            result = {'files_to_create': result}
        elif not isinstance(result, dict):
            result = {}
        
        files = result.get('files_to_create', [])
        self.log(f"Planned {len(files)} files to create", Fore.YELLOW)
        
        return result
