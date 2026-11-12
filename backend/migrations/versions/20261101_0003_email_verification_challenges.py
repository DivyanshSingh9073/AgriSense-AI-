"""Add hashed email verification challenges and rate-limit state.

Revision ID: 20261101_0003
Revises: 20261010_0002
Create Date: 2026-11-01
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20261101_0003"
down_revision: Union[str, None] = "20261010_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "email_verification_challenges",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("email_hash", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_sent_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resend_window_started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resend_count", sa.Integer(), nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_email_verification_challenges_email_hash",
        "email_verification_challenges",
        ["email_hash"],
        unique=True,
    )
    op.create_index(
        "ix_email_verification_challenges_user_id",
        "email_verification_challenges",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_email_verification_challenges_user_id", table_name="email_verification_challenges")
    op.drop_index("ix_email_verification_challenges_email_hash", table_name="email_verification_challenges")
    op.drop_table("email_verification_challenges")