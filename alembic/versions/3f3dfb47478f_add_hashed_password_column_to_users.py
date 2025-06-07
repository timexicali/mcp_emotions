"""add hashed_password column to users

Revision ID: 3f3dfb47478f
Revises: create_emotion_logs
Create Date: 2024-03-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f3dfb47478f'
down_revision: Union[str, None] = 'create_emotion_logs'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('users', sa.Column('hashed_password', sa.String(), nullable=False, server_default=''))


def downgrade():
    op.drop_column('users', 'hashed_password')