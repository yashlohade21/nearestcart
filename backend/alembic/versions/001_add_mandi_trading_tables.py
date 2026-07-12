"""Add mandi trading and accounting tables

Revision ID: 001_add_mandi_trading_tables
Revises: 80f693cffc08
Create Date: 2026-07-12

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "001_add_mandi_trading_tables"
down_revision = "80f693cffc08"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # 1. companies                                                         #
    # ------------------------------------------------------------------ #
    op.create_table(
        "companies",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("gst_no", sa.String(20), nullable=True),
        sa.Column("pan_no", sa.String(15), nullable=True),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("phone", sa.String(15), nullable=True),
        sa.Column("email", sa.String(150), nullable=True),
        sa.Column("bank_name", sa.String(100), nullable=True),
        sa.Column("account_no", sa.String(30), nullable=True),
        sa.Column("ifsc_code", sa.String(15), nullable=True),
        sa.Column("branch", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 2. cash_entries                                                      #
    # ------------------------------------------------------------------ #
    op.create_table(
        "cash_entries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("narration", sa.Text(), nullable=True),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("party_name", sa.String(200), nullable=True),
        sa.Column("party_type", sa.String(50), nullable=True),
        sa.Column("reference_no", sa.String(50), nullable=True),
        sa.Column("branch", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 3. bank_transactions                                                 #
    # ------------------------------------------------------------------ #
    op.create_table(
        "bank_transactions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("bank_account_id", UUID(as_uuid=True),
                  sa.ForeignKey("bank_accounts.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("txn_date", sa.Date(), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("party_name", sa.String(200), nullable=True),
        sa.Column("cheque_no", sa.String(30), nullable=True),
        sa.Column("cheque_date", sa.Date(), nullable=True),
        sa.Column("narration", sa.Text(), nullable=True),
        sa.Column("reconciled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 4. expenses                                                          #
    # ------------------------------------------------------------------ #
    op.create_table(
        "expenses",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("narration", sa.Text(), nullable=True),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("payment_mode", sa.String(20), nullable=True),
        sa.Column("bank_account_id", UUID(as_uuid=True),
                  sa.ForeignKey("bank_accounts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("cheque_no", sa.String(30), nullable=True),
        sa.Column("party_name", sa.String(200), nullable=True),
        sa.Column("farmer_bill_ref", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 5. vehicles                                                          #
    # ------------------------------------------------------------------ #
    op.create_table(
        "vehicles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("vehicle_no", sa.String(20), nullable=True),
        sa.Column("owner_name", sa.String(150), nullable=True),
        sa.Column("driver_name", sa.String(150), nullable=True),
        sa.Column("phone", sa.String(15), nullable=True),
        sa.Column("vehicle_type", sa.String(50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 6. delivery_places                                                   #
    # ------------------------------------------------------------------ #
    op.create_table(
        "delivery_places",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("place_name", sa.String(200), nullable=False),
        sa.Column("district", sa.String(100), nullable=True),
        sa.Column("state", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 7. kharidars                                                         #
    # ------------------------------------------------------------------ #
    op.create_table(
        "kharidars",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("phone", sa.String(15), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 8. purchase_entries                                                  #
    # ------------------------------------------------------------------ #
    op.create_table(
        "purchase_entries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("bill_no", sa.String(50), nullable=True),
        sa.Column("p_date", sa.Date(), nullable=False),
        sa.Column("supplier_id", UUID(as_uuid=True),
                  sa.ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("vehicle_no", sa.String(20), nullable=True),
        sa.Column("product_id", UUID(as_uuid=True),
                  sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("agent_id", UUID(as_uuid=True),
                  sa.ForeignKey("agents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("quantity", sa.Numeric(10, 2), nullable=False),
        sa.Column("rate", sa.Numeric(10, 2), nullable=False),
        sa.Column("gross_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("transport_cost", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("loading_cost", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("unloading_cost", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("advance", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("net_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("commission_deduction", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("branch", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 9. sale_entries                                                      #
    # ------------------------------------------------------------------ #
    op.create_table(
        "sale_entries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("invoice_no", sa.String(50), nullable=True),
        sa.Column("sale_date", sa.Date(), nullable=False),
        sa.Column("buyer_id", UUID(as_uuid=True),
                  sa.ForeignKey("buyers.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("product_id", UUID(as_uuid=True),
                  sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("quantity", sa.Numeric(10, 2), nullable=False),
        sa.Column("rate", sa.Numeric(10, 2), nullable=False),
        sa.Column("gross_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("transport_cost", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("lr_no", sa.String(50), nullable=True),
        sa.Column("driver_name", sa.String(150), nullable=True),
        sa.Column("vehicle_no", sa.String(20), nullable=True),
        sa.Column("owner_name", sa.String(150), nullable=True),
        sa.Column("hsn_code", sa.String(20), nullable=True),
        sa.Column("tcs_amount", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("add_topay", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("less_topay", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("net_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("po_no", sa.String(50), nullable=True),
        sa.Column("branch", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 10. purchase_payments                                                #
    # ------------------------------------------------------------------ #
    op.create_table(
        "purchase_payments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("supplier_id", UUID(as_uuid=True),
                  sa.ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("bill_no", sa.String(50), nullable=True),
        sa.Column("total", sa.Numeric(14, 2), nullable=False),
        sa.Column("paid", sa.Numeric(14, 2), nullable=False),
        sa.Column("balance", sa.Numeric(14, 2), nullable=False),
        sa.Column("bank_name", sa.String(100), nullable=True),
        sa.Column("cheque_no", sa.String(30), nullable=True),
        sa.Column("payment_mode", sa.String(20), nullable=False,
                  server_default=sa.text("'cash'")),
        sa.Column("narration", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 11. sale_payments                                                    #
    # ------------------------------------------------------------------ #
    op.create_table(
        "sale_payments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("buyer_id", UUID(as_uuid=True),
                  sa.ForeignKey("buyers.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("invoice_no", sa.String(50), nullable=True),
        sa.Column("total", sa.Numeric(14, 2), nullable=False),
        sa.Column("received", sa.Numeric(14, 2), nullable=False),
        sa.Column("balance", sa.Numeric(14, 2), nullable=False),
        sa.Column("bank_name", sa.String(100), nullable=True),
        sa.Column("cheque_no", sa.String(30), nullable=True),
        sa.Column("payment_mode", sa.String(20), nullable=False,
                  server_default=sa.text("'cash'")),
        sa.Column("narration", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 12. farmer_entries                                                   #
    # ------------------------------------------------------------------ #
    op.create_table(
        "farmer_entries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("invoice_no", sa.String(50), nullable=True),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("farmer_id", UUID(as_uuid=True),
                  sa.ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("village", sa.String(200), nullable=True),
        sa.Column("kharidar_id", UUID(as_uuid=True),
                  sa.ForeignKey("kharidars.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_id", UUID(as_uuid=True),
                  sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("weight", sa.Numeric(10, 2), nullable=False),
        sa.Column("rate", sa.Numeric(10, 2), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("hamali", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("tawali", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("warai", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("auto_charge", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("kharcha", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("mobile_no", sa.String(15), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 13. farmer_sales                                                     #
    # ------------------------------------------------------------------ #
    op.create_table(
        "farmer_sales",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("farmer_entry_id", UUID(as_uuid=True),
                  sa.ForeignKey("farmer_entries.id", ondelete="CASCADE"), nullable=False),
        sa.Column("market_fees", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("supervision", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("adat_commission", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("bardan", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("labour", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("sutli", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("gadi_bhada", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("weight_short", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("total_deductions", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("net_payable", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 14. farmer_payment_records                                           #
    # ------------------------------------------------------------------ #
    op.create_table(
        "farmer_payment_records",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("farmer_id", UUID(as_uuid=True),
                  sa.ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("cash_amount", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("bank_name", sa.String(100), nullable=True),
        sa.Column("cheque_no", sa.String(30), nullable=True),
        sa.Column("narration", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 15. nave_bills                                                       #
    # ------------------------------------------------------------------ #
    op.create_table(
        "nave_bills",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("bill_no", sa.String(50), nullable=True),
        sa.Column("bill_date", sa.Date(), nullable=False),
        sa.Column("buyer_id", UUID(as_uuid=True),
                  sa.ForeignKey("buyers.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("total_amount", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("total_deductions", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("net_amount", sa.Numeric(14, 2), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'draft'")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 16. nave_bill_items                                                  #
    # ------------------------------------------------------------------ #
    op.create_table(
        "nave_bill_items",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("nave_bill_id", UUID(as_uuid=True),
                  sa.ForeignKey("nave_bills.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", UUID(as_uuid=True),
                  sa.ForeignKey("products.id", ondelete="SET NULL"), nullable=True),
        sa.Column("kharidar_name", sa.String(200), nullable=True),
        sa.Column("pauti_no", sa.String(50), nullable=True),
        sa.Column("weight", sa.Numeric(10, 2), nullable=False),
        sa.Column("rate", sa.Numeric(10, 2), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 17. nave_bill_details                                                #
    # ------------------------------------------------------------------ #
    op.create_table(
        "nave_bill_details",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("nave_bill_id", UUID(as_uuid=True),
                  sa.ForeignKey("nave_bills.id", ondelete="CASCADE"),
                  nullable=False, unique=True),
        sa.Column("market_fees", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("supervision", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("adat", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("bardan", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("labour", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("gadi_bhada", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("sutli", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("weight_short", sa.Numeric(14, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 18. agent_commissions                                                #
    # ------------------------------------------------------------------ #
    op.create_table(
        "agent_commissions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("agent_id", UUID(as_uuid=True),
                  sa.ForeignKey("agents.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("bill_no", sa.String(50), nullable=True),
        sa.Column("supplier_name", sa.String(200), nullable=True),
        sa.Column("vehicle_no", sa.String(20), nullable=True),
        sa.Column("bill_total", sa.Numeric(14, 2), nullable=False),
        sa.Column("commission_pct", sa.Numeric(5, 2), nullable=False),
        sa.Column("commission_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=True),
        sa.Column("paid", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # 19. stock_ledger                                                     #
    # ------------------------------------------------------------------ #
    op.create_table(
        "stock_ledger",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_id", UUID(as_uuid=True),
                  sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("txn_date", sa.Date(), nullable=False),
        sa.Column("txn_type", sa.String(20), nullable=False),
        sa.Column("quantity", sa.Numeric(10, 2), nullable=False),
        sa.Column("reference_id", UUID(as_uuid=True), nullable=True),
        sa.Column("reference_type", sa.String(30), nullable=True),
        sa.Column("balance_after", sa.Numeric(10, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    # ------------------------------------------------------------------ #
    # Add columns to existing tables                                       #
    # ------------------------------------------------------------------ #

    # users
    op.add_column(
        "users",
        sa.Column("financial_year_start", sa.Integer(), nullable=False,
                  server_default=sa.text("4")),
    )
    op.add_column(
        "users",
        sa.Column("default_company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
    )

    # farmers
    op.add_column("farmers", sa.Column("gaon", sa.String(200), nullable=True))
    op.add_column("farmers", sa.Column("taluka", sa.String(100), nullable=True))
    op.add_column("farmers", sa.Column("bank_name", sa.String(100), nullable=True))
    op.add_column("farmers", sa.Column("account_no", sa.String(30), nullable=True))
    op.add_column("farmers", sa.Column("ifsc_code", sa.String(15), nullable=True))
    op.add_column("farmers", sa.Column("farmer_bank_branch", sa.String(100), nullable=True))

    # products
    op.add_column(
        "products",
        sa.Column("product_name_marathi", sa.String(200), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column("gst_rate", sa.Numeric(5, 2), nullable=True),
    )

    # agents
    op.add_column("agents", sa.Column("branch", sa.String(100), nullable=True))

    # bank_accounts
    op.add_column(
        "bank_accounts",
        sa.Column("company_id", UUID(as_uuid=True),
                  sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
    )


def downgrade() -> None:
    # ------------------------------------------------------------------ #
    # Remove columns from existing tables (reverse order of upgrade)      #
    # ------------------------------------------------------------------ #

    # bank_accounts
    op.drop_column("bank_accounts", "company_id")

    # agents
    op.drop_column("agents", "branch")

    # products
    op.drop_column("products", "gst_rate")
    op.drop_column("products", "product_name_marathi")

    # farmers
    op.drop_column("farmers", "farmer_bank_branch")
    op.drop_column("farmers", "ifsc_code")
    op.drop_column("farmers", "account_no")
    op.drop_column("farmers", "bank_name")
    op.drop_column("farmers", "taluka")
    op.drop_column("farmers", "gaon")

    # users
    op.drop_column("users", "default_company_id")
    op.drop_column("users", "financial_year_start")

    # ------------------------------------------------------------------ #
    # Drop new tables in reverse dependency order                          #
    # ------------------------------------------------------------------ #
    op.drop_table("stock_ledger")
    op.drop_table("agent_commissions")
    op.drop_table("nave_bill_details")
    op.drop_table("nave_bill_items")
    op.drop_table("nave_bills")
    op.drop_table("farmer_payment_records")
    op.drop_table("farmer_sales")
    op.drop_table("farmer_entries")
    op.drop_table("sale_payments")
    op.drop_table("purchase_payments")
    op.drop_table("sale_entries")
    op.drop_table("purchase_entries")
    op.drop_table("kharidars")
    op.drop_table("delivery_places")
    op.drop_table("vehicles")
    op.drop_table("expenses")
    op.drop_table("bank_transactions")
    op.drop_table("cash_entries")
    op.drop_table("companies")
