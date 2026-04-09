"""Requirement Agent - Organizes features into structured requirements."""

from typing import Dict, List
from colorama import Fore
from .base_agent import BaseAgent
from config import SYSTEM_PROMPTS


class RequirementAgent(BaseAgent):
    """Agent that organizes user ideas into structured requirements."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="Requirement Agent",
            system_prompt=SYSTEM_PROMPTS["requirement"],
            model=model
        )
    
    def run(self, conversation_data: Dict) -> Dict:
        """Convert conversation analysis into structured requirements.
        
        Args:
            conversation_data: Output from ConversationAgent containing:
                - app_type, features, design_preferences, target_audience
                - complexity, timeline, tech_preferences
                - must_have_features, nice_to_have_features
            
        Returns:
            Dictionary with structured requirements including:
                - functional_requirements
                - non_functional_requirements
                - ui_ux_requirements
                - technical_requirements
                - priority_matrix
        """
        self.log(f"Organizing requirements...", Fore.MAGENTA)
        
        # Extract new enhanced fields
        complexity = conversation_data.get('complexity', 'medium')
        timeline = conversation_data.get('timeline', 'flexible')
        tech_preferences = conversation_data.get('tech_preferences', [])
        must_have = conversation_data.get('must_have_features', [])
        nice_to_have = conversation_data.get('nice_to_have_features', [])
        
        prompt = f"""Based on this analysis of the user's web application request, create structured requirements:

Application Type: {conversation_data.get('app_type', 'Unknown')}
Features Requested: {conversation_data.get('features', [])}
Design Preferences: {conversation_data.get('design_preferences', 'modern')}
Target Audience: {conversation_data.get('target_audience', 'General')}
Summary: {conversation_data.get('summary', '')}

Project Complexity: {complexity}
Timeline: {timeline}
Technology Preferences: {tech_preferences}

Must-Have Features (High Priority):
{must_have}

Nice-to-Have Features (Lower Priority):
{nice_to_have}

Create requirements in JSON format with these categories:
1. functional_requirements: Core features the app must have
2. non_functional_requirements: Performance, security, scalability needs
3. ui_ux_requirements: Design and user experience requirements
4. technical_requirements: Technologies and implementation specifics
5. priority_matrix: Features categorized by priority (critical/high/medium/low)

Consider the complexity level '{complexity}' when estimating scope."""

        result = self.send_prompt(prompt, expect_json=True)
        
        # Handle case where LLM returns a list instead of a dict
        if isinstance(result, list):
            result = {'functional_requirements': result}
        elif not isinstance(result, dict):
            result = {}
        
        # Validate and enhance result
        result = self._enhance_requirements(result, conversation_data)
        
        func_reqs = result.get('functional_requirements', [])
        self.log(f"Created {len(func_reqs)} functional requirements", Fore.MAGENTA)
        self.log(f"Complexity: {complexity} | Priority items: {len(result.get('priority_matrix', {}).get('critical', []))}", Fore.CYAN)
        
        return result
    
    def _enhance_requirements(self, result: Dict, conversation_data: Dict) -> Dict:
        """Validate and enhance requirements with defaults."""
        defaults = {
            'functional_requirements': [],
            'non_functional_requirements': [],
            'ui_ux_requirements': [],
            'technical_requirements': [],
            'priority_matrix': {'critical': [], 'high': [], 'medium': [], 'low': []},
            'complexity': conversation_data.get('complexity', 'medium'),
            'estimated_effort': self._estimate_effort(conversation_data.get('complexity', 'medium'))
        }
        
        for key, default in defaults.items():
            if key not in result:
                result[key] = default
            elif isinstance(default, dict) and not isinstance(result[key], dict):
                # Fix type mismatch: expected dict but got something else
                result[key] = default
            elif isinstance(default, list) and not isinstance(result[key], list):
                # Fix type mismatch: expected list but got something else
                result[key] = [result[key]] if result[key] else default
        
        return result
    
    def _estimate_effort(self, complexity: str) -> str:
        """Estimate development effort based on complexity."""
        effort_map = {
            'simple': '1-2 days',
            'medium': '3-5 days',
            'complex': '1-2 weeks'
        }
        return effort_map.get(complexity, '3-5 days')

