"""add users and user_tokens tables

Revision ID: 21de4c1d7406
Revises: create_emotion_logs_table
Create Date: 2025-06-06 15:30:25.067132
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '21de4c1d7406'
down_revision: Union[str, None] = 'create_emotion_logs_table'  # Updated to point to emotion logs migration
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.Text, nullable=False, unique=True),
        sa.Column('name', sa.Text, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.true()),
    )

    op.create_table(
        'user_tokens',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token', sa.Text, nullable=False, unique=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.true()),
    )

def downgrade() -> None:
    op.drop_table('user_tokens')
    op.drop_table('users')