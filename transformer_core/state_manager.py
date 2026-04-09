"""State Manager for saving and loading project state."""

import json
import os
from datetime import datetime
from colorama import Fore, Style


# Stage names for reference
STAGES = {
    1: "conversation",
    2: "requirements", 
    3: "pages",
    4: "plan",
    5: "code",
    6: "review",
    7: "readme"
}


def save_state(project_dir: str, stage: int, stage_data: dict, 
               user_prompt: str = None, all_data: dict = None) -> str:
    """Save the current pipeline state to a JSON file.
    
    Args:
        project_dir: Path to the project output directory
        stage: Current stage number (1-8)
        stage_data: Data produced by the current stage
        user_prompt: Original user prompt (only needed for first save)
        all_data: All accumulated stage data so far
        
    Returns:
        Path to the saved state file
    """
    state_file = os.path.join(project_dir, "state.json")
    
    # Load existing state or create new
    if os.path.exists(state_file):
        with open(state_file, 'r', encoding='utf-8') as f:
            state = json.load(f)
    else:
        os.makedirs(project_dir, exist_ok=True)
        state = {
            "version": 1,
            "created_at": datetime.now().isoformat(),
            "user_prompt": user_prompt or "",
            "current_stage": 0,
            "stages": {}
        }
    
    # Update state
    stage_key = f"{stage}_{STAGES.get(stage, 'unknown')}"
    state["current_stage"] = stage
    state["stages"][stage_key] = stage_data
    state["updated_at"] = datetime.now().isoformat()
    
    # Save
    with open(state_file, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    
    print(f"{Fore.GREEN}[State] Saved progress at stage {stage}{Style.RESET_ALL}")
    return state_file


def load_state(project_dir: str) -> dict:
    """Load saved state from a project directory.
    
    Args:
        project_dir: Path to the project output directory
        
    Returns:
        Loaded state dictionary or None if not found
    """
    state_file = os.path.join(project_dir, "state.json")
    
    if not os.path.exists(state_file):
        return None
    
    with open(state_file, 'r', encoding='utf-8') as f:
        state = json.load(f)
    
    print(f"{Fore.CYAN}[State] Loaded state from stage {state.get('current_stage', 0)}{Style.RESET_ALL}")
    return state


def get_stage_data(state: dict, stage: int) -> dict:
    """Get data for a specific stage from saved state.
    
    Args:
        state: The loaded state dictionary
        stage: Stage number to retrieve
        
    Returns:
        Stage data or empty dict if not found
    """
    stage_key = f"{stage}_{STAGES.get(stage, 'unknown')}"
    return state.get("stages", {}).get(stage_key, {})


def get_resume_info(state: dict) -> tuple:
    """Get information about resuming from saved state.
    
    Args:
        state: The loaded state dictionary
        
    Returns:
        Tuple of (current_stage, user_prompt, readable_stage_name)
    """
    current_stage = state.get("current_stage", 0)
    user_prompt = state.get("user_prompt", "")
    stage_name = STAGES.get(current_stage, "unknown")
    
    return current_stage, user_prompt, stage_name
