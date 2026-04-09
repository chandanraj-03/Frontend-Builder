"""README Agent - Generates project documentation."""

import os
from typing import Dict, List
from colorama import Fore
from .base_agent import BaseAgent
from config import SYSTEM_PROMPTS


class ReadmeAgent(BaseAgent):
    """Agent that creates project documentation."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="README Agent",
            system_prompt=SYSTEM_PROMPTS["readme"],
            model=model
        )
    
    def run(self, conversation_data: Dict, requirements: Dict, pages: Dict, 
            generated_files: Dict, output_dir: str) -> str:
        """Generate README documentation for the project.
        
        Args:
            conversation_data: Original user request analysis with enhanced fields
            requirements: Structured requirements with priority matrix
            pages: Page information
            generated_files: Dictionary of all generated files
            output_dir: Output directory
            
        Returns:
            README content as string
        """
        self.log(f"Generating README documentation...", Fore.GREEN)
        
        # Handle case where upstream agents returned lists instead of dicts
        if isinstance(pages, list):
            pages = {'pages': pages}
        elif not isinstance(pages, dict):
            pages = {}
        if isinstance(conversation_data, list):
            conversation_data = {'features': conversation_data}
        elif not isinstance(conversation_data, dict):
            conversation_data = {}
        if isinstance(requirements, list):
            requirements = {'functional_requirements': requirements}
        elif not isinstance(requirements, dict):
            requirements = {}
        
        page_list = pages.get('pages', [])
        page_names = [p.get('name', '') for p in page_list]
        file_list = list(generated_files.keys())
        
        # Extract new enhanced fields
        complexity = conversation_data.get('complexity', 'medium')
        tech_preferences = conversation_data.get('tech_preferences', [])
        must_have = conversation_data.get('must_have_features', [])
        nice_to_have = conversation_data.get('nice_to_have_features', [])
        target_audience = conversation_data.get('target_audience', 'General users')
        
        # Get estimated effort from requirements
        estimated_effort = requirements.get('estimated_effort', '3-5 days')
        
        prompt = f"""Create a README.md for this web application:

Project Type: {conversation_data.get('app_type', 'Web Application')}
Summary: {conversation_data.get('summary', '')}
Complexity: {complexity}
Target Audience: {target_audience}

Core Features (Must-Have):
{must_have if must_have else conversation_data.get('features', [])}

Additional Features (Nice-to-Have):
{nice_to_have}

Technology Stack:
- HTML5, CSS3, JavaScript
{self._format_tech_preferences(tech_preferences)}

Pages: {page_names}

Files in Project:
{file_list}

Functional Requirements:
{requirements.get('functional_requirements', [])}

Estimated Development Effort: {estimated_effort}

Create a comprehensive README with:
1. Project title and description (catchy and professional)
2. Features list (highlight core features)
3. Technologies used (HTML, CSS, JavaScript + any mentioned tech)
4. Setup instructions (just open index.html in browser)
5. Usage guide with screenshots description
6. File structure
7. Target audience
8. Future enhancements (from nice-to-have features)
9. Contributing guidelines (brief)
10. License placeholder

Return ONLY the markdown content."""

        readme_content = self.send_prompt(prompt)
        
        # Clean up the result
        readme_content = self._clean_markdown(readme_content)
        
        # Save README
        readme_path = os.path.join(output_dir, "README.md")
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(readme_content)
        
        self.log(f"Saved: README.md ({len(readme_content)} chars)", Fore.GREEN)
        self.log(f"Documentation includes {len(must_have)} core features", Fore.CYAN)
        
        return readme_content
    
    def _format_tech_preferences(self, tech_preferences: List) -> str:
        """Format technology preferences for the prompt."""
        if not tech_preferences:
            return ""
        return "\n".join([f"- {tech}" for tech in tech_preferences])
    
    def _clean_markdown(self, content: str) -> str:
        """Clean up markdown content from code blocks."""
        content = content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            # Remove first line if it's just ```markdown or ```
            if lines[0].strip() in ["```markdown", "```md", "```"]:
                lines = lines[1:]
            # Remove last line if it's ```
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            content = "\n".join(lines)
        return content

