
mod db;

#[tauri::command]
async fn run_query(query: String) -> Result<String, String> {
    crate::db::execute_query(query)
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri::Manager;
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_cli::init())
        .setup(|app| {
            tauri::async_runtime::block_on(crate::db::init_db()).expect("init db");
            
            // Parse CLI arguments from env
            let args: Vec<String> = std::env::args().collect();
            let mut view_param: Option<String> = None;
            
            // Valid view values
            let valid_views = ["select", "where", "orderby", "limit", "from", "query"];
            
            // Simple argument parsing
            for i in 0..args.len() {
                if (args[i] == "--form" || args[i] == "-f") && i + 1 < args.len() {
                    view_param = Some(args[i + 1].clone());
                    break;
                }
            }
            
            // Navigate to appropriate page if view parameter is valid
            if let Some(view) = view_param {
                // Check if the view value is valid
                if valid_views.contains(&view.as_str()) {
                    if let Some(window) = app.get_webview_window("main") {
                        let url = format!("/dbquery?view={}", view);
                        let _ = window.eval(&format!("window.location.href = '{}'", url));
                    }
                }
                // If invalid, do nothing and let default route take over
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![run_query])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
