// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn run_query(query: &str) -> Result<String, String> {
    if query != "error" {
        // resolve
        let mut ret: String = "MY TABEL ".to_owned();
        ret.push_str(query);
        Ok(ret.to_string())
    } else {
        // reject
        Err("MY ERROR".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![run_query])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
