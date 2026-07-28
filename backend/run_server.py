import sys
import os

# Add current dir to python path
sys.path.insert(0, os.path.dirname(__file__))

from app import app

if __name__ == "__main__":
    print("Launching Microvascular Python AI Server...")
    app.run(host="127.0.0.1", port=5000, debug=False)
