"""Create persisted farm reports.

Revision ID: 20261112_0004
Revises: 20261101_0003
Create Date: 2026-11-12
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20261112_0004"
down_revision: Union[str, None] = "20261101_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "reports",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("farm_id", sa.Integer(), nullable=True),
        sa.Column("report_type", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("summary", sa.String(length=2000), nullable=False),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint(
            "report_type IN ('crop_health', 'weather_summary', 'soil_analysis', 'yield_forecast')",
            name="ck_reports_report_type",
        ),
        sa.ForeignKeyConstraint(["farm_id"], ["farms.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reports_user_created_at", "reports", ["user_id", "created_at"], unique=False)
    op.create_index("ix_reports_farm_id", "reports", ["farm_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_reports_farm_id", table_name="reports")
    op.drop_index("ix_reports_user_created_at", table_name="reports")
    op.drop_table("reports")
