# db.py
import os
from databases import Database

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://mcpsuper:mysecurepass@db:5432/mcpdb")
database = Database(DATABASE_URL)