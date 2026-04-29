import argparse
import os
import sys
import time
import webbrowser
import zipfile
import json
from datetime import datetime
from colorama import init, Fore, Style

# Initialize colorama for Windows
init()

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from config import OUTPUT_DIR, OLLAMA_MODEL, AVAILABLE_MODELS, COLOR_THEMES
from state_manager import save_state, load_state, get_stage_data, get_resume_info
from templates import show_template_menu, get_template_prompt, list_templates
from agents import (
    ConversationAgent,
    RequirementAgent,
    PageDiscoveryAgent,
    PlanAgent,
    CodeAgent,
    ReadmeAgent
)


# ─── Helpers ──────────────────────────────────────────────────────────

def print_banner():
    """Print the application banner."""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║           Multi-Agent Web Application Builder                ║
║                  Powered by Ollama                           ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(f"{Fore.CYAN}{banner}{Style.RESET_ALL}")


def print_stage(stage_num: int, stage_name: str, total_stages: int = 6):
    """Print a stage header with progress bar."""
    # Progress bar
    filled = int((stage_num / total_stages) * 20)
    bar = f"{'█' * filled}{'░' * (20 - filled)}"
    percent = int((stage_num / total_stages) * 100)
    
    print(f"\n{Fore.YELLOW}{'='*60}{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}[{bar}] {percent}% — Stage {stage_num}/{total_stages}: {stage_name}{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}{'='*60}{Style.RESET_ALL}\n")


def format_duration(seconds: float) -> str:
    """Format seconds into human-readable duration."""
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = int(seconds // 60)
    secs = seconds % 60
    return f"{minutes}m {secs:.1f}s"


def list_past_projects():
    """Scan output directory for past projects and display them."""
    if not os.path.exists(OUTPUT_DIR):
        print(f"{Fore.YELLOW}No output directory found.{Style.RESET_ALL}")
        return
    
    projects = []
    for entry in sorted(os.listdir(OUTPUT_DIR), reverse=True):
        project_path = os.path.join(OUTPUT_DIR, entry)
        state_file = os.path.join(project_path, "state.json")
        if os.path.isdir(project_path) and os.path.exists(state_file):
            try:
                with open(state_file, 'r', encoding='utf-8') as f:
                    state = json.load(f)
                projects.append({
                    "dir": entry,
                    "path": project_path,
                    "prompt": state.get("user_prompt", "N/A")[:60],
                    "stage": state.get("current_stage", 0),
                    "created": state.get("created_at", "Unknown")[:19],
                    "updated": state.get("updated_at", state.get("created_at", "Unknown"))[:19],
                })
            except (json.JSONDecodeError, IOError):
                projects.append({
                    "dir": entry,
                    "path": project_path,
                    "prompt": "(corrupted state)",
                    "stage": "?",
                    "created": "Unknown",
                    "updated": "Unknown",
                })
    
    if not projects:
        print(f"{Fore.YELLOW}No past projects found in {OUTPUT_DIR}{Style.RESET_ALL}")
        return
    
    print(f"\n{Fore.CYAN}{'='*80}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}  Past Projects ({len(projects)} found){Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*80}{Style.RESET_ALL}\n")
    
    for i, p in enumerate(projects, 1):
        status_color = Fore.GREEN if p["stage"] == 6 else Fore.YELLOW
        status_text = "✅ Complete" if p["stage"] == 6 else f"⏸ Stage {p['stage']}/6"
        print(f"  {Fore.WHITE}{i}. {p['dir']}{Style.RESET_ALL}")
        print(f"     Prompt:  {p['prompt']}{'...' if len(p['prompt']) >= 60 else ''}")
        print(f"     Status:  {status_color}{status_text}{Style.RESET_ALL}")
        print(f"     Created: {p['created']}")
        print(f"     Resume:  {Fore.CYAN}python main.py --resume \"{p['path']}\"{Style.RESET_ALL}")
        print()


def list_available_models():
    """Display available models."""
    print(f"\n{Fore.CYAN}Available Models:{Style.RESET_ALL}\n")
    print(f"  {Fore.WHITE}{'Key':<25} {'Description'}{Style.RESET_ALL}")
    print(f"  {'─'*25} {'─'*40}")
    for key, desc in AVAILABLE_MODELS.items():
        marker = f" {Fore.GREEN}← current{Style.RESET_ALL}" if key == OLLAMA_MODEL else ""
        print(f"  {Fore.YELLOW}{key:<25}{Style.RESET_ALL} {desc}{marker}")
    print(f"\n  {Fore.WHITE}Usage: python main.py --model <key>{Style.RESET_ALL}")
    print(f"  {Fore.WHITE}Developers: Add models in config.py → AVAILABLE_MODELS{Style.RESET_ALL}\n")


def choose_model_interactive() -> str:
    """Show an interactive menu for the user to pick a model."""
    models = list(AVAILABLE_MODELS.items())
    
    print(f"\n{Fore.CYAN}┌─────────────────────────────────────────────────┐{Style.RESET_ALL}")
    print(f"{Fore.CYAN}│           Choose a Model to Generate Code        │{Style.RESET_ALL}")
    print(f"{Fore.CYAN}└─────────────────────────────────────────────────┘{Style.RESET_ALL}\n")
    
    default_idx = None
    for i, (key, desc) in enumerate(models, 1):
        if key == OLLAMA_MODEL:
            default_idx = i
            print(f"  {Fore.GREEN}{i}. {key:<25} {desc} ← default{Style.RESET_ALL}")
        else:
            print(f"  {Fore.WHITE}{i}. {Fore.YELLOW}{key:<25}{Style.RESET_ALL} {desc}")
    
    print(f"\n  {Fore.WHITE}Enter a number (1-{len(models)}) or press Enter for default:{Style.RESET_ALL}")
    choice = input(f"  {Fore.GREEN}▶ {Style.RESET_ALL}").strip()
    
    if not choice:
        print(f"  {Fore.CYAN}Using default: {OLLAMA_MODEL}{Style.RESET_ALL}")
        return OLLAMA_MODEL
    
    try:
        idx = int(choice)
        if 1 <= idx <= len(models):
            selected = models[idx - 1][0]
            print(f"  {Fore.GREEN}Selected: {selected}{Style.RESET_ALL}")
            return selected
    except ValueError:
        # Maybe they typed the model name directly
        if choice in AVAILABLE_MODELS:
            print(f"  {Fore.GREEN}Selected: {choice}{Style.RESET_ALL}")
            return choice
    
    print(f"  {Fore.YELLOW}Invalid choice, using default: {OLLAMA_MODEL}{Style.RESET_ALL}")
    return OLLAMA_MODEL


def list_available_themes():
    """Display available color themes."""
    print(f"\n{Fore.CYAN}Available Color Themes:{Style.RESET_ALL}\n")
    for key, theme in COLOR_THEMES.items():
        colors = f"{theme['primary']} | {theme['secondary']} | {theme['accent']}"
        print(f"  {Fore.YELLOW}{key:<12}{Style.RESET_ALL} {theme['name']:<20} [{colors}]")
    print(f"\n  {Fore.WHITE}Usage: python main.py --theme <key>{Style.RESET_ALL}\n")


def export_as_zip(project_dir: str) -> str:
    """Package the project directory into a ZIP file."""
    zip_path = project_dir.rstrip(os.sep) + ".zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(project_dir):
            # Skip __pycache__ and .venv
            dirs[:] = [d for d in dirs if d not in ('__pycache__', '.venv', 'node_modules')]
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(project_dir))
                zf.write(file_path, arcname)
    return zip_path


def start_preview_server(project_dir: str, port: int = 8000):
    """Start a local HTTP server for previewing the generated site."""
    import http.server
    import socketserver
    
    os.chdir(project_dir)
    handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            url = f"http://localhost:{port}"
            print(f"\n{Fore.GREEN}🌐 Preview server running at: {url}{Style.RESET_ALL}")
            print(f"{Fore.WHITE}   Press Ctrl+C to stop the server{Style.RESET_ALL}\n")
            webbrowser.open(url)
            httpd.serve_forever()
    except OSError:
        # Port in use, try next port
        print(f"{Fore.YELLOW}Port {port} in use, trying {port + 1}...{Style.RESET_ALL}")
        start_preview_server(project_dir, port + 1)
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Preview server stopped.{Style.RESET_ALL}")


# ─── CLI ──────────────────────────────────────────────────────────────

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Multi-Agent Web Application Builder",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Examples:
  python main.py                                  Interactive mode
  python main.py -t portfolio --theme ocean        Portfolio with ocean theme
  python main.py --model mistral:7b -t landing     Use Mistral model
  python main.py --list-projects                   Show past projects
  python main.py --resume output/my_project        Resume a build
  python main.py -t blog --zip --no-open           Blog, export ZIP, no browser
  python main.py --preview output/my_project       Preview a built project
        """
    )
    parser.add_argument(
        "--template", "-t",
        choices=[
            # Personal & Portfolio
            "portfolio", "blog", "minimal-portfolio",
            # Business & E-commerce
            "ecommerce", "saas", "landing", "realestate", "dashboard", "jobboard",
            # Creative & Media
            "photography", "music", "agency",
            # Education & Learning
            "education", "documentation",
            # Community & Social
            "forum", "charity", "crowdfunding",
            # Specialized
            "restaurant", "fitness", "travel", "event", "crypto", "recipe",
            "wedding", "healthcare", "weather", "fashion"
        ],
        help="Use a preset template instead of custom prompt (use --list-templates to see all)"
    )
    parser.add_argument(
        "--resume", "-r",
        metavar="PROJECT_DIR",
        help="Resume a previous project from saved state"
    )
    parser.add_argument(
        "--list-templates", "-l",
        action="store_true",
        help="List available templates and exit"
    )
    
    # ── New flags ──
    parser.add_argument(
        "--model", "-m",
        metavar="MODEL_KEY",
        help="Ollama model to use (see --list-models for options)"
    )
    parser.add_argument(
        "--list-models",
        action="store_true",
        help="List available models and exit"
    )
    parser.add_argument(
        "--theme",
        choices=list(COLOR_THEMES.keys()),
        default=None,
        help="Color theme for CSS generation (see --list-themes)"
    )
    parser.add_argument(
        "--list-themes",
        action="store_true",
        help="List available color themes and exit"
    )
    parser.add_argument(
        "--list-projects",
        action="store_true",
        help="List past generated projects and exit"
    )
    parser.add_argument(
        "--zip",
        action="store_true",
        help="Export the generated project as a ZIP file"
    )
    parser.add_argument(
        "--no-open",
        action="store_true",
        help="Don't open the browser after build completes"
    )
    parser.add_argument(
        "--preview",
        metavar="PROJECT_DIR",
        nargs="?",
        const="__auto__",
        help="Start a local HTTP server to preview the project (optionally pass project dir)"
    )
    parser.add_argument(
        "--no-confirm",
        action="store_true",
        help="Skip the interactive prompt refinement confirmation step"
    )
    
    return parser.parse_args()


# ─── Main ─────────────────────────────────────────────────────────────

def main():
    """Main orchestrator function."""
    args = parse_args()
    
    # ── Handle listing commands ──
    if args.list_templates:
        print(f"\n{Fore.CYAN}Available Templates:{Style.RESET_ALL}\n")
        for t in list_templates():
            print(f"  {Fore.YELLOW}{t['key']}{Style.RESET_ALL}: {t['description']}")
        return
    
    if args.list_models:
        list_available_models()
        return
    
    if args.list_themes:
        list_available_themes()
        return
    
    if args.list_projects:
        list_past_projects()
        return
    
    # ── Handle standalone preview ──
    if args.preview and args.preview != "__auto__":
        if os.path.isdir(args.preview):
            start_preview_server(args.preview)
        else:
            print(f"{Fore.RED}Error: Directory not found: {args.preview}{Style.RESET_ALL}")
        return
    
    print_banner()
    
    # ── Resolve model ──
    if args.model:
        model = args.model
        if args.model not in AVAILABLE_MODELS:
            print(f"{Fore.YELLOW}Warning: '{args.model}' is not in the registered models list.{Style.RESET_ALL}")
            print(f"{Fore.YELLOW}Proceeding anyway — make sure this model is installed in Ollama.{Style.RESET_ALL}\n")
    else:
        model = choose_model_interactive()
    
    # ── Resolve color theme ──
    color_theme = COLOR_THEMES.get(args.theme) if args.theme else None
    
    print(f"{Fore.GREEN}Model: {model}{Style.RESET_ALL}")
    if color_theme:
        print(f"{Fore.GREEN}Theme: {color_theme['name']}{Style.RESET_ALL}")
    print(f"{Fore.GREEN}Output Directory: {OUTPUT_DIR}{Style.RESET_ALL}\n")
    
    # ── Handle resume ──
    if args.resume:
        project_dir = args.resume
        state = load_state(project_dir)
        if not state:
            print(f"{Fore.RED}Error: No saved state found in {project_dir}{Style.RESET_ALL}")
            return
        resume_stage, user_prompt, stage_name = get_resume_info(state)
        print(f"{Fore.CYAN}Resuming from stage {resume_stage} ({stage_name})...{Style.RESET_ALL}\n")
    else:
        state = None
        resume_stage = 0
        
        # Handle --template flag or get user input
        if args.template:
            user_prompt = get_template_prompt(args.template)
            print(f"{Fore.CYAN}Using template: {args.template}{Style.RESET_ALL}\n")
        else:
            print(f"{Fore.CYAN}Describe the web application you want to build:{Style.RESET_ALL}")
            print(f"{Fore.WHITE}(Press Enter without typing to see templates){Style.RESET_ALL}\n")
            
            user_prompt = input(f"{Fore.GREEN}Your prompt: {Style.RESET_ALL}").strip()
            
            # Show template menu if no prompt entered
            if not user_prompt:
                user_prompt = show_template_menu()
                if not user_prompt:
                    user_prompt = input(f"{Fore.GREEN}Your prompt: {Style.RESET_ALL}").strip()
            
            if not user_prompt:
                print(f"{Fore.RED}Error: Please provide a description.{Style.RESET_ALL}")
                return
        
        # Create unique output directory for this project
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_name = "_".join(user_prompt.split()[:3]).lower()
        project_name = "".join(c for c in project_name if c.isalnum() or c == '_')
        project_dir = os.path.join(OUTPUT_DIR, f"{project_name}_{timestamp}")
    
    print(f"\n{Fore.GREEN}Project directory: {project_dir}{Style.RESET_ALL}\n")
    
    # ── Initialize agents with selected model ──
    conversation_agent = ConversationAgent(model)
    requirement_agent = RequirementAgent(model)
    page_discovery_agent = PageDiscoveryAgent(model)
    plan_agent = PlanAgent(model)
    code_agent = CodeAgent(model)
    readme_agent = ReadmeAgent(model)
    
    # ── Build timer ──
    stage_times = {}
    total_start = time.time()
    
    try:
        # ── Stage 1: Conversation Analysis ──
        if resume_stage < 1:
            stage_start = time.time()
            print_stage(1, "Conversation Analysis")
            conversation_data = conversation_agent.run(user_prompt)
            stage_times["1. Conversation Analysis"] = time.time() - stage_start
            
            print(f"\n{Fore.WHITE}App Type: {conversation_data.get('app_type', 'Unknown')}{Style.RESET_ALL}")
            print(f"{Fore.WHITE}Features: {len(conversation_data.get('features', []))} identified{Style.RESET_ALL}")
            print(f"{Fore.WHITE}Complexity: {conversation_data.get('complexity', 'medium')}{Style.RESET_ALL}")
            print(f"{Fore.WHITE}Must-Have Features: {len(conversation_data.get('must_have_features', []))}{Style.RESET_ALL}")
            if conversation_data.get('tech_preferences'):
                print(f"{Fore.WHITE}Tech Preferences: {', '.join(conversation_data.get('tech_preferences', []))}{Style.RESET_ALL}")
            
            # ── Interactive Prompt Refinement ──
            if not args.no_confirm:
                print(f"\n{Fore.CYAN}{'─'*50}{Style.RESET_ALL}")
                print(f"{Fore.CYAN}Extracted Features:{Style.RESET_ALL}")
                for i, feat in enumerate(conversation_data.get('features', [])[:10], 1):
                    print(f"  {Fore.WHITE}{i}. {feat}{Style.RESET_ALL}")
                if len(conversation_data.get('features', [])) > 10:
                    print(f"  {Fore.WHITE}... and {len(conversation_data['features']) - 10} more{Style.RESET_ALL}")
                print(f"{Fore.CYAN}{'─'*50}{Style.RESET_ALL}")
                
                confirm = input(f"\n{Fore.GREEN}Does this look right? (y/n, default=y): {Style.RESET_ALL}").strip().lower()
                if confirm == 'n':
                    extra = input(f"{Fore.GREEN}What would you like to add or change? {Style.RESET_ALL}").strip()
                    if extra:
                        user_prompt = f"{user_prompt}\n\nAdditional requirements: {extra}"
                        print(f"\n{Fore.CYAN}Re-analyzing with your updates...{Style.RESET_ALL}")
                        stage_start = time.time()
                        conversation_agent.clear_history()
                        conversation_data = conversation_agent.run(user_prompt)
                        stage_times["1. Conversation Analysis"] += time.time() - stage_start
            
            save_state(project_dir, 1, conversation_data, user_prompt)
        else:
            conversation_data = get_stage_data(state, 1)
            print(f"{Fore.CYAN}[Skipped] Stage 1 - Using saved data{Style.RESET_ALL}")
        
        # ── Stage 2: Requirement Extraction ──
        if resume_stage < 2:
            stage_start = time.time()
            print_stage(2, "Requirement Extraction")
            requirements = requirement_agent.run(conversation_data)
            stage_times["2. Requirement Extraction"] = time.time() - stage_start
            
            print(f"\n{Fore.WHITE}Functional Requirements: {len(requirements.get('functional_requirements', []))}{Style.RESET_ALL}")
            save_state(project_dir, 2, requirements)
        else:
            requirements = get_stage_data(state, 2)
            print(f"{Fore.CYAN}[Skipped] Stage 2 - Using saved data{Style.RESET_ALL}")
        
        # ── Stage 3: Page Discovery ──
        if resume_stage < 3:
            stage_start = time.time()
            print_stage(3, "Page Discovery")
            pages = page_discovery_agent.run(requirements, conversation_data)
            stage_times["3. Page Discovery"] = time.time() - stage_start
            
            print(f"\n{Fore.WHITE}Pages to create: {[p.get('name') for p in pages.get('pages', [])]}{Style.RESET_ALL}")
            save_state(project_dir, 3, pages)
        else:
            pages = get_stage_data(state, 3)
            print(f"{Fore.CYAN}[Skipped] Stage 3 - Using saved data{Style.RESET_ALL}")
        
        # ── Stage 4: Planning & Architecture ──
        if resume_stage < 4:
            stage_start = time.time()
            print_stage(4, "Planning & Architecture")
            plan = plan_agent.run(pages, requirements)
            stage_times["4. Planning & Architecture"] = time.time() - stage_start
            
            print(f"\n{Fore.WHITE}Files planned: {len(plan.get('files_to_create', []))}{Style.RESET_ALL}")
            save_state(project_dir, 4, plan)
        else:
            plan = get_stage_data(state, 4)
            print(f"{Fore.CYAN}[Skipped] Stage 4 - Using saved data{Style.RESET_ALL}")
        
        # ── Stage 5: Code Generation ──
        if resume_stage < 5:
            stage_start = time.time()
            print_stage(5, "Code Generation")
            generated_files = code_agent.run(pages, requirements, plan, project_dir, color_theme=color_theme)
            stage_times["5. Code Generation"] = time.time() - stage_start
            
            save_state(project_dir, 5, {"files": list(generated_files.keys())})
        else:
            print(f"{Fore.CYAN}[Skipped] Stage 5 - Using saved files{Style.RESET_ALL}")
            # Load generated files from disk
            generated_files = {}
            for filename in get_stage_data(state, 5).get("files", []):
                file_path = os.path.join(project_dir, filename)
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        generated_files[filename] = f.read()
        
        # ── Stage 6: Documentation ──
        stage_start = time.time()
        print_stage(6, "Documentation")
        readme_agent.run(conversation_data, requirements, pages, generated_files, project_dir)
        stage_times["6. Documentation"] = time.time() - stage_start
        
        save_state(project_dir, 6, {"status": "complete"})
        
        total_time = time.time() - total_start
        
        # ── Final Summary ──
        print(f"\n{Fore.GREEN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.GREEN}✅ Project Generated Successfully!{Style.RESET_ALL}")
        print(f"{Fore.GREEN}{'='*60}{Style.RESET_ALL}")
        print(f"\n{Fore.WHITE}📁 Project Location: {project_dir}{Style.RESET_ALL}")
        
        # ── Build time summary ──
        print(f"\n{Fore.CYAN}⏱️  Build Time Summary:{Style.RESET_ALL}")
        for stage_name, duration in stage_times.items():
            print(f"   {Fore.WHITE}{stage_name:<30} {format_duration(duration)}{Style.RESET_ALL}")
        print(f"   {'─'*42}")
        print(f"   {Fore.GREEN}{'Total':<30} {format_duration(total_time)}{Style.RESET_ALL}")
        
        # ── Export ZIP ──
        if args.zip:
            zip_path = export_as_zip(project_dir)
            print(f"\n{Fore.GREEN}📦 ZIP exported: {zip_path}{Style.RESET_ALL}")
        
        # ── Auto-open browser ──
        if not args.no_open:
            index_path = os.path.join(project_dir, "index.html")
            if os.path.exists(index_path):
                print(f"\n{Fore.CYAN}🌐 Opening in browser...{Style.RESET_ALL}")
                webbrowser.open(f"file:///{os.path.abspath(index_path)}")
        
        # ── Preview mode ──
        if args.preview == "__auto__":
            start_preview_server(project_dir)
        else:
            print(f"\n{Fore.WHITE}📄 Open index.html in your browser to view the application.{Style.RESET_ALL}")
            print(f"{Fore.WHITE}🌐 Or run: python main.py --preview \"{project_dir}\"{Style.RESET_ALL}\n")
    
    except KeyboardInterrupt:
        total_time = time.time() - total_start
        print(f"\n\n{Fore.YELLOW}Build cancelled by user after {format_duration(total_time)}.{Style.RESET_ALL}")
    except Exception as e:
        print(f"\n{Fore.RED}Error: {str(e)}{Style.RESET_ALL}")
        raise


if __name__ == "__main__":
    main()
