#!/usr/bin/env python3
"""
Google Colab Integration for AccaBiz ERP System
This script demonstrates how to use Python in Google Colab to interact with Google Sheets
instead of using Apps Script HTTP requests for faster data processing.
"""

# Install required packages (run this in Colab first)
# !pip install gspread oauth2client google-auth google-auth-oauthlib google-auth-httplib2

import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd
from datetime import datetime
import json

# Google Sheets Configuration
SPREADSHEET_ID = "1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw"  # Your spreadsheet ID
SHEET_NAMES = {
    'Product': 'Product',
    'Supplier': 'Supplier',
    'Customer': 'Customer',
    'PurchaseOrder': 'PurchaseOrder',
    'PurchaseInvoice': 'PurchaseInvoice',
    'SalesInvoice': 'SalesInvoice',
    'ExportLC': 'ExportLC'
}

class AccaBizSheetsManager:
    def __init__(self, credentials_path=None):
        """
        Initialize Google Sheets connection

        Args:
            credentials_path: Path to service account JSON file
        """
        self.scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]

        if credentials_path:
            self.creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_path, self.scope)
        else:
            # For Colab: Use google.colab for authentication
            from google.colab import auth
            auth.authenticate_user()
            import gspread
            from google.auth import default
            self.creds, _ = default()

        self.gc = gspread.authorize(self.creds)
        self.spreadsheet = self.gc.open_by_key(SPREADSHEET_ID)

    def get_sheet_data(self, sheet_name):
        """
        Get all data from a sheet as pandas DataFrame

        Args:
            sheet_name: Name of the sheet

        Returns:
            pandas.DataFrame: Sheet data
        """
        try:
            sheet = self.spreadsheet.worksheet(sheet_name)
            data = sheet.get_all_records()
            return pd.DataFrame(data)
        except Exception as e:
            print(f"Error reading {sheet_name}: {e}")
            return pd.DataFrame()

    def update_sheet_data(self, sheet_name, df, start_cell='A1'):
        """
        Update sheet with DataFrame data

        Args:
            sheet_name: Name of the sheet
            df: pandas DataFrame to write
            start_cell: Starting cell (default: A1)
        """
        try:
            sheet = self.spreadsheet.worksheet(sheet_name)
            # Clear existing data
            sheet.clear()
            # Write new data
            sheet.update(start_cell, [df.columns.tolist()] + df.values.tolist())
            print(f"Successfully updated {sheet_name}")
        except Exception as e:
            print(f"Error updating {sheet_name}: {e}")

    def append_row(self, sheet_name, row_data):
        """
        Append a row to a sheet

        Args:
            sheet_name: Name of the sheet
            row_data: List of values to append
        """
        try:
            sheet = self.spreadsheet.worksheet(sheet_name)
            sheet.append_row(row_data)
            print(f"Successfully appended row to {sheet_name}")
        except Exception as e:
            print(f"Error appending to {sheet_name}: {e}")

    def get_products(self):
        """Get all products"""
        return self.get_sheet_data('Product')

    def get_suppliers(self):
        """Get all suppliers"""
        return self.get_sheet_data('Supplier')

    def get_customers(self):
        """Get all customers"""
        return self.get_sheet_data('Customer')

    def get_purchase_orders(self):
        """Get all purchase orders"""
        return self.get_sheet_data('PurchaseOrder')

    def get_purchase_invoices(self):
        """Get all purchase invoices"""
        return self.get_sheet_data('PurchaseInvoice')

    def get_sales_invoices(self):
        """Get all sales invoices"""
        return self.get_sheet_data('SalesInvoice')

    def save_purchase_invoice(self, invoice_data):
        """
        Save purchase invoice data

        Args:
            invoice_data: Dictionary with invoice data
        """
        # Convert to DataFrame for easier manipulation
        df = pd.DataFrame([invoice_data])

        # Get existing data
        existing_df = self.get_purchase_invoices()

        # Append new data
        updated_df = pd.concat([existing_df, df], ignore_index=True)

        # Update sheet
        self.update_sheet_data('PurchaseInvoice', updated_df)

    def save_sales_invoice(self, invoice_data):
        """
        Save sales invoice data

        Args:
            invoice_data: Dictionary with invoice data
        """
        df = pd.DataFrame([invoice_data])
        existing_df = self.get_sales_invoices()
        updated_df = pd.concat([existing_df, df], ignore_index=True)
        self.update_sheet_data('SalesInvoice', updated_df)

    def update_invoice_status(self, invoice_type, invoice_id, new_status):
        """
        Update invoice status

        Args:
            invoice_type: 'PurchaseInvoice' or 'SalesInvoice'
            invoice_id: Invoice ID to update
            new_status: New status value
        """
        df = self.get_sheet_data(invoice_type)
        if 'id' in df.columns:
            df.loc[df['id'] == invoice_id, 'status'] = new_status
            self.update_sheet_data(invoice_type, df)

    def get_dashboard_summary(self):
        """
        Generate dashboard summary data

        Returns:
            dict: Summary statistics
        """
        products = self.get_products()
        suppliers = self.get_suppliers()
        customers = self.get_customers()
        purchase_orders = self.get_purchase_orders()
        purchase_invoices = self.get_purchase_invoices()
        sales_invoices = self.get_sales_invoices()

        summary = {
            'total_products': len(products),
            'total_suppliers': len(suppliers),
            'total_customers': len(customers),
            'total_purchase_orders': len(purchase_orders),
            'total_purchase_invoices': len(purchase_invoices),
            'total_sales_invoices': len(sales_invoices),
            'pending_purchase_orders': len(purchase_orders[purchase_orders.get('status', '').str.lower() == 'pending']) if 'status' in purchase_orders.columns else 0,
            'completed_purchase_invoices': len(purchase_invoices[purchase_invoices.get('status', '').str.lower() == 'completed']) if 'status' in purchase_invoices.columns else 0,
            'total_revenue': sales_invoices.get('total', pd.Series()).sum() if 'total' in sales_invoices.columns else 0,
            'total_costs': purchase_invoices.get('total', pd.Series()).sum() if 'total' in purchase_invoices.columns else 0
        }

        return summary

    def bulk_import_products(self, products_list):
        """
        Bulk import products

        Args:
            products_list: List of product dictionaries
        """
        df = pd.DataFrame(products_list)
        existing_df = self.get_products()
        updated_df = pd.concat([existing_df, df], ignore_index=True)
        self.update_sheet_data('Product', updated_df)

    def export_to_csv(self, sheet_name, filename=None):
        """
        Export sheet data to CSV

        Args:
            sheet_name: Name of the sheet
            filename: Output filename (optional)
        """
        df = self.get_sheet_data(sheet_name)
        if filename is None:
            filename = f"{sheet_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        df.to_csv(filename, index=False)
        print(f"Exported {sheet_name} to {filename}")
        return filename

# Usage Examples for Google Colab
def main():
    """
    Example usage in Google Colab
    """

    # Initialize the manager
    # For Colab: Don't pass credentials_path, it will use Colab auth
    manager = AccaBizSheetsManager()

    # Get dashboard summary
    summary = manager.get_dashboard_summary()
    print("Dashboard Summary:")
    print(json.dumps(summary, indent=2))

    # Get products
    products = manager.get_products()
    print(f"\nTotal Products: {len(products)}")
    print(products.head() if not products.empty else "No products found")

    # Example: Add a new product
    # new_product = {
    #     'id': 'PROD001',
    #     'name': 'New Product',
    #     'description': 'Product description',
    #     'unitPrice': 100.00,
    #     'category': 'Electronics'
    # }
    # manager.append_row('Product', list(new_product.values()))

    # Export data
    # manager.export_to_csv('Product')

    # Bulk operations are much faster with direct API access
    print("\n✅ Google Colab integration ready!")
    print("You can now perform bulk operations, data analysis, and automation")
    print("much faster than HTTP requests to Apps Script!")

if __name__ == "__main__":
    main()