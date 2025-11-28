
mod db;

use tauri::{AppHandle, Emitter};

#[tauri::command]
async fn run_query(query: String) -> Result<String, String> {
    crate::db::execute_query(query)
        .await
        .map_err(|e| e.to_string())
}

#[derive(Clone, serde::Serialize)]
struct ElementVisibilityPayload {
    element_id: String,
    visible: bool,
}

// Command to control element visibility from Rust
#[tauri::command]
async fn set_element_visibility(
    app_handle: AppHandle,
    element_id: String,
    visible: bool
) -> Result<(), String> {
    app_handle
        .emit("element-visibility-change", ElementVisibilityPayload {
            element_id,
            visible,
        })
        .map_err(|e| e.to_string())
}

// Example: A command that automatically hides Programmings table after 5 seconds
#[tauri::command]
async fn test_auto_hide_programmings(app_handle: AppHandle) -> Result<(), String> {
    // Clone app_handle for the async task
    let handle = app_handle.clone();
    
    tauri::async_runtime::spawn(async move {
        // Wait 5 seconds
        std::thread::sleep(std::time::Duration::from_secs(5));
        
        // Hide the Programmings table
        let _ = handle.emit("element-visibility-change", ElementVisibilityPayload {
            element_id: "table-programmings".to_string(),
            visible: false,
        });
        
        println!("Programmings table hidden after 5 seconds!");
    });
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            tauri::async_runtime::block_on(crate::db::init_db()).expect("init db");
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            run_query, 
            set_element_visibility,
            test_auto_hide_programmings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
