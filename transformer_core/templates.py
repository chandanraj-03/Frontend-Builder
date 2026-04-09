"""
Advanced Template Presets System for Web Applications
A comprehensive collection of website templates with detailed specifications
"""

from colorama import Fore, Style, init
from typing import Dict, List, Optional, Tuple, Any
import json
import random
from datetime import datetime
import os

# Initialize colorama for colored terminal output
init(autoreset=True)

class TemplateSystem:
    """Main template system class managing all templates and operations."""
    
    def __init__(self):
        self.templates = self._load_templates()
        self.categories = self._extract_categories()
        self.user_stats = {"selections": 0, "last_selected": None}
    
    def _load_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load all template definitions."""
        return {
            # PERSONAL & PORTFOLIO TEMPLATES
            "portfolio": {
                "name": "Personal Portfolio",
                "description": "A professional portfolio website to showcase your work",
                "category": "Personal",
                "complexity": "Medium",
                "estimated_time": "2-3 hours",
                "tags": ["portfolio", "resume", "projects", "creative"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "GSAP"],
                "features": 12,
                "prompt": """Create a modern personal portfolio website with:
1. A stunning hero section with animated background particles and typed text effect
2. About section with interactive timeline and skill bars with animations
3. Portfolio grid with filterable projects (by category, tech stack)
4. Project modals with detailed descriptions, tech used, and live links
5. Blog section with markdown support and syntax highlighting
6. Contact form with validation and email.js integration
7. Dark/light theme toggle with system preference detection
8. Responsive navigation with hamburger menu and smooth scroll
9. Testimonials carousel with autoplay and manual controls
10. Downloadable resume/CV in PDF format
11. Social media links with hover animations
12. Performance optimized with lazy loading images"""
            },
            
            "blog": {
                "name": "Personal Blog",
                "description": "A clean, modern blog with advanced content features",
                "category": "Content",
                "complexity": "Medium",
                "estimated_time": "2-4 hours",
                "tags": ["blog", "articles", "cms", "writing"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Markdown"],
                "features": 15,
                "prompt": """Create a modern blog website with:
1. Homepage with featured posts grid and hero section
2. Individual post pages with reading time and progress indicator
3. Advanced search with autocomplete and tag filtering
4. Categories and tags system with cloud visualization
5. Newsletter integration with Mailchimp/ConvertKit
6. Author profile pages with social links
7. Related posts recommendation engine
8. Table of contents with smooth scroll highlighting
9. Syntax highlighting for code snippets (Prism.js)
10. Image lightbox gallery for post images
11. Share buttons with dynamic URL and meta tags
12. Comments system with nested replies
13. SEO optimized with JSON-LD structured data
14. Mobile-first responsive design
15. PWA capabilities for offline reading"""
            },
            
            "minimal-portfolio": {
                "name": "Minimal Portfolio",
                "description": "Clean, minimalist portfolio focusing on content",
                "category": "Personal",
                "complexity": "Low",
                "estimated_time": "1-2 hours",
                "tags": ["minimal", "portfolio", "simple", "elegant"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript"],
                "features": 8,
                "prompt": """Create a minimalist portfolio website with:
1. Ultra-clean hero section with name and brief introduction
2. Single column layout with generous whitespace
3. Simple project showcase with hover details
4. About section with concise bio
5. Contact information with click-to-copy functionality
6. Smooth page transitions
7. Mobile-responsive typography scale
8. Reduced motion accessibility option"""
            },
            
            # BUSINESS & E-COMMERCE TEMPLATES
            "ecommerce": {
                "name": "E-commerce Store",
                "description": "Full-featured online store with shopping cart",
                "category": "Business",
                "complexity": "High",
                "estimated_time": "4-6 hours",
                "tags": ["ecommerce", "shop", "products", "cart"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "LocalStorage"],
                "features": 18,
                "prompt": """Create a modern e-commerce website with:
1. Hero section with promotional banner and countdown timer
2. Product grid with filtering by category, price, and rating
3. Product detail pages with image zoom and variant selection
4. Shopping cart with real-time price updates
5. Checkout process with multi-step form wizard
6. User authentication with form validation
7. Wishlist functionality with local storage
8. Product reviews and rating system
9. Inventory management indicators
10. Shipping calculator with live rates
11. Order tracking page
12. Customer account dashboard
13. Newsletter subscription popup
14. Recently viewed products
15. Recommended products based on browsing
16. Quick view modal for products
17. Mobile-optimized shopping experience
18. Payment gateway integration mockup"""
            },
            
            "saas": {
                "name": "SaaS Application",
                "description": "Software-as-a-Service platform with dashboard",
                "category": "Business",
                "complexity": "High",
                "estimated_time": "5-7 hours",
                "tags": ["saas", "dashboard", "software", "analytics"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Chart.js"],
                "features": 20,
                "prompt": """Create a modern SaaS application with:
1. Landing page with hero video and social proof
2. Interactive feature showcase with animations
3. Pricing tables with toggle between monthly/annual
4. User authentication with OAuth options
5. Main dashboard with customizable widgets
6. Analytics dashboard with interactive charts
7. User management with role-based permissions
8. Billing and subscription management
9. API documentation with interactive examples
10. Real-time notifications center
11. Team collaboration workspace
12. File upload and management system
13. Calendar integration with scheduling
14. Task management with kanban board
15. In-app messaging system
16. Dark mode with automatic switching
17. Keyboard shortcut support
18. Activity feed and audit log
19. Help center with searchable docs
20. Status page for service monitoring"""
            },
            
            "landing": {
                "name": "Product Landing Page",
                "description": "High-converting landing page for products/services",
                "category": "Business",
                "complexity": "Low",
                "estimated_time": "1-2 hours",
                "tags": ["landing", "conversion", "marketing", "lead"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "AOS"],
                "features": 12,
                "prompt": """Create a high-converting landing page with:
1. Attention-grabbing hero section with animated CTA button
2. Features grid with icons and hover effects
3. Social proof section with logos and testimonials
4. Pricing comparison table
5. FAQ accordion with expandable answers
6. Lead capture form with progressive profiling
7. Exit-intent popup for last-chance offers
8. Sticky navigation that changes on scroll
9. Smooth scroll to sections with offset
10. Trust badges and security certificates
11. Mobile-optimized with fast loading
12. A/B testing ready structure"""
            },
            
            # CREATIVE & MEDIA TEMPLATES
            "photography": {
                "name": "Photography Portfolio",
                "description": "Visual showcase for photographers with galleries",
                "category": "Creative",
                "complexity": "Medium",
                "estimated_time": "2-3 hours",
                "tags": ["photography", "gallery", "visual", "art"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Lightbox"],
                "features": 14,
                "prompt": """Create a stunning photography portfolio with:
1. Full-screen hero with background video or slideshow
2. Portfolio grid with masonry layout and lazy loading
3. Advanced lightbox gallery with keyboard navigation
4. Image filtering by category, location, or camera
5. About section with photographer's story and gear
6. Client testimonials with before/after comparisons
7. Blog section for behind-the-scenes stories
8. Contact form with project inquiry details
9. Social media integration (Instagram API)
10. Print store with shopping cart
11. EXIF data display for tech-savvy visitors
12. Parallax scrolling effects
13. Minimalist design that highlights photography
14. Mobile-optimized image viewing"""
            },
            
            "music": {
                "name": "Music Artist Website",
                "description": "Platform for musicians with player and tour dates",
                "category": "Creative",
                "complexity": "Medium",
                "estimated_time": "2-4 hours",
                "tags": ["music", "audio", "artists", "tours"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Howler.js"],
                "features": 16,
                "prompt": """Create a music artist website with:
1. Hero section with latest release and play button
2. Custom audio player with visualizations
3. Discography with album covers and track listings
4. Tour dates with interactive map and ticket links
5. Music video gallery with YouTube integration
6. Merchandise store with product preview
7. Newsletter signup for fan updates
8. Press kit download for media
9. Social media feeds integration
10. Fan community forum section
11. Lyrics display with synchronized highlighting
12. Behind-the-scenes photo gallery
13. Mobile-responsive audio controls
14. Dark theme for immersive experience
15. Concert countdown timers
16. Email list segmentation based on interest"""
            },
            
            "agency": {
                "name": "Creative Agency",
                "description": "Modern website for design/development agencies",
                "category": "Creative",
                "complexity": "High",
                "estimated_time": "3-5 hours",
                "tags": ["agency", "creative", "services", "clients"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Three.js"],
                "features": 17,
                "prompt": """Create a creative agency website with:
1. Bold hero section with animated typography
2. Interactive case studies with before/after sliders
3. Services grid with hover animations
4. Team member profiles with expertise tags
5. Client logo carousel with infinite scroll
6. Process visualization with animated steps
7. Testimonial videos with transcripts
8. Blog with industry insights
9. Project inquiry form with file upload
10. Interactive portfolio filter by industry
11. Animated statistics counter
12. Request quote calculator
13. Live chat integration
14. A/B testing case studies
15. WebGL background effects
16. Accessibility compliance indicators
17. Performance optimization showcase"""
            },
            
            # EDUCATION & LEARNING TEMPLATES
            "education": {
                "name": "Online Learning Platform",
                "description": "E-learning website with courses and tracking",
                "category": "Education",
                "complexity": "High",
                "estimated_time": "4-6 hours",
                "tags": ["education", "courses", "learning", "students"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Video.js"],
                "features": 19,
                "prompt": """Create an online learning platform with:
1. Course catalog with advanced search and filters
2. Course detail pages with curriculum and instructor
3. Video player with playback controls and speed
4. Student dashboard with progress tracking
5. Quiz system with multiple question types
6. Certificate generation upon completion
7. Discussion forums with thread voting
8. Assignment submission with file upload
9. Instructor profiles with verification
10. Course review and rating system
11. Wishlist for future courses
12. Learning path recommendations
13. Mobile app style interface
14. Admin panel for content management
15. Payment integration for premium courses
16. Free trial with limited access
17. Note-taking functionality
18. Bookmark lectures for later
19. Gamification with badges and points"""
            },
            
            "documentation": {
                "name": "Technical Documentation",
                "description": "API or software documentation site",
                "category": "Education",
                "complexity": "Medium",
                "estimated_time": "2-3 hours",
                "tags": ["docs", "api", "technical", "reference"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Prism.js"],
                "features": 13,
                "prompt": """Create a technical documentation website with:
1. Left sidebar navigation with collapsible sections
2. Search functionality with fuzzy matching
3. Code examples with copy-to-clipboard
4. Interactive API endpoint tester
5. Version selector for documentation
6. Breadcrumb navigation for deep pages
7. Table of contents with current position
8. Dark mode optimized for code reading
9. Responsive design for mobile reference
10. Syntax highlighting for multiple languages
11. Quick start guide with interactive steps
12. FAQ section with expandable answers
13. Feedback collection system"""
            },
            
            # COMMUNITY & SOCIAL TEMPLATES
            "forum": {
                "name": "Community Forum",
                "description": "Discussion platform with user profiles",
                "category": "Community",
                "complexity": "High",
                "estimated_time": "4-6 hours",
                "tags": ["forum", "community", "discussion", "social"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Markdown"],
                "features": 18,
                "prompt": """Create a community forum website with:
1. Category-based discussion boards
2. Thread creation with rich text editor
3. User profiles with avatars and reputation
4. Private messaging system
5. Topic subscription and notifications
6. Advanced search across all content
7. Moderation tools for administrators
8. Poll creation with visualization
9. Badge system for achievements
10. Mobile-optimized posting interface
11. SEO-friendly URL structure
12. Social sharing for popular threads
13. Real-time updates for active discussions
14. User blocking and reporting
15. Thread tagging and categorization
16. Upvote/downvote system
17. Bookmark posts for later
18. Activity feed for users"""
            },
            
            "charity": {
                "name": "Non-Profit / Charity",
                "description": "Website for fundraising and awareness",
                "category": "Community",
                "complexity": "Medium",
                "estimated_time": "2-3 hours",
                "tags": ["charity", "nonprofit", "donation", "cause"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Stripe"],
                "features": 15,
                "prompt": """Create a non-profit organization website with:
1. Emotional hero section with mission statement
2. Impact statistics with animated counters
3. Donation form with one-time/recurring options
4. Volunteer signup with interest selection
5. Events calendar with registration
6. Success stories with photo galleries
7. Team introduction with bios
8. Transparency section with financial reports
9. Newsletter subscription
10. Partner and sponsor recognition
11. Blog for updates and stories
12. Resource library for supporters
13. Petition or advocacy campaign section
14. Social media integration for sharing
15. Mobile-optimized donation process"""
            },
            
            # SPECIALIZED TEMPLATES
            "restaurant": {
                "name": "Restaurant Website",
                "description": "Food establishment with menu and reservations",
                "category": "Food",
                "complexity": "Medium",
                "estimated_time": "2-3 hours",
                "tags": ["restaurant", "food", "menu", "reservations"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Calendar"],
                "features": 14,
                "prompt": """Create a restaurant website with:
1. Hero section with food slider and reservation CTA
2. Interactive menu with filtering by dietary restrictions
3. Online reservation system with table availability
4. Food gallery with lightbox view
5. Customer reviews with star ratings
6. Contact page with map and hours
7. Social media integration (Instagram feed)
8. Events and specials calendar
9. Online ordering/takeaway system
10. Chef introduction and story
11. Location and directions with parking info
12. Mobile-optimized menu viewing
13. Newsletter for special offers
14. Gift card purchase option"""
            },
            
            "realestate": {
                "name": "Real Estate Listings",
                "description": "Property search and listing platform",
                "category": "Business",
                "complexity": "High",
                "estimated_time": "3-5 hours",
                "tags": ["realestate", "property", "listings", "housing"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Maps"],
                "features": 17,
                "prompt": """Create a real estate website with:
1. Property search with advanced filters
2. Interactive map view with property markers
3. Property detail pages with image gallery
4. Mortgage calculator with real-time rates
5. Agent profiles with contact forms
6. Saved properties with comparison tool
7. Neighborhood guides with amenities
8. Market trends and statistics
9. Virtual tour integration
10. Email alerts for new listings
11. Mobile-responsive for on-the-go viewing
12. Open house calendar
13. Property valuation estimator
14. School district information
15. Commute time calculator
16. Floor plan viewer
17. Document upload for sellers"""
            },
            
            "fitness": {
                "name": "Fitness Center",
                "description": "Gym website with schedules and tracking",
                "category": "Health",
                "complexity": "Medium",
                "estimated_time": "2-4 hours",
                "tags": ["fitness", "gym", "health", "workout"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Calendar"],
                "features": 16,
                "prompt": """Create a fitness center website with:
1. Hero section with membership promotion
2. Class schedule with filtering and booking
3. Trainer profiles with specialties
4. Membership plans comparison
5. Virtual tour of facilities
6. Nutrition and wellness blog
7. Workout tracking tools
8. Success stories transformation
9. Mobile app download promotion
10. Fitness assessment booking
11. FAQ about equipment and policies
12. Social media community feed
13. Event registration for challenges
14. Progress photo gallery
15. Meal plan generator
16. Integration with fitness wearables"""
            },
            
            "travel": {
                "name": "Travel Agency",
                "description": "Tour booking and destination showcase",
                "category": "Travel",
                "complexity": "High",
                "estimated_time": "3-5 hours",
                "tags": ["travel", "tours", "booking", "destinations"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Maps"],
                "features": 18,
                "prompt": """Create a travel agency website with:
1. Destination search with filters
2. Tour package listings with detailed itineraries
3. Booking system with date picker
4. Customer reviews with photos
5. Travel blog with guides
6. Weather widget for destinations
7. Currency converter
8. Visa requirement information
9. Photo gallery with high-quality images
10. Travel insurance information
11. Flight/hotel booking integration
12. Mobile travel assistant
13. Group travel options
14. Custom tour builder
15. Loyalty program showcase
16. Travel checklist generator
17. Emergency contact information
18. Sustainable travel initiatives"""
            },
            
            "dashboard": {
                "name": "Admin Dashboard",
                "description": "Data-rich administration interface",
                "category": "Business",
                "complexity": "High",
                "estimated_time": "4-6 hours",
                "tags": ["dashboard", "admin", "analytics", "management"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Chart.js"],
                "features": 20,
                "prompt": """Create an admin dashboard with:
1. Sidebar navigation with collapsible sections
2. Dashboard overview with key metrics
3. Interactive charts and data visualization
4. Data tables with sorting and pagination
5. User management with role-based permissions
6. System settings with validation
7. Activity log with filtering
8. Notification center with real-time updates
9. File manager with upload capabilities
10. Calendar with event management
11. Email template builder
12. Report generation and export
13. API key management
14. Backup and restore interface
15. Audit trail viewer
16. Performance monitoring
17. SEO analytics
18. Dark/light theme with auto-switch
19. Mobile-responsive administration
20. Keyboard shortcut support"""
            },
            
            "event": {
                "name": "Event Management",
                "description": "Conference or event website with registration",
                "category": "Events",
                "complexity": "Medium",
                "estimated_time": "2-4 hours",
                "tags": ["events", "conference", "tickets", "schedule"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Calendar"],
                "features": 16,
                "prompt": """Create an event management website with:
1. Hero section with countdown timer
2. Event schedule with session tracks
3. Speaker profiles with bios
4. Ticket registration with tier options
5. Venue information with interactive map
6. Sponsors and partners showcase
7. FAQ section with search
8. Blog for event updates
9. Photo gallery from past events
10. Mobile app promotion
11. Social media wall integration
12. Session feedback collection
13. Networking tools for attendees
14. Virtual event streaming setup
15. Contact form for inquiries
16. Post-event survey system"""
            },
            
            "crypto": {
                "name": "Cryptocurrency Tracker",
                "description": "Real-time crypto prices and portfolio",
                "category": "Finance",
                "complexity": "High",
                "estimated_time": "4-5 hours",
                "tags": ["crypto", "bitcoin", "trading", "finance"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "WebSocket"],
                "features": 17,
                "prompt": """Create a cryptocurrency dashboard with:
1. Real-time price ticker with updates
2. Interactive candlestick charts
3. Portfolio tracker with profit/loss
4. Watchlist with price alerts
5. News aggregator with filtering
6. Exchange comparison table
7. Market cap and volume overview
8. Trading simulator with paper trading
9. Educational resources for beginners
10. Dark theme for prolonged viewing
11. Mobile-responsive trading view
12. API integration for live data
13. Historical data analysis
14. Social sentiment indicators
15. Technical analysis tools
16. Wallet integration demo
17. Regulatory compliance information"""
            },
            
            "jobboard": {
                "name": "Job Board Platform",
                "description": "Employment marketplace with applications",
                "category": "Business",
                "complexity": "High",
                "estimated_time": "4-6 hours",
                "tags": ["jobs", "career", "recruitment", "employment"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Search"],
                "features": 19,
                "prompt": """Create a job board website with:
1. Advanced job search with multiple filters
2. Company profile pages with reviews
3. Job application tracking system
4. Resume builder with templates
5. Job alert email system
6. Career advice blog
7. Salary comparison tool
8. Interview preparation resources
9. User profiles with work history
10. Social login integration
11. Mobile-optimized application process
12. Employer dashboard for posting
13. Applicant screening tools
14. Video interview integration
15. Skills assessment tests
16. Job matching algorithm
17. GDPR compliant data handling
18. Analytics for job performance
19. Multi-language support"""
            },
            
            "recipe": {
                "name": "Recipe Collection",
                "description": "Cooking website with meal planning",
                "category": "Food",
                "complexity": "Medium",
                "estimated_time": "2-4 hours",
                "tags": ["recipes", "cooking", "food", "meal"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Print"],
                "features": 15,
                "prompt": """Create a recipe website with:
1. Recipe search with dietary filters
2. Step-by-step cooking instructions
3. Ingredient shopping list generator
4. Meal planning calendar
5. Nutritional information calculator
6. User recipe submission
7. Rating and review system
8. Video cooking tutorials
9. Seasonal recipe collections
10. Printable recipe cards
11. Cooking timer integration
12. Unit conversion tools
13. Mobile-optimized for kitchen use
14. Social sharing for recipes
15. Meal prep planning tools"""
            },
            
            "wedding": {
                "name": "Wedding Website",
                "description": "Personal wedding site with RSVP",
                "category": "Personal",
                "complexity": "Medium",
                "estimated_time": "2-3 hours",
                "tags": ["wedding", "event", "rsvp", "personal"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Forms"],
                "features": 14,
                "prompt": """Create a wedding website with:
1. Romantic hero with couple's story
2. Event details with countdown
3. RSVP form with meal preferences
4. Guest information and accommodations
5. Photo gallery of the couple
6. Wedding registry integration
7. Travel and directions
8. Interactive seating chart
9. Love story timeline
10. Bridal party introductions
11. Music request form
12. Mobile-optimized for guests
13. Password protection option
14. Thank you notes after event"""
            },
            
            "healthcare": {
                "name": "Medical Clinic",
                "description": "Healthcare provider with appointments",
                "category": "Health",
                "complexity": "Medium",
                "estimated_time": "3-4 hours",
                "tags": ["medical", "healthcare", "doctor", "appointments"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Calendar"],
                "features": 16,
                "prompt": """Create a medical clinic website with:
1. Trust-building hero with emergency contact
2. Services listing with descriptions
3. Online appointment booking
4. Doctor profiles with availability
5. Patient portal demo interface
6. Health education blog
7. FAQ for medical questions
8. Insurance information
9. Telemedicine booking
10. Prescription refill request
11. Testimonials from patients
12. HIPAA compliant design
13. Mobile-first design
14. Symptom checker tool
15. Location finder with hours
16. New patient forms"""
            },
            
            "weather": {
                "name": "Weather Application",
                "description": "Comprehensive weather forecasting",
                "category": "Utility",
                "complexity": "Medium",
                "estimated_time": "2-3 hours",
                "tags": ["weather", "forecast", "utility", "api"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "API"],
                "features": 14,
                "prompt": """Create a weather application with:
1. Current weather with animated icons
2. 7-day forecast with detailed view
3. Hourly weather breakdown
4. Location detection and search
5. Weather maps with layers
6. Severe weather alerts
7. Historical weather data
8. Sunrise/sunset and moon phases
9. Air quality index display
10. Unit conversion options
11. Offline mode for recent locations
12. PWA installation option
13. Weather widget generator
14. Share current conditions"""
            },
            
            "crowdfunding": {
                "name": "Crowdfunding Platform",
                "description": "Fundraising campaigns with tracking",
                "category": "Community",
                "complexity": "High",
                "estimated_time": "4-6 hours",
                "tags": ["crowdfunding", "fundraising", "campaign", "donations"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "Payment"],
                "features": 18,
                "prompt": """Create a crowdfunding platform with:
1. Campaign discovery with filtering
2. Campaign creation wizard
3. Progress tracking with thermometer
4. Donor recognition wall
5. Secure payment processing
6. Social sharing toolkit
7. Campaign updates section
8. Comments and engagement system
9. Trust verification badges
10. Mobile donation flow
11. Analytics for campaign owners
12. Recurring donation options
13. Reward tier management
14. Campaign moderation tools
15. Email notification system
16. Backer management system
17. Campaign story editor
18. Success metrics display"""
            },
            
            "fashion": {
                "name": "Fashion E-commerce",
                "description": "Stylish clothing store with lookbooks",
                "category": "Fashion",
                "complexity": "High",
                "estimated_time": "4-5 hours",
                "tags": ["fashion", "clothing", "style", "shopping"],
                "tech_stack": ["HTML5", "CSS3", "JavaScript", "3D"],
                "features": 17,
                "prompt": """Create a fashion e-commerce website with:
1. Visual hero with seasonal lookbook
2. Product grid with advanced filtering
3. Size guide with measurement charts
4. Virtual try-on feature demo
5. Style inspiration blog
6. Wishlist and outfit builder
7. Customer reviews with photos
8. Lookbook outfit ideas
9. Newsletter for new arrivals
10. Social shopping integration
11. AR product preview demo
12. Mobile shopping interface
13. Gift card system
14. Style quiz for recommendations
15. Sustainable fashion information
16. Size exchange calculator
17. Fashion trend insights"""
            }
        }
    
    def _extract_categories(self) -> List[str]:
        """Extract unique categories from templates."""
        categories = set(t["category"] for t in self.templates.values())
        return sorted(categories)
    
    def list_templates(self, category: str = None, complexity: str = None, 
                      tags: List[str] = None) -> List[Dict[str, Any]]:
        """Get filtered list of templates.
        
        Args:
            category: Filter by category
            complexity: Filter by complexity (Low/Medium/High)
            tags: Filter by tags
            
        Returns:
            List of filtered templates
        """
        templates = [
            {
                "key": key,
                "name": t["name"],
                "description": t["description"],
                "category": t["category"],
                "complexity": t["complexity"],
                "estimated_time": t["estimated_time"],
                "tags": t["tags"],
                "features": t["features"],
                "tech_stack": t["tech_stack"]
            }
            for key, t in self.templates.items()
        ]
        
        if category:
            templates = [t for t in templates if t["category"].lower() == category.lower()]
        
        if complexity:
            templates = [t for t in templates if t["complexity"].lower() == complexity.lower()]
        
        if tags:
            templates = [t for t in templates if any(tag.lower() in [tg.lower() for tg in t["tags"]] for tag in tags)]
        
        return templates
    
    def get_template(self, template_key: str) -> Optional[Dict[str, Any]]:
        """Get complete template details by key."""
        return self.templates.get(template_key.lower())
    
    def get_template_prompt(self, template_key: str) -> Optional[str]:
        """Get prompt for a specific template."""
        template = self.get_template(template_key)
        return template["prompt"] if template else None
    
    def search_templates(self, query: str) -> List[Dict[str, Any]]:
        """Search templates by name, description, or tags."""
        query = query.lower()
        results = []
        
        for key, template in self.templates.items():
            if (query in template['name'].lower() or 
                query in template['description'].lower() or
                any(query in tag.lower() for tag in template['tags']) or
                query in template['category'].lower()):
                results.append({
                    "key": key,
                    "name": template['name'],
                    "description": template['description'],
                    "category": template['category'],
                    "complexity": template['complexity']
                })
        
        return results
    
    def get_random_template(self) -> Tuple[str, str]:
        """Get a random template for inspiration."""
        key = random.choice(list(self.templates.keys()))
        return key, self.templates[key]['name']
    
    def get_template_stats(self) -> Dict[str, Any]:
        """Get statistics about all templates."""
        total = len(self.templates)
        complexities = {}
        categories = {}
        features_total = 0
        
        for template in self.templates.values():
            complexities[template['complexity']] = complexities.get(template['complexity'], 0) + 1
            categories[template['category']] = categories.get(template['category'], 0) + 1
            features_total += template['features']
        
        return {
            "total_templates": total,
            "avg_features": features_total / total,
            "complexity_distribution": complexities,
            "category_distribution": categories,
            "user_selections": self.user_stats["selections"],
            "last_selected": self.user_stats["last_selected"]
        }


class TemplateInterface:
    """User interface for template selection and management."""
    
    def __init__(self, template_system: TemplateSystem):
        self.ts = template_system
        
    def display_header(self, title: str, width: int = 70):
        """Display formatted header."""
        print(f"\n{Fore.CYAN}{'═' * width}")
        print(f"{title.center(width)}")
        print(f"{'═' * width}{Style.RESET_ALL}")
    
    def display_categories(self):
        """Display all template categories."""
        self.display_header("📁 TEMPLATE CATEGORIES")
        categories = self.ts.categories
        
        for i, category in enumerate(categories, 1):
            count = sum(1 for t in self.ts.templates.values() if t["category"] == category)
            color = self._get_category_color(category)
            print(f"  {Fore.YELLOW}{i:2d}.{Style.RESET_ALL} {color}{category:<15}{Style.RESET_ALL} ({count} templates)")
        
        print(f"\n  {Fore.YELLOW} 0.{Style.RESET_ALL} Show all templates")
        print(f"  {Fore.YELLOW} S.{Style.RESET_ALL} Search templates")
        print(f"  {Fore.YELLOW} R.{Style.RESET_ALL} Random suggestion")
        print(f"  {Fore.YELLOW} X.{Style.RESET_ALL} Show statistics")
    
    def _get_category_color(self, category: str) -> str:
        """Get color for category display."""
        colors = {
            "Personal": Fore.GREEN,
            "Business": Fore.BLUE,
            "Creative": Fore.MAGENTA,
            "Education": Fore.CYAN,
            "Community": Fore.YELLOW,
            "Food": Fore.RED,
            "Health": Fore.GREEN,
            "Travel": Fore.BLUE,
            "Finance": Fore.YELLOW,
            "Events": Fore.MAGENTA,
            "Fashion": Fore.LIGHTMAGENTA_EX,
            "Utility": Fore.LIGHTCYAN_EX,
            "Content": Fore.LIGHTBLUE_EX
        }
        return colors.get(category, Fore.WHITE)
    
    def display_template_grid(self, templates: List[Dict[str, Any]], page: int = 1, 
                            page_size: int = 8, total_templates: int = None):
        """Display templates in a paginated grid."""
        if not templates:
            print(f"{Fore.RED}No templates found matching your criteria.{Style.RESET_ALL}")
            return
        
        total = total_templates or len(templates)
        total_pages = (total + page_size - 1) // page_size
        start_idx = (page - 1) * page_size
        end_idx = min(start_idx + page_size, len(templates))
        
        self.display_header(f"📦 AVAILABLE TEMPLATES (Page {page}/{total_pages})")
        
        for i in range(start_idx, end_idx):
            t = templates[i]
            idx = i + 1
            complexity_color = self._get_complexity_color(t['complexity'])
            
            print(f"\n{Fore.YELLOW}{idx:3d}.{Style.RESET_ALL} {Fore.WHITE}{t['name']}{Style.RESET_ALL}")
            print(f"     {Fore.CYAN}{t['description']}{Style.RESET_ALL}")
            print(f"     {self._get_category_color(t['category'])}📁 {t['category']}{Style.RESET_ALL} | "
                  f"{complexity_color}⚡ {t['complexity']}{Style.RESET_ALL} | "
                  f"{Fore.LIGHTYELLOW_EX}⏱️ {t['estimated_time']}{Style.RESET_ALL} | "
                  f"{Fore.LIGHTMAGENTA_EX}✨ {t['features']} features{Style.RESET_ALL}")
            print(f"     {Fore.LIGHTCYAN_EX}🏷️  {', '.join(t['tags'][:3])}{Style.RESET_ALL}")
        
        print(f"\n{Fore.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Style.RESET_ALL}")
        
        # Navigation instructions
        print(f"{Fore.LIGHTBLACK_EX}Commands: {Style.RESET_ALL}", end="")
        print(f"{Fore.YELLOW}[1-{len(templates)}]{Style.RESET_ALL} Select | ", end="")
        
        if total_pages > 1:
            if page > 1:
                print(f"{Fore.YELLOW}P{Style.RESET_ALL} Previous | ", end="")
            if page < total_pages:
                print(f"{Fore.YELLOW}N{Style.RESET_ALL} Next | ", end="")
        
        print(f"{Fore.YELLOW}B{Style.RESET_ALL} Back | ", end="")
        print(f"{Fore.YELLOW}0{Style.RESET_ALL} Custom")
    
    def _get_complexity_color(self, complexity: str) -> str:
        """Get color for complexity indicator."""
        colors = {
            "Low": Fore.GREEN,
            "Medium": Fore.YELLOW,
            "High": Fore.RED
        }
        return colors.get(complexity, Fore.WHITE)
    
    def display_template_detail(self, template_key: str):
        """Display detailed template information."""
        template = self.ts.get_template(template_key)
        if not template:
            print(f"{Fore.RED}Template not found.{Style.RESET_ALL}")
            return
        
        self.display_header(f"📋 {template['name'].upper()}")
        
        # Basic info
        print(f"{Fore.CYAN}📝 Description:{Style.RESET_ALL}")
        print(f"  {template['description']}\n")
        
        # Metadata
        print(f"{Fore.CYAN}📊 Metadata:{Style.RESET_ALL}")
        print(f"  {Fore.LIGHTBLUE_EX}• Category:{Style.RESET_ALL} {self._get_category_color(template['category'])}{template['category']}{Style.RESET_ALL}")
        print(f"  {Fore.LIGHTBLUE_EX}• Complexity:{Style.RESET_ALL} {self._get_complexity_color(template['complexity'])}{template['complexity']}{Style.RESET_ALL}")
        print(f"  {Fore.LIGHTBLUE_EX}• Estimated Time:{Style.RESET_ALL} {template['estimated_time']}")
        print(f"  {Fore.LIGHTBLUE_EX}• Features:{Style.RESET_ALL} {template['features']}")
        
        # Tags
        print(f"\n{Fore.CYAN}🏷️  Tags:{Style.RESET_ALL}")
        tags_text = "  "
        for tag in template['tags']:
            tags_text += f"{Fore.LIGHTCYAN_EX}[{tag}]{Style.RESET_ALL} "
        print(tags_text)
        
        # Tech stack
        print(f"\n{Fore.CYAN}🛠️  Tech Stack:{Style.RESET_ALL}")
        tech_text = "  "
        for tech in template['tech_stack'][:5]:
            tech_text += f"{Fore.LIGHTGREEN_EX}{tech}{Style.RESET_ALL} • "
        print(tech_text.rstrip(" • "))
        
        # Feature preview
        print(f"\n{Fore.CYAN}✨ Key Features:{Style.RESET_ALL}")
        prompt_lines = template['prompt'].split('\n')[:6]
        for line in prompt_lines:
            if line.strip() and not line.strip().isdigit():
                print(f"  {Fore.LIGHTYELLOW_EX}•{Style.RESET_ALL} {line.strip().lstrip('-').lstrip('0123456789. ')}")
        
        if template['features'] > 6:
            print(f"  {Fore.LIGHTBLACK_EX}• ... and {template['features'] - 6} more features{Style.RESET_ALL}")
    
    def display_stats(self):
        """Display system statistics."""
        stats = self.ts.get_template_stats()
        
        self.display_header("📈 TEMPLATE SYSTEM STATISTICS")
        
        print(f"{Fore.CYAN}📊 Overview:{Style.RESET_ALL}")
        print(f"  {Fore.LIGHTBLUE_EX}• Total Templates:{Style.RESET_ALL} {stats['total_templates']}")
        print(f"  {Fore.LIGHTBLUE_EX}• Average Features:{Style.RESET_ALL} {stats['avg_features']:.1f}")
        print(f"  {Fore.LIGHTBLUE_EX}• User Selections:{Style.RESET_ALL} {stats['user_selections']}")
        
        if stats['last_selected']:
            print(f"  {Fore.LIGHTBLUE_EX}• Last Selected:{Style.RESET_ALL} {stats['last_selected']}")
        
        print(f"\n{Fore.CYAN}📈 Complexity Distribution:{Style.RESET_ALL}")
        for complexity, count in stats['complexity_distribution'].items():
            color = self._get_complexity_color(complexity)
            percentage = (count / stats['total_templates']) * 100
            print(f"  {color}• {complexity}:{Style.RESET_ALL} {count} templates ({percentage:.1f}%)")
        
        print(f"\n{Fore.CYAN}📁 Category Distribution:{Style.RESET_ALL}")
        for category, count in stats['category_distribution'].items():
            color = self._get_category_color(category)
            percentage = (count / stats['total_templates']) * 100
            print(f"  {color}• {category}:{Style.RESET_ALL} {count} templates ({percentage:.1f}%)")
    
    def select_template(self) -> Tuple[Optional[str], Optional[str]]:
        """Main template selection interface."""
        templates = []
        current_page = 1
        page_size = 8
        filters = {}
        
        while True:
            # Display categories if no templates loaded
            if not templates:
                self.display_categories()
                
                choice = input(f"\n{Fore.GREEN}➤ Select option: {Style.RESET_ALL}").strip().upper()
                
                if choice == "0":
                    templates = self.ts.list_templates()
                elif choice == "S":
                    search_query = input(f"{Fore.GREEN}🔍 Search for: {Style.RESET_ALL}").strip()
                    if search_query:
                        templates = self.ts.search_templates(search_query)
                    else:
                        templates = self.ts.list_templates()
                elif choice == "R":
                    key, name = self.ts.get_random_template()
                    print(f"\n{Fore.CYAN}🎲 Random suggestion: {Fore.WHITE}{name}{Style.RESET_ALL}")
                    confirm = input(f"{Fore.GREEN}Use this template? (Y/n): {Style.RESET_ALL}").strip().lower()
                    if confirm in ['', 'y', 'yes']:
                        self.ts.user_stats["selections"] += 1
                        self.ts.user_stats["last_selected"] = name
                        return key, self.ts.get_template_prompt(key)
                    continue
                elif choice == "X":
                    self.display_stats()
                    input(f"\n{Fore.LIGHTBLACK_EX}Press Enter to continue...{Style.RESET_ALL}")
                    continue
                elif choice.isdigit():
                    cat_num = int(choice)
                    categories = self.ts.categories
                    if 1 <= cat_num <= len(categories):
                        selected_category = categories[cat_num - 1]
                        templates = self.ts.list_templates(category=selected_category)
                        filters['category'] = selected_category
                        print(f"\n{Fore.GREEN}✓ Filtered by category: {selected_category}{Style.RESET_ALL}")
                    else:
                        print(f"{Fore.RED}Invalid category number.{Style.RESET_ALL}")
                        continue
                else:
                    print(f"{Fore.RED}Invalid option.{Style.RESET_ALL}")
                    continue
                
                if not templates:
                    print(f"{Fore.YELLOW}No templates found with current filters.{Style.RESET_ALL}")
                    templates = self.ts.list_templates()
                    continue
                
                current_page = 1
            
            # Display current page of templates
            self.display_template_grid(templates, current_page, page_size, len(templates))
            
            # Get user input
            choice = input(f"\n{Fore.GREEN}➤ Select template: {Style.RESET_ALL}").strip().upper()
            
            if choice == "0":
                print(f"\n{Fore.YELLOW}↪ Switching to custom prompt mode.{Style.RESET_ALL}")
                return None, None
            
            elif choice == "B":
                templates = []
                continue
            
            elif choice == "P" and current_page > 1:
                current_page -= 1
                continue
            
            elif choice == "N" and current_page < (len(templates) + page_size - 1) // page_size:
                current_page += 1
                continue
            
            elif choice.isdigit():
                choice_num = int(choice)
                if 1 <= choice_num <= len(templates):
                    selected = templates[choice_num - 1]
                    
                    # Show template details
                    self.display_template_detail(selected['key'])
                    
                    # Confirmation
                    print(f"\n{Fore.CYAN}{'━' * 50}{Style.RESET_ALL}")
                    confirm = input(f"{Fore.GREEN}✅ Use this template? (Y/n/back): {Style.RESET_ALL}").strip().lower()
                    
                    if confirm in ['', 'y', 'yes']:
                        self.ts.user_stats["selections"] += 1
                        self.ts.user_stats["last_selected"] = selected['name']
                        print(f"\n{Fore.GREEN}🎉 Selected: {selected['name']}{Style.RESET_ALL}")
                        return selected['key'], self.ts.get_template_prompt(selected['key'])
                    elif confirm == 'back':
                        continue
                    else:
                        print(f"{Fore.YELLOW}↩ Returning to template selection.{Style.RESET_ALL}")
                        continue
                else:
                    print(f"{Fore.RED}Invalid selection. Choose 1-{len(templates)}.{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}Invalid input. Please enter a number or valid command.{Style.RESET_ALL}")


# Convenience wrapper functions for external use
def show_template_menu() -> Optional[str]:
    """Show template menu and return selected template prompt.
    This is a convenience function for main.py"""
    ts = TemplateSystem()
    interface = TemplateInterface(ts)
    
    try:
        template_key, template_prompt = interface.select_template()
        return template_prompt
    except (KeyboardInterrupt, Exception):
        return None


def get_template_prompt(template_key: str) -> Optional[str]:
    """Get prompt for a specific template.
    This is a convenience function for main.py"""
    ts = TemplateSystem()
    return ts.get_template_prompt(template_key)


def list_templates(category: str = None, complexity: str = None, tags: List[str] = None) -> List[Dict[str, Any]]:
    """Get filtered list of templates.
    This is a convenience function for main.py"""
    ts = TemplateSystem()
    return ts.list_templates(category=category, complexity=complexity, tags=tags)


def main():
    """Main entry point for template selection system."""
    print(f"{Fore.CYAN}{'='*70}")
    print(f"{'🚀 ADVANCED TEMPLATE SELECTION SYSTEM'.center(70)}")
    print(f"{'='*70}{Style.RESET_ALL}")
    
    # Initialize system
    ts = TemplateSystem()
    
    print(f"\n{Fore.LIGHTBLACK_EX}Welcome! Select from {len(ts.templates)} pre-defined website templates.")
    print(f"Each template includes detailed specifications and prompts.{Style.RESET_ALL}")
    interface = TemplateInterface(ts)
    
    try:
        # Get template selection
        template_key, template_prompt = interface.select_template()
        
        if template_prompt:
            print(f"\n{Fore.GREEN}{'✓'*50}")
            print(f"Template ready! ({len(template_prompt)} characters)")
            print(f"{'✓'*50}{Style.RESET_ALL}")
            
            # Optional: Show first few lines of prompt
            preview = input(f"\n{Fore.CYAN}Show prompt preview? (Y/n): {Style.RESET_ALL}").strip().lower()
            if preview in ['', 'y', 'yes']:
                lines = template_prompt.split('\n')[:10]
                print(f"\n{Fore.YELLOW}Prompt Preview:{Style.RESET_ALL}")
                for line in lines:
                    print(f"  {Fore.LIGHTBLACK_EX}{line}{Style.RESET_ALL}")
                prompt_lines_count = len(template_prompt.split('\n'))
                if prompt_lines_count > 10:
                    print(f"  {Fore.LIGHTBLACK_EX}... and {prompt_lines_count - 10} more lines{Style.RESET_ALL}")
        else:
            print(f"\n{Fore.YELLOW}✓ Custom prompt mode selected.{Style.RESET_ALL}")
            print(f"{Fore.LIGHTBLACK_EX}You will enter your own project requirements.{Style.RESET_ALL}")
            
    except KeyboardInterrupt:
        print(f"\n\n{Fore.YELLOW}👋 Selection cancelled. Goodbye!{Style.RESET_ALL}")
        return None, None
    except Exception as e:
        print(f"\n{Fore.RED}⚠ An error occurred: {e}{Style.RESET_ALL}")
        return None, None
    
    return template_key, template_prompt


if __name__ == "__main__":
    # Export templates to JSON for external use
    if not os.path.exists("templates_backup.json"):
        ts = TemplateSystem()
        with open("templates_backup.json", "w") as f:
            json.dump(ts.templates, f, indent=2)
        print(f"{Fore.GREEN}✓ Templates exported to templates_backup.json{Style.RESET_ALL}")
    
    # Run the main interface
    main()