"""API routers package."""

from .router_auth       import router as auth_router
from .router_projects   import router as projects_router
from .router_build      import router as build_router
from .router_artifacts  import router as artifacts_router
from .router_dashboard  import router as dashboard_router
from .router_templates  import router as templates_router
from .router_settings   import router as settings_router
from .router_chat       import router as chat_router

__all__ = [
    "auth_router",
    "projects_router",
    "build_router",
    "artifacts_router",
    "dashboard_router",
    "templates_router",
    "settings_router",
    "chat_router",
]
