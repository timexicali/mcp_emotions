"""add_sarcasm_detected_to_emotion_logs

Revision ID: 289a107ec67e
Revises: 65951466651d
Create Date: 2025-06-12 03:38:32.271334

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '289a107ec67e'
down_revision: Union[str, None] = '65951466651d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('emotion_logs', sa.Column('sarcasm_detected', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('emotion_logs', 'sarcasm_detected')
