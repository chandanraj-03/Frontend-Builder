"""Code Agent - Orchestrates HTML, CSS, and JS agents."""

import os
from colorama import Fore
from .base_agent import BaseAgent
from .html_agent import HTMLAgent
from .css_agent import CSSAgent
from .js_agent import JSAgent


class CodeAgent(BaseAgent):
    """Agent that orchestrates HTML, CSS, and JS agents."""
    
    def __init__(self, model: str = "qwen3:8b"):
        super().__init__(
            name="Code Agent",
            system_prompt="You orchestrate code generation.",
            model=model
        )
        self.html_agent = HTMLAgent(model)
        self.css_agent = CSSAgent(model)
        self.js_agent = JSAgent(model)
    
    def run(self, pages: dict, requirements: dict, plan: dict, output_dir: str, color_theme: dict = None) -> dict:
        """Orchestrate code generation for all files.
        
        Args:
            pages: Output from PageDiscoveryAgent
            requirements: Output from RequirementAgent
            plan: Output from PlanAgent
            output_dir: Directory to save generated files
            color_theme: Optional color theme dict for CSS generation
            
        Returns:
            Dictionary with generated file paths and contents
        """
        self.log(f"Starting code generation...", Fore.GREEN)
        
        # Handle case where upstream agents returned lists instead of dicts
        if isinstance(pages, list):
            pages = {'pages': pages}
        elif not isinstance(pages, dict):
            pages = {}
        if isinstance(plan, list):
            plan = {'files_to_create': plan}
        elif not isinstance(plan, dict):
            plan = {}
        
        page_list = pages.get('pages', [])
        generated_files = {}
        
        # === USE PLAN'S FILE LIST ===
        # Get planned files from the plan agent
        # Support both 'files' and 'files_to_create' keys for compatibility
        raw_planned_files = plan.get('files', []) or plan.get('files_to_create', [])
        
        # Normalize planned_files: convert dicts to strings if needed
        planned_files = []
        for f in raw_planned_files:
            if isinstance(f, dict):
                # Extract filename from dict - try common keys
                filename = f.get('filename') or f.get('name') or f.get('file') or f.get('path', '')
                if filename:
                    planned_files.append(filename)
            elif isinstance(f, str):
                planned_files.append(f)
        
        # Categorize files by type
        planned_html_files = [f for f in planned_files if f.endswith('.html')]
        
        # Merge planned HTML files with discovered pages to ensure all discovered pages are generated
        page_htmls = [p.get('filename', '') for p in page_list]
        page_htmls = [f if f.endswith('.html') else f + '.html' for f in page_htmls if f]
        for pf in page_htmls:
            if pf not in planned_html_files:
                planned_html_files.append(pf)
                
        planned_js_files = [f for f in planned_files if f.endswith('.js')]
        planned_css_files = [f for f in planned_files if f.endswith('.css')]
        
        # Ensure JS files have correct path prefix
        planned_js_files = [f if f.startswith('js/') else f'js/{f}' for f in planned_js_files]
        planned_css_files = [f if f.startswith('css/') else f'css/{f}' for f in planned_css_files]
        
        self.log(f"Plan specifies: {len(planned_html_files)} HTML, {len(planned_js_files)} JS, {len(planned_css_files)} CSS files", Fore.GREEN)
        
        # Fallback if plan has no files
        if not planned_html_files:
            planned_html_files = [p.get('filename', 'index.html') for p in page_list] or ['index.html']
        if not planned_js_files:
            planned_js_files = ['js/script.js']
        if not planned_css_files:
            planned_css_files = ['css/style.css']
        
        # Create output directories
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(os.path.join(output_dir, "css"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "js"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "assets"), exist_ok=True)
        
        self.log(f"Created directory structure in {output_dir}", Fore.GREEN)
        
        # Ensure we have at least one page (index.html)
        if not page_list:
            self.log("No pages found, creating default index.html", Fore.YELLOW)
            page_list = [{
                "name": "Home",
                "filename": "index.html",
                "purpose": "Main page of the application",
                "components": ["header", "main content", "footer"]
            }]
        
        # GENERATE CSS FIRST - so we can pass classes to HTML
        self.log("Generating CSS first for context...", Fore.GREEN)
        css_content = self.css_agent.run(page_list, requirements, color_theme=color_theme)
        
        # Validate CSS
        if not css_content or len(css_content) < 20 or '{' not in css_content:
            self.log("Warning: Invalid CSS generated, creating basic styles", Fore.YELLOW)
            css_content = self._create_basic_css()
        
        # Extract CSS class names to pass to HTML agent
        css_classes = self._extract_css_classes(css_content)
        self.log(f"Extracted {len(css_classes)} CSS classes for HTML generation", Fore.GREEN)
        
        css_path = os.path.join(output_dir, "css", "style.css")
        os.makedirs(os.path.dirname(css_path), exist_ok=True)
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(css_content)
        generated_files["css/style.css"] = css_content
        self.log(f"Saved: css/style.css", Fore.GREEN)
        
        # === GENERATE HTML FOR ALL PLANNED HTML FILES ===
        html_files_created = []
        for html_file in planned_html_files:
            # Find matching page info or create basic one
            page = self._find_page_for_file(html_file, page_list)
            
            # Get filename
            filename = html_file if html_file.endswith('.html') else html_file + '.html'
            
            self.log(f"Generating HTML: {filename}", Fore.GREEN)
            # Determine which JS files this page should link to
            page_js_files = self._get_js_files_for_page(filename, planned_js_files)
            
            # Pass CSS classes and JS files to HTML agent for better styling
            html_content = self.html_agent.run(page, page_list, css_classes=css_classes, js_files=page_js_files)
            
            # Validate HTML content more thoroughly
            is_valid_html = (
                html_content and 
                len(html_content) > 100 and 
                '<html' in html_content.lower() and 
                '</html>' in html_content.lower() and
                '<body' in html_content.lower() and
                html_content.count('<') > 5  # Has actual structure, not just minimal tags
            )
            
            if not is_valid_html:
                self.log(f"Warning: Invalid HTML for {filename} (len={len(html_content) if html_content else 0}), creating rich fallback template", Fore.YELLOW)
                html_content = self._create_rich_fallback_html(page, page_list, page_js_files)
            
            filepath = os.path.join(output_dir, filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            generated_files[filename] = html_content
            html_files_created.append(filename)
            self.log(f"Saved: {filename}", Fore.GREEN)
        
        # Ensure index.html exists
        if 'index.html' not in html_files_created:
            self.log("Creating index.html as main entry point", Fore.YELLOW)
            if html_files_created:
                # Create a simple redirect or link to the first page
                first_page = html_files_created[0]
                index_content = self._create_index_redirect(first_page, page_list)
            else:
                index_content = self._create_basic_html({"name": "Home", "purpose": "Main page"}, [], planned_js_files)
            
            filepath = os.path.join(output_dir, "index.html")
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(index_content)
            generated_files["index.html"] = index_content
            self.log(f"Saved: index.html", Fore.GREEN)
        
        # === GENERATE ALL PLANNED JS FILES ===
        self.log(f"Generating {len(planned_js_files)} JavaScript files...", Fore.GREEN)
        for js_file in planned_js_files:
            self.log(f"Generating JS: {js_file}", Fore.GREEN)
            js_content = self.js_agent.run_for_file(js_file, page_list, requirements)
            
            # Validate JS (less strict since empty JS is valid)
            if not js_content:
                js_content = f"// {js_file} - Application JavaScript\n\ndocument.addEventListener('DOMContentLoaded', function() {{\n    console.log('{js_file} loaded');\n}});\n"
            
            js_path = os.path.join(output_dir, js_file)
            os.makedirs(os.path.dirname(js_path), exist_ok=True)
            with open(js_path, 'w', encoding='utf-8') as f:
                f.write(js_content)
            generated_files[js_file] = js_content
            self.log(f"Saved: {js_file}", Fore.GREEN)
        
        self.log(f"Code generation complete! {len(generated_files)} files created.", Fore.GREEN)
        
        return generated_files
    
    def _find_page_for_file(self, html_file: str, page_list: list) -> dict:
        """Find page info for an HTML file, or create basic info."""
        filename = os.path.basename(html_file)
        for page in page_list:
            page_filename = page.get('filename', '')
            if not page_filename:
                page_filename = page.get('name', 'page').lower().replace(' ', '_') + '.html'
            if not page_filename.endswith('.html'):
                page_filename += '.html'
            if page_filename == filename or page_filename == html_file:
                return page
        
        # Create basic page info from filename
        name = filename.replace('.html', '').replace('_', ' ').replace('-', ' ').title()
        return {
            "name": name,
            "filename": filename,
            "purpose": f"{name} page",
            "components": []
        }
    
    def _get_js_files_for_page(self, html_file: str, planned_js_files: list) -> list:
        """Determine which JS files a page should include."""
        js_files = []
        page_name = html_file.replace('.html', '').lower()
        
        # Always include main.js if it exists
        if 'js/main.js' in planned_js_files:
            js_files.append('js/main.js')
        
        # Include page-specific JS if it exists (e.g., cart.html -> cart.js)
        page_specific_js = f'js/{page_name}.js'
        if page_specific_js in planned_js_files:
            js_files.append(page_specific_js)
        
        # For index.html, also include catalog.js if it exists
        if page_name == 'index' and 'js/catalog.js' in planned_js_files:
            js_files.append('js/catalog.js')
        
        # Fallback: if no specific JS found, use script.js or first available
        if not js_files:
            if 'js/script.js' in planned_js_files:
                js_files.append('js/script.js')
            elif planned_js_files:
                js_files.append(planned_js_files[0])
        
        return js_files
    
    def _extract_css_classes(self, css_content: str) -> list:
        """Extract CSS class names from CSS content for HTML agent context."""
        import re
        # Find all class selectors (e.g., .class-name, .another_class)
        class_pattern = r'\.([a-zA-Z_-][a-zA-Z0-9_-]*)'
        matches = re.findall(class_pattern, css_content)
        # Remove duplicates and common pseudo-class artifacts
        unique_classes = list(set(matches))
        # Filter out pseudo-class related false positives
        filtered = [c for c in unique_classes if not c.startswith(('hover', 'active', 'focus', 'before', 'after', 'first', 'last', 'nth'))]
        return sorted(filtered)[:50]  # Limit to 50 most relevant classes
    
    def _create_basic_html(self, page: dict, all_pages: list, js_files: list = None) -> str:
        """Create a basic HTML template as fallback."""
        if js_files is None:
            js_files = ["js/script.js"]
        
        page_name = page.get('name', 'Page')
        purpose = page.get('purpose', '')
        components = page.get('components', [])
        
        nav_links = ""
        for p in all_pages:
            pname = p.get('name', 'Page')
            pfile = p.get('filename', 'index.html')
            if not pfile.endswith('.html'):
                pfile = pfile + '.html'
            nav_links += f'            <li><a href="{pfile}">{pname}</a></li>\n'
        
        # Generate script tags for all JS files
        script_tags = "\n    ".join([f'<script src="{js}"></script>' for js in js_files])
        
        return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_name}</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <nav>
            <ul>
{nav_links}            </ul>
        </nav>
    </header>
    
    <main>
        <h1>{page_name}</h1>
        <p>{purpose}</p>
        
        <div class="content">
            <!-- Main content goes here -->
        </div>
    </main>
    
    <footer>
        <p>&copy; 2024 {page_name}. All rights reserved.</p>
    </footer>
    
    {script_tags}
</body>
</html>
'''
    
    def _create_rich_fallback_html(self, page: dict, all_pages: list, js_files: list = None) -> str:
        """Create a rich HTML template with actual content as fallback."""
        if js_files is None:
            js_files = ["js/script.js"]
        
        page_name = page.get('name', 'Page')
        purpose = page.get('purpose', '')
        components = page.get('components', [])
        
        nav_links = ""
        for p in all_pages:
            pname = p.get('name', 'Page')
            pfile = p.get('filename', 'index.html')
            if not pfile.endswith('.html'):
                pfile = pfile + '.html'
            nav_links += f'        <li><a href="{pfile}">{pname}</a></li>\n'
        
        # Generate script tags for all JS files
        script_tags = "\n    ".join([f'<script src="{js}"></script>' for js in js_files])
        
        # Generate realistic content based on page name and components
        content_html = self._generate_rich_content(page, components)
        
        return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_name}</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="logo">
                <h1>{page_name}</h1>
            </div>
            <ul class="nav-links">
{nav_links}            </ul>
        </nav>
    </header>
    
    <main class="main-content">
        <section class="hero">
            <h1>{page_name}</h1>
            <p>{purpose}</p>
        </section>
        
        {content_html}
        
    </main>
    
    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2024 {page_name}. All rights reserved.</p>
            <p>Contact: info@example.com</p>
        </div>
    </footer>
    
    {script_tags}
</body>
</html>
'''
    
    def _generate_rich_content(self, page: dict, components: list) -> str:
        """Generate realistic content based on page components."""
        content_sections = []
        
        page_name_lower = page.get('name', '').lower()
        
        # Generate based on commonly detected components
        if any(c in str(components).lower() for c in ['product', 'item', 'card']):
            content_sections.append('''<section class="products">
            <h2>Featured Items</h2>
            <div class="product-grid">
                <div class="product-card">
                    <div class="product-image">[Image]</div>
                    <h3>Item 1</h3>
                    <p class="price">$29.99</p>
                    <button class="btn">Learn More</button>
                </div>
                <div class="product-card">
                    <div class="product-image">[Image]</div>
                    <h3>Item 2</h3>
                    <p class="price">$39.99</p>
                    <button class="btn">Learn More</button>
                </div>
                <div class="product-card">
                    <div class="product-image">[Image]</div>
                    <h3>Item 3</h3>
                    <p class="price">$49.99</p>
                    <button class="btn">Learn More</button>
                </div>
            </div>
        </section>''')
        
        if any(c in str(components).lower() for c in ['blog', 'article', 'post']):
            content_sections.append('''<section class="articles">
            <h2>Latest Articles</h2>
            <article class="article-card">
                <h3>Article Title</h3>
                <p class="meta">Published on January 1, 2024</p>
                <p>This is the article summary with relevant information and insights.</p>
                <a href="#" class="read-more">Read More →</a>
            </article>
        </section>''')
        
        if any(c in str(components).lower() for c in ['form', 'contact', 'newsletter']):
            content_sections.append('''<section class="contact-form">
            <h2>Get In Touch</h2>
            <form>
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <button type="submit" class="btn">Submit</button>
            </form>
        </section>''')
        
        if any(c in str(components).lower() for c in ['features', 'services', 'benefits']):
            content_sections.append('''<section class="features">
            <h2>Key Features</h2>
            <div class="feature-grid">
                <div class="feature-item">
                    <h3>Feature 1</h3>
                    <p>Description of feature 1 and its benefits</p>
                </div>
                <div class="feature-item">
                    <h3>Feature 2</h3>
                    <p>Description of feature 2 and its benefits</p>
                </div>
                <div class="feature-item">
                    <h3>Feature 3</h3>
                    <p>Description of feature 3 and its benefits</p>
                </div>
            </div>
        </section>''')
        
        if not content_sections:
            content_sections.append('''<section class="content">
            <h2>Welcome</h2>
            <p>This is the main content area for the page.</p>
            <div class="content-box">
                <h3>Section Title</h3>
                <p>Add your content here with meaningful information.</p>
            </div>
        </section>''')
        
        return '\n        '.join(content_sections)
    
    def _create_index_redirect(self, first_page: str, all_pages: list) -> str:
        """Create index.html that links to the first page."""
        return self._create_basic_html({
            "name": "Home",
            "purpose": f"Welcome! Click navigation to explore.",
            "filename": "index.html"
        }, all_pages)
    
    def _create_basic_css(self) -> str:
        """Create basic CSS styles as fallback."""
        return '''/* Basic Responsive Styles */
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --text-color: #333;
    --bg-color: #f5f5f5;
    --border-color: #ddd;
    --shadow: 0 2px 10px rgba(0,0,0,0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--bg-color);
}

/* Header & Navigation */
header.header {
    background: white;
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.navbar .logo h1 {
    color: var(--primary-color);
    font-size: 1.8rem;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: var(--primary-color);
}

/* Main Content */
main.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section.hero {
    text-align: center;
    padding: 3rem 0;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    border-radius: 8px;
    margin-bottom: 3rem;
}

section.hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

/* Product Grid */
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

.product-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: transform 0.3s;
}

.product-card:hover {
    transform: translateY(-5px);
}

.product-card .product-image {
    width: 100%;
    height: 200px;
    background: var(--bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
}

.product-card h3 {
    padding: 1rem;
    font-size: 1.1rem;
}

.product-card .price {
    padding: 0 1rem;
    color: var(--primary-color);
    font-size: 1.2rem;
    font-weight: bold;
}

/* Feature Grid */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

.feature-item {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: var(--shadow);
}

/* Forms */
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: inherit;
}

/* Buttons */
.btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 1rem;
}

.btn:hover {
    background: var(--secondary-color);
}

/* Footer */
footer.footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 3rem;
}

.footer-content p {
    margin: 0.5rem 0;
}

/* Articles */
.article-card {
    background: white;
    padding: 2rem;
    margin: 2rem 0;
    border-radius: 8px;
    box-shadow: var(--shadow);
    border-left: 4px solid var(--primary-color);
}

.article-card h3 {
    margin-bottom: 0.5rem;
    color: var(--primary-color);
}

.article-card .meta {
    color: #999;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.read-more {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: bold;
}

.read-more:hover {
    text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-links {
        flex-direction: column;
        gap: 1rem;
    }
    
    section.hero h1 {
        font-size: 1.8rem;
    }
    
    main.main-content {
        padding: 1rem;
    }
    
    .product-grid {
        grid-template-columns: 1fr;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .navbar {
        padding: 1rem;
    }
    
    section.hero {
        padding: 2rem 1rem;
    }
}
'''
