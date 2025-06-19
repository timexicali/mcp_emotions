"""add feedback table

Revision ID: 1750298798
Revises: 289a107ec67e
Create Date: 2025-01-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '1750298798'
down_revision: Union[str, None] = '289a107ec67e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add feedback table to match existing manual table."""
    # Create feedback table to match the manually created table
    op.create_table('feedback',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('predicted_emotions', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('feedback_per_emotion', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('suggested_emotions', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('emotion_label', sa.String(), nullable=True),
        sa.Column('vote', sa.Boolean(), nullable=True),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('model_version', sa.String(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Remove feedback table."""
    op.drop_table('feedback') 