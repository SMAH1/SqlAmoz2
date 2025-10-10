import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TableData {
  name: string;
  columns: string[];
  data: any[];
}

interface QueryParam {
  label: string;
  value: string;
  placeholder: string;
}

interface QueryResult {
  columns: string[];
  data: any[];
}

@Component({
  selector: 'app-db-query',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './db-query.component.html',
  styleUrl: './db-query.component.css'
})
export class DbQueryComponent implements OnInit {
  // Theme
  isDarkMode = false;
  
  // Tables state
  tables: TableData[] = [];
  isLoadingTables = false;
  tablesError: string | null = null;
  maximizedTableIndex: number | null = null;
  selectedTableIndices: Set<number> = new Set();

  // Query builder
  queryParams: QueryParam[] = [
    { label: 'SELECT', value: '*', placeholder: 'e.g., id, name, email' },
    { label: 'FROM', value: '', placeholder: 'e.g., users' },
    { label: 'WHERE', value: '', placeholder: 'e.g., age > 18' },
    { label: 'ORDER BY', value: '', placeholder: 'e.g., created_at DESC' },
    { label: 'LIMIT', value: '', placeholder: 'e.g., 100' }
  ];

  // Query results
  queryResult: QueryResult = { columns: [], data: [] };
  isLoadingQuery = false;
  queryError: string | null = null;
  isQueryResultMaximized = false;

  ngOnInit() {
    this.loadTablesData();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }
  toggleTableMaximize(index: number) {
    if (this.maximizedTableIndex === index) {
      this.maximizedTableIndex = null;
      this.selectedTableIndices.clear();
    } else {
      this.maximizedTableIndex = index;
      this.selectedTableIndices.clear();
      this.selectedTableIndices.add(index);
    }
  }

  toggleTableSelection(index: number) {
    if (this.maximizedTableIndex === null) return;
    
    if (this.selectedTableIndices.has(index)) {
      if (index === this.maximizedTableIndex) return;
      this.selectedTableIndices.delete(index);
    } else {
      this.selectedTableIndices.add(index);
    }
  }

  isTableSelected(index: number): boolean {
    return this.selectedTableIndices.has(index);
  }

  get isAnyTableMaximized(): boolean {
    return this.maximizedTableIndex !== null;
  }

  toggleQueryResultMaximize() {
    this.isQueryResultMaximized = !this.isQueryResultMaximized;
  }

  get generatedSQL(): string {
    let sql = '';
    const selectPart = this.queryParams[0].value || '*';
    const fromPart = this.queryParams[1].value;
    
    if (!fromPart) {
      return '-- Please specify FROM clause';
    }

    sql = `SELECT ${selectPart}\nFROM ${fromPart}`;

    if (this.queryParams[2].value) {
      sql += `\nWHERE ${this.queryParams[2].value}`;
    }

    if (this.queryParams[3].value) {
      sql += `\nORDER BY ${this.queryParams[3].value}`;
    }

    if (this.queryParams[4].value) {
      sql += `\nLIMIT ${this.queryParams[4].value}`;
    }

    return sql + ';';
  }

  // Mock data loading function - replace this with your actual data fetching logic
  async loadTablesData() {
    this.isLoadingTables = true;
    this.tablesError = null;

    try {
      // Simulate API call with 500ms delay
      await this.delay(500);

      // Mock data for three tables
      this.tables = [
        {
          name: 'Users',
          columns: ['ID', 'Name', 'Email', 'Age'],
          data: [
            { ID: 1, Name: 'John Doe', Email: 'john@example.com', Age: 28 },
            { ID: 2, Name: 'Jane Smith', Email: 'jane@example.com', Age: 34 },
            { ID: 3, Name: 'Bob Johnson', Email: 'bob@example.com', Age: 45 },
            { ID: 4, Name: 'Alice Brown', Email: 'alice@example.com', Age: 23 },
            { ID: 5, Name: 'Charlie Wilson', Email: 'charlie@example.com', Age: 31 }
          ]
        },
        {
          name: 'Products',
          columns: ['Product_ID', 'Product_Name', 'Price', 'Stock'],
          data: [
            { Product_ID: 101, Product_Name: 'Laptop', Price: 999.99, Stock: 15 },
            { Product_ID: 102, Product_Name: 'Mouse', Price: 29.99, Stock: 150 },
            { Product_ID: 103, Product_Name: 'Keyboard', Price: 79.99, Stock: 87 },
            { Product_ID: 104, Product_Name: 'Monitor', Price: 299.99, Stock: 42 },
            { Product_ID: 105, Product_Name: 'Headphones', Price: 149.99, Stock: 63 }
          ]
        },
        {
          name: 'Orders',
          columns: ['Order_ID', 'Customer_ID', 'Order_Date', 'Total_Amount'],
          data: [
            { Order_ID: 1001, Customer_ID: 1, Order_Date: '2025-10-01', Total_Amount: 1299.98 },
            { Order_ID: 1002, Customer_ID: 2, Order_Date: '2025-10-03', Total_Amount: 449.97 },
            { Order_ID: 1003, Customer_ID: 3, Order_Date: '2025-10-05', Total_Amount: 999.99 },
            { Order_ID: 1004, Customer_ID: 1, Order_Date: '2025-10-08', Total_Amount: 79.99 },
            { Order_ID: 1005, Customer_ID: 4, Order_Date: '2025-10-10', Total_Amount: 179.98 }
          ]
        }
      ];

    } catch (error) {
      this.tablesError = 'Failed to load tables data. Please try again.';
      console.error(error);
    } finally {
      this.isLoadingTables = false;
    }
  }

  // Mock query execution - replace this with your actual query logic
  async executeQuery() {
    if (!this.queryParams[1].value) {
      this.queryError = 'Please specify a table name in the FROM clause';
      return;
    }

    this.isLoadingQuery = true;
    this.queryError = null;

    try {
      // Simulate API call with 500ms delay
      await this.delay(500);

      // Mock query results - this should be replaced with actual query execution
      // For demonstration, we'll return data from the selected table
      const tableName = this.queryParams[1].value.toLowerCase();
      let mockData: any[] = [];
      let columns: string[] = [];

      if (tableName.includes('user')) {
        columns = ['ID', 'Name', 'Email', 'Age', 'Created_At'];
        mockData = [
          { ID: 1, Name: 'John Doe', Email: 'john@example.com', Age: 28, Created_At: '2025-01-15' },
          { ID: 2, Name: 'Jane Smith', Email: 'jane@example.com', Age: 34, Created_At: '2025-02-20' },
          { ID: 3, Name: 'Bob Johnson', Email: 'bob@example.com', Age: 45, Created_At: '2025-03-10' },
          { ID: 4, Name: 'Alice Brown', Email: 'alice@example.com', Age: 23, Created_At: '2025-04-05' },
          { ID: 5, Name: 'Charlie Wilson', Email: 'charlie@example.com', Age: 31, Created_At: '2025-05-12' }
        ];
      } else if (tableName.includes('product')) {
        columns = ['Product_ID', 'Product_Name', 'Category', 'Price', 'Stock'];
        mockData = [
          { Product_ID: 101, Product_Name: 'Laptop', Category: 'Electronics', Price: 999.99, Stock: 15 },
          { Product_ID: 102, Product_Name: 'Mouse', Category: 'Accessories', Price: 29.99, Stock: 150 },
          { Product_ID: 103, Product_Name: 'Keyboard', Category: 'Accessories', Price: 79.99, Stock: 87 }
        ];
      } else if (tableName.includes('order')) {
        columns = ['Order_ID', 'Customer_ID', 'Order_Date', 'Total_Amount', 'Status'];
        mockData = [
          { Order_ID: 1001, Customer_ID: 1, Order_Date: '2025-10-01', Total_Amount: 1299.98, Status: 'Delivered' },
          { Order_ID: 1002, Customer_ID: 2, Order_Date: '2025-10-03', Total_Amount: 449.97, Status: 'Processing' },
          { Order_ID: 1003, Customer_ID: 3, Order_Date: '2025-10-05', Total_Amount: 999.99, Status: 'Shipped' }
        ];
      } else {
        columns = ['Column_1', 'Column_2', 'Column_3'];
        mockData = [
          { Column_1: 'Value 1', Column_2: 'Value 2', Column_3: 'Value 3' },
          { Column_1: 'Value 4', Column_2: 'Value 5', Column_3: 'Value 6' }
        ];
      }

      this.queryResult = {
        columns: columns,
        data: mockData
      };

    } catch (error) {
      this.queryError = 'Failed to execute query. Please check your SQL syntax.';
      console.error(error);
    } finally {
      this.isLoadingQuery = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
