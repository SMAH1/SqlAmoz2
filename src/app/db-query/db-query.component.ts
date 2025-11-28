import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

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

interface ElementVisibilityPayload {
  element_id: string;
  visible: boolean;
}

@Component({
  selector: 'app-db-query',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './db-query.component.html',
  styleUrl: './db-query.component.css'
})
export class DbQueryComponent implements OnInit, OnDestroy {
  // Theme
  isDarkMode = false;
  
  // Navbar
  isNavbarActive = false;
  
  // Tables state
  tables: TableData[] = [];
  isLoadingTables = false;
  tablesError: string | null = null;
  maximizedTableIndex: number | null = null;
  selectedTableIndices: Set<number> = new Set();
  
  // Element visibility control from Tauri
  elementVisibility: { [key: string]: boolean } = {
    'table-persons': true,
    'table-courses': true,
    'table-programmings': true,
    'query-builder': true
  };
  
  private unlistenVisibility?: UnlistenFn;

  // Query builder
  queryParams: QueryParam[] = [
    { label: 'SELECT', value: '*', placeholder: 'Select columns' },
    { label: 'FROM', value: '', placeholder: 'Which tables' },
    { label: 'WHERE', value: '', placeholder: 'Select row' },
    { label: 'ORDER BY', value: '', placeholder: 'Order or rows' },
    { label: 'LIMIT', value: '', placeholder: 'Limitation on rows of result' }
  ];

  // Query results
  queryResult: QueryResult = { columns: [], data: [] };
  isLoadingQuery = false;
  queryError: string | null = null;
  isQueryResultMaximized = false;

  async ngOnInit() {
    this.loadTablesData();
    
    // Listen for element visibility changes from Tauri
    this.unlistenVisibility = await listen<ElementVisibilityPayload>('element-visibility-change', (event) => {
      const { element_id, visible } = event.payload;
      this.elementVisibility[element_id] = visible;
      console.log(`Element ${element_id} visibility changed to ${visible}`);
    });
  }
  
  ngOnDestroy() {
    // Clean up event listener
    if (this.unlistenVisibility) {
      this.unlistenVisibility();
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleNavbar() {
    this.isNavbarActive = !this.isNavbarActive;
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
  
  getTableVisibility(tableName: string): boolean {
    const key = `table-${tableName.toLowerCase()}`;
    return this.elementVisibility[key] !== undefined ? this.elementVisibility[key] : true;
  }
  
  // Test method to toggle visibility from Angular side
  async testToggleTableVisibility(tableName: string) {
    const key = `table-${tableName.toLowerCase()}`;
    const newVisibility = !this.elementVisibility[key];
    
    try {
      await invoke('set_element_visibility', {
        elementId: key,
        visible: newVisibility
      });
      console.log(`Toggled ${tableName} visibility to ${newVisibility}`);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  }
  
  // Test auto-hide from Rust side
  async testAutoHideFromRust() {
    try {
      await invoke('test_auto_hide_programmings');
      console.log('Auto-hide command sent to Rust. Programmings table will be hidden in 5 seconds.');
    } catch (error) {
      console.error('Failed to call auto-hide:', error);
    }
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
      // Fetch data from three tables via Tauri
      const personsResult = await invoke<string>('run_query', { query: 'SELECT Id, Name, Age, Grade, [Score Quran] FROM Persons' });
      const coursesResult = await invoke<string>('run_query', { query: 'SELECT Id, PersonId, Name, Score FROM Courses' });
      const programmingsResult = await invoke<string>('run_query', { query: 'SELECT Id, PersonId, Language, Grade FROM Programmings' });

      // Parse JSON results
      const personsResult_data = JSON.parse(personsResult);
      const coursesResult_data = JSON.parse(coursesResult);
      const programmingsResult_data = JSON.parse(programmingsResult);

      this.tables = [
        {
          name: 'Persons',
          columns: personsResult_data.columns,
          data: personsResult_data.data
        },
        {
          name: 'Courses',
          columns: coursesResult_data.columns,
          data: coursesResult_data.data
        },
        {
          name: 'Programmings',
          columns: programmingsResult_data.columns,
          data: programmingsResult_data.data
        }
      ];

    } catch (error) {
      this.tablesError = `Failed to load tables data: ${error}`;
      console.error(error);
    } finally {
      this.isLoadingTables = false;
    }
  }

  // Execute query via Tauri
  async executeQuery() {
    if (!this.queryParams[1].value) {
      this.queryError = 'Please specify a table name in the FROM clause';
      return;
    }

    this.isLoadingQuery = true;
    this.queryError = null;

    try {
      // Execute the generated SQL query via Tauri
      const result = await invoke<string>('run_query', { query: this.generatedSQL });
      const parsedResult = JSON.parse(result);

      this.queryResult = {
        columns: parsedResult.columns,
        data: parsedResult.data
      };

    } catch (error) {
      this.queryError = `Failed to execute query: ${error}`;
      console.error(error);
    } finally {
      this.isLoadingQuery = false;
    }
  }
}
