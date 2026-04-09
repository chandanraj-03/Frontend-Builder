"""Conversation Agent - Parses user prompts and extracts key features."""

from colorama import Fore
from typing import Dict, List, Optional
from datetime import datetime
import json
from .base_agent import BaseAgent
from config import SYSTEM_PROMPTS


class ConversationAgent(BaseAgent):
    """Agent that reads user prompts and extracts key features for web application planning."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="Conversation Agent",
            system_prompt=SYSTEM_PROMPTS["conversation"],
            model=model
        )
        # Cache for similar prompts to reduce API calls
        self._prompt_cache = {}
    
    def run(self, user_prompt: str) -> Dict:
        """Analyze user prompt and extract key features.
        
        Args:
            user_prompt: The user's description of what they want to build
            
        Returns:
            Dictionary with extracted features including:
            - app_type: Type of application (e-commerce, blog, dashboard, etc.)
            - features: List of required features
            - design_preferences: UI/UX preferences
            - target_audience: Intended users
            - summary: Brief summary of the application
            - complexity: Estimated complexity level (simple/medium/complex)
            - timeline: If mentioned, any timeline constraints
            - tech_preferences: Mentioned technology preferences
        """
        self.log(f"Analyzing user prompt...", Fore.GREEN)
        
        # Check cache for similar prompts
        prompt_hash = hash(user_prompt.strip().lower())
        if prompt_hash in self._prompt_cache:
            self.log("Using cached analysis for similar prompt", Fore.YELLOW)
            return self._prompt_cache[prompt_hash]
        
        # Enhanced prompt with more specific guidance
        prompt = f"""Analyze this user request for a web application and extract the key features:

User Request: {user_prompt}

Extract the following information:
1. app_type: Type of application (e-commerce, blog, dashboard, portfolio, SaaS, etc.)
2. features: List of specific features mentioned or implied
3. design_preferences: Any UI/UX preferences mentioned (modern, minimalist, colorful, etc.)
4. target_audience: Who will use this application (businesses, students, general public, etc.)
5. summary: A concise 1-2 sentence summary of what the app should do
6. complexity: Estimate complexity as 'simple', 'medium', or 'complex'
7. timeline: Any mentioned timeline or urgency
8. tech_preferences: Any specific technologies mentioned (React, Django, MongoDB, etc.)
9. must_have_features: Critical features that are explicitly required
10. nice_to_have_features: Optional features that would be beneficial

Consider implicit requirements and common patterns for the app_type.

Respond ONLY with valid JSON matching this structure:"""
        
        json_schema = {
            "app_type": "string",
            "features": ["list", "of", "strings"],
            "design_preferences": "string or null",
            "target_audience": "string or null",
            "summary": "string",
            "complexity": "simple/medium/complex",
            "timeline": "string or null",
            "tech_preferences": ["list", "of", "strings"] or None,
            "must_have_features": ["list", "of", "strings"],
            "nice_to_have_features": ["list", "of", "strings"]
        }
        
        prompt += f"\n\n{json.dumps(json_schema, indent=2)}\n\nJSON Response:"
        
        try:
            result = self.send_prompt(prompt, expect_json=True)
            
            # Handle case where LLM returns a list instead of a dict
            if isinstance(result, list):
                result = {'features': result}
            elif not isinstance(result, dict):
                result = {}
            
            # Validate and enhance the result
            validated_result = self._validate_and_enhance_result(result, user_prompt)
            
            # Cache the result
            self._prompt_cache[prompt_hash] = validated_result
            
            self.log(f"Extracted app type: {validated_result.get('app_type', 'Unknown')}", Fore.GREEN)
            self.log(f"Found {len(validated_result.get('features', []))} total features", Fore.GREEN)
            self.log(f"Complexity: {validated_result.get('complexity', 'unknown')}", Fore.CYAN)
            
            return validated_result
            
        except json.JSONDecodeError as e:
            self.log(f"Failed to parse JSON response: {e}", Fore.RED)
            return self._get_fallback_response(user_prompt)
        except Exception as e:
            self.log(f"Error analyzing prompt: {e}", Fore.RED)
            return self._get_fallback_response(user_prompt)
    
    def _validate_and_enhance_result(self, result: Dict, original_prompt: str) -> Dict:
        """Validate and enhance the extracted result."""
        
        # Ensure all required keys exist with defaults
        default_result = {
            "app_type": "web_application",
            "features": [],
            "design_preferences": None,
            "target_audience": "general",
            "summary": original_prompt[:200] + "...",
            "complexity": "medium",
            "timeline": None,
            "tech_preferences": [],
            "must_have_features": [],
            "nice_to_have_features": [],
            "analysis_timestamp": datetime.now().isoformat(),
            "original_prompt_length": len(original_prompt)
        }
        
        # Merge with defaults
        for key, default_value in default_result.items():
            if key not in result:
                result[key] = default_value
        
        # Ensure features is a list
        if not isinstance(result["features"], list):
            result["features"] = [str(result["features"])]
        
        # Estimate complexity based on feature count if not provided
        if result["complexity"] not in ["simple", "medium", "complex"]:
            feature_count = len(result["features"])
            if feature_count < 3:
                result["complexity"] = "simple"
            elif feature_count < 7:
                result["complexity"] = "medium"
            else:
                result["complexity"] = "complex"
        
        return result
    
    def _get_fallback_response(self, user_prompt: str) -> Dict:
        """Provide a fallback response when analysis fails."""
        return {
            "app_type": "web_application",
            "features": ["responsive_design", "user_authentication"],
            "design_preferences": "modern",
            "target_audience": "general",
            "summary": user_prompt[:150] + "..." if len(user_prompt) > 150 else user_prompt,
            "complexity": "medium",
            "timeline": None,
            "tech_preferences": [],
            "must_have_features": [],
            "nice_to_have_features": [],
            "error": "analysis_failed",
            "original_prompt": user_prompt
        }
    
    def clear_cache(self):
        """Clear the prompt analysis cache."""
        self._prompt_cache.clear()
        self.log("Cleared analysis cache", Fore.YELLOW)
    
    def batch_analyze(self, prompts: List[str]) -> List[Dict]:
        """Analyze multiple prompts efficiently."""
        results = []
        for prompt in prompts:
            try:
                result = self.run(prompt)
                results.append(result)
            except Exception as e:
                self.log(f"Failed to analyze prompt: {e}", Fore.RED)
                results.append(self._get_fallback_response(prompt))
        return results