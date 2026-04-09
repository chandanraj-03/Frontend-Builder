import os
import sys

# Ensure the root of the project is in the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.database.connection import ping_database, close_connection
from backend.database.repositories.template_repo import TemplateRepository
from transformer_core.templates import TemplateSystem
from colorama import Fore, Style, init

init(autoreset=True)

def migrate_templates():
    print(f"{Fore.CYAN}Starting template migration to MongoDB...{Style.RESET_ALL}")
    
    if not ping_database():
        print(f"{Fore.RED}Failed to connect to the database. Migration aborted.{Style.RESET_ALL}")
        return

    ts = TemplateSystem()
    repo = TemplateRepository()

    success_count = 0
    error_count = 0

    for key, template_data in ts.templates.items():
        try:
            print(f"Migrating template '{key}'...")
            
            # Prepare data to match PyDantic schema (e.g., adding gradient if missing)
            repo.upsert(key, {
                "name": template_data.get("name", key),
                "description": template_data.get("description", ""),
                "category": template_data.get("category", "Uncategorized"),
                "complexity": template_data.get("complexity", "Medium"),
                "estimated_time": template_data.get("estimated_time", ""),
                "tags": template_data.get("tags", []),
                "tech_stack": template_data.get("tech_stack", []),
                "features": template_data.get("features", 0),
                "prompt": template_data.get("prompt", ""),
                "gradient": template_data.get("gradient", "linear-gradient(135deg,#4E65FF,#92EFFD)")
            })
            success_count += 1
            print(f"{Fore.GREEN}✓ Successfully migrated '{key}'{Style.RESET_ALL}")
        except Exception as e:
            error_count += 1
            print(f"{Fore.RED}✗ Failed to migrate '{key}': {e}{Style.RESET_ALL}")

    print(f"\n{Fore.CYAN}Migration Complete!{Style.RESET_ALL}")
    print(f"Successfully migrated: {Fore.GREEN}{success_count}{Style.RESET_ALL}")
    if error_count > 0:
        print(f"Failed to migrate:     {Fore.RED}{error_count}{Style.RESET_ALL}")

    close_connection()

if __name__ == "__main__":
    migrate_templates()
