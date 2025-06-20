"""Add language_id to feedback table and populate languages

Revision ID: add_language_id_feedback
Revises: 1750298798
Create Date: 2025-01-20 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_language_id_feedback'
down_revision = '1750298798'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create languages table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS languages (
            id SERIAL PRIMARY KEY,
            code VARCHAR(5) UNIQUE NOT NULL,
            name VARCHAR(50) NOT NULL
        );
    """)
    
    # Insert initial language data
    op.execute("""
        INSERT INTO languages (code, name) VALUES 
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French')
        ON CONFLICT (code) DO NOTHING;
    """)
    
    # Add language_id column to feedback table if it doesn't exist
    op.execute("""
        ALTER TABLE feedback 
        ADD COLUMN IF NOT EXISTS language_id INTEGER REFERENCES languages(id);
    """)


def downgrade() -> None:
    # Remove language_id column from feedback table
    op.execute("ALTER TABLE feedback DROP COLUMN IF EXISTS language_id;")
    
    # Drop languages table
    op.execute("DROP TABLE IF EXISTS languages;") 