from flask import Flask
from flask_cors import CORS
import os
import sys

# Add parent directory to path to find config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

from app import routes 