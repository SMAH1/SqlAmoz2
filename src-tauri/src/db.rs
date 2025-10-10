use std::sync::OnceLock;
use tokio_rusqlite::{Connection};
use rusqlite::types::ValueRef;
use serde_json::{Map, Value};

static DB: OnceLock<Connection> = OnceLock::new();

pub async fn init_db() -> anyhow::Result<()> {
    let conn = Connection::open_in_memory().await?;
    conn.call(|c| {
        c.execute_batch(
            r#"
            PRAGMA foreign_keys = ON;
            CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT);
            INSERT INTO users (name) VALUES ("Alice");
            INSERT INTO users (name) VALUES ("Bob");
            INSERT INTO users (name) VALUES ("Me");
            "#,
        )
        .map_err(Into::into)
    }).await?;
    DB.set(conn).map_err(|_| anyhow::anyhow!("DB already initialized"))?;
    Ok(())
}

fn db() -> &'static Connection {
    DB.get().expect("DB not initialized")
}

// pub async fn add_item(name: String) -> TokioSqlResult<i64> {
//     db().call(move |c| {
//         c.execute("INSERT INTO items(name) VALUES (?)", params![name])?;
//         Ok(c.last_insert_rowid())
//     }).await
// }

pub async fn execute_query(query: String) -> Result<String, String> {
    db().call(move |c| {

        // rows_to_json
        let mut stmt = c.prepare(&query)?;
        let column_names: Vec<String> = stmt
            .column_names()
            .iter()
            .map(|s| s.to_string())
            .collect();
        
        let mut rows = stmt.query([])?;
        let mut out = Vec::new();
        
        while let Some(row) = rows.next()? {
            let mut obj = Map::new();
            for (i, col_name) in column_names.iter().enumerate() {
                let jv = match row.get_ref(i)? {
                    ValueRef::Null => Value::Null,
                    ValueRef::Integer(n) => Value::from(n),
                    ValueRef::Real(f) => Value::from(f),
                    ValueRef::Text(t) => Value::String(String::from_utf8_lossy(t).to_string()),
                    ValueRef::Blob(_) => Value::String("NOT SUPPORT".to_string()),
                };

                obj.insert(col_name.clone(), jv);
            }
            out.push(Value::Object(obj));
        }
        
        Ok(serde_json::to_string_pretty(&out).expect("serialize JSON"))
    }).await
    .map_err(|e| {
        match e {
            tokio_rusqlite::Error::Rusqlite(err) => err.to_string(),
            _ => e.to_string(),
        }
    })
}
