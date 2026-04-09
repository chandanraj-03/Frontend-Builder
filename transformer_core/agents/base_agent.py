"""Base Agent class with Ollama integration."""

import json
import re
import ollama
from colorama import Fore, Style


class BaseAgent:
    """Base class for all agents with Ollama integration."""
    
    def __init__(self, name: str, system_prompt: str, model: str = "qwen3:8b"):
        """Initialize the base agent.
        
        Args:
            name: Name of the agent for display purposes
            system_prompt: System prompt defining agent behavior
            model: Ollama model to use
        """
        self.name = name
        self.system_prompt = system_prompt
        self.model = model
        self.conversation_history = []
    
    def log(self, message: str, color: str = Fore.WHITE):
        """Log a message with agent name prefix."""
        print(f"{color}[{self.name}]{Style.RESET_ALL} {message}")
    
    def send_prompt(self, user_prompt: str, expect_json: bool = False) -> str:
        """Send a prompt to Ollama and get response with automatic retry.
        
        Args:
            user_prompt: The user's prompt to send
            expect_json: If True, attempts to parse response as JSON
            
        Returns:
            The model's response text or parsed JSON
        """
        self.log(f"Processing...", Fore.CYAN)
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            *self.conversation_history,
            {"role": "user", "content": user_prompt}
        ]
        
        max_retries = 3
        base_delay = 2  # seconds
        
        for attempt in range(1, max_retries + 1):
            try:
                response = ollama.chat(
                    model=self.model,
                    messages=messages
                )
                
                assistant_message = response["message"]["content"]
                
                # Add to conversation history
                self.conversation_history.append({"role": "user", "content": user_prompt})
                self.conversation_history.append({"role": "assistant", "content": assistant_message})
                
                if expect_json:
                    return self._parse_json_response(assistant_message)
                
                return assistant_message
                
            except Exception as e:
                if attempt < max_retries:
                    delay = base_delay * (2 ** (attempt - 1))  # 2s, 4s, 8s
                    self.log(f"Attempt {attempt}/{max_retries} failed: {str(e)}", Fore.YELLOW)
                    self.log(f"Retrying in {delay}s...", Fore.YELLOW)
                    import time
                    time.sleep(delay)
                else:
                    self.log(f"All {max_retries} attempts failed: {str(e)}", Fore.RED)
                    raise
    
    def _parse_json_response(self, response: str) -> dict:
        """Parse JSON from response, handling markdown code blocks with validation."""
        # Remove markdown code blocks if present
        response = response.strip()
        
        # Try to find JSON in code blocks
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
        if json_match:
            response = json_match.group(1)
        
        # Try to find JSON object or array directly
        json_match = re.search(r'\{[\s\S]*\}', response)
        if not json_match:
            json_match = re.search(r'\[[\s\S]*\]', response)
        if json_match:
            response = json_match.group(0)
        
        try:
            parsed = json.loads(response)
            if not parsed:
                raise json.JSONDecodeError("Empty JSON result", response, 0)
            return parsed
        except json.JSONDecodeError as e:
            self.log(f"Error: JSON parsing failed: {str(e)}", Fore.RED)
            self.log(f"Response was: {response[:200]}...", Fore.YELLOW)
            raise
    
    def clear_history(self):
        """Clear conversation history."""
        self.conversation_history = []
    
    def run(self, input_data: any) -> any:
        """Run the agent's main task. Override in subclasses."""
        raise NotImplementedError("Subclasses must implement run()")
