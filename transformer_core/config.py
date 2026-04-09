"""Configuration settings for the Multi-Agent Web Builder."""

import os

# Ollama Model Configuration
OLLAMA_MODEL = "qwen3-vl:8b"
OLLAMA_HOST = "http://localhost:11434"

# Output Directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")

# Available Models Registry
# Developers: Add new Ollama models here as {"key": "model_name"}
AVAILABLE_MODELS = {
    "qwen3-vl:8b": "Qwen3 Vision-Language 8B (default)",
    "qwen3-vl:2b": "Qwen3 Vision-Language 2B",
    "llama3.1:8b": "Llama3.1 8B",
    "deepseek-v3.1:671b-cloud": "DeepSeek V3.1 671B Cloud",
    "qwen3-next:80b-cloud": "Qwen3 Next 80B Cloud",
}

# UI model-tier keys → actual installed Ollama model names
MODEL_TIER_MAP = {
    "fast":     "qwen3-vl:2b",
    "balanced": "deepseek-v3.1:671b-cloud",
    "advanced": "qwen3-vl:8b",
    "qunique": "llama3.1:8b",
    "creative": "qwen3-next:80b-cloud",
    
}

# Color Themes for CSS Generation
COLOR_THEMES = {
    "default": {
        "name": "Default Blue",
        "primary": "#3498db",
        "secondary": "#2ecc71",
        "accent": "#e74c3c",
        "background": "#f8f9fa",
        "text": "#2c3e50",
        "surface": "#ffffff",
    },
    "dark": {
        "name": "Dark Mode",
        "primary": "#bb86fc",
        "secondary": "#03dac6",
        "accent": "#cf6679",
        "background": "#121212",
        "text": "#e0e0e0",
        "surface": "#1e1e1e",
    },
    "ocean": {
        "name": "Ocean Breeze",
        "primary": "#0077b6",
        "secondary": "#00b4d8",
        "accent": "#ff6b6b",
        "background": "#f0f8ff",
        "text": "#023e8a",
        "surface": "#caf0f8",
    },
    "sunset": {
        "name": "Sunset Glow",
        "primary": "#ff6b35",
        "secondary": "#f7c59f",
        "accent": "#004e89",
        "background": "#fff5ee",
        "text": "#1a1a2e",
        "surface": "#ffe8d6",
    },
    "forest": {
        "name": "Forest Green",
        "primary": "#2d6a4f",
        "secondary": "#52b788",
        "accent": "#d4a373",
        "background": "#f0f7f4",
        "text": "#1b4332",
        "surface": "#d8f3dc",
    },
    "rose": {
        "name": "Rose Gold",
        "primary": "#b5838d",
        "secondary": "#e5989b",
        "accent": "#6d6875",
        "background": "#fff0f3",
        "text": "#4a4e69",
        "surface": "#ffccd5",
    },
}

# Agent System Prompts
SYSTEM_PROMPTS = {
    "conversation": """You are a Conversation Agent. Your role is to analyze user prompts and extract key features they want in their web application.

When given a user prompt, extract:
1. Type of application (e.g., portfolio, e-commerce, blog, dashboard)
2. Main features the user wants
3. Any specific design preferences mentioned
4. Target audience if mentioned

Respond in JSON format:
{
    "app_type": "type of application",
    "features": ["feature1", "feature2"],
    "design_preferences": ["preference1", "preference2"],
    "target_audience": "audience description",
    "summary": "brief summary of what user wants"
}""",

    "requirement": """You are a Requirement Agent. Your role is to organize extracted features into structured requirements.

Given the conversation analysis, create:
1. Functional requirements (what the app must do)
2. Non-functional requirements (performance, usability)
3. UI/UX requirements (visual and interaction needs)

Respond in JSON format:
{
    "functional_requirements": ["req1", "req2"],
    "non_functional_requirements": ["req1", "req2"],
    "ui_ux_requirements": ["req1", "req2"]
}""",

    "page_discovery": """You are a Page Discovery Agent. Your role is to analyze requirements and determine all pages needed for the web application.

Based on the requirements, list:
1. All pages needed
2. Purpose of each page
3. Key components on each page
4. Navigation flow between pages

Respond in JSON format:
{
    "pages": [
        {
            "name": "page_name",
            "filename": "page_name.html",
            "purpose": "what this page does",
            "components": ["component1", "component2"],
            "navigation_to": ["other_page1", "other_page2"]
        }
    ]
}""",

    "plan": """You are a Plan and Architecture Agent. Your role is to break work into tasks and design the folder structure.

Based on the pages and requirements, create:
1. Folder structure for the project
2. List of files to create
3. Development tasks in order

Respond in JSON format:
{
    "folder_structure": {
        "root": ["file1.html", "file2.html"],
        "css": ["style.css"],
        "js": ["script.js"],
        "assets": ["images/"]
    },
    "files_to_create": [
        {"path": "index.html", "type": "html", "purpose": "main page"},
        {"path": "css/style.css", "type": "css", "purpose": "main styles"}
    ],
    "tasks": ["task1", "task2"]
}""",

    "html": """You are an HTML Agent. Your role is to generate HTML code for web pages.

Create semantic, accessible HTML5 code with:
1. Proper document structure
2. Semantic elements (header, nav, main, footer)
3. Accessibility attributes (aria labels, alt text placeholders)
4. Links to CSS and JS files
5. Responsive viewport meta tag

Return ONLY the complete HTML code, no explanations. Do not use markdown code blocks.""",

    "css": """You are a CSS Agent. Your role is to generate CSS styles for web pages.

Create modern, responsive CSS with:
1. CSS custom properties (variables) for colors and spacing
2. Mobile-first responsive design
3. Flexbox/Grid layouts
4. Smooth transitions and hover effects
5. Clean, well-organized code with comments

Return ONLY the complete CSS code, no explanations. Do not use markdown code blocks.""",

    "js": """You are a JavaScript Agent. Your role is to generate JavaScript code for web interactivity.

Create clean, modern JavaScript with:
1. DOM manipulation for interactive elements
2. Event listeners for buttons and forms
3. Form validation if needed
4. Smooth animations and transitions
5. Well-commented, readable code

Return ONLY the complete JavaScript code, no explanations. Do not use markdown code blocks.""",

    "readme": """You are a README Agent. Your role is to create project documentation.

Create a comprehensive README.md with:
1. Project title and description
2. Features list
3. Setup/installation instructions
4. Usage guide
5. File structure overview
6. Technologies used

Return ONLY the complete markdown content, no extra explanations."""
}
