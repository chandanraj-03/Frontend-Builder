import sys
sys.path.insert(0, "d:/project/New folder/webdev")
import traceback
try:
    from backend.api_server import app
    print("Import OK")
except Exception as e:
    traceback.print_exc()

