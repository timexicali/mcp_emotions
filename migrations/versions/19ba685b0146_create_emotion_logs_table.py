from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = 'create_emotion_logs_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'emotion_logs',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('session_id', sa.Text, nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('emotions', sa.Text, nullable=False),  # We'll store JSON as a string
        sa.Column('context', sa.Text),
        sa.Column('timestamp', sa.TIMESTAMP, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

def downgrade():
    op.drop_table('emotion_logs')