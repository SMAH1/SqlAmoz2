use std::sync::OnceLock;
use tokio_rusqlite::{Connection};
use rusqlite::types::ValueRef;
use serde_json::{Map, Value, json};
use rand::SeedableRng;
use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use rand::Rng;

static DB: OnceLock<Connection> = OnceLock::new();

const PERSON_NAMES: &[&str] = &["Ali", "Mohammad", "Hassan", "Mahdi", "Sajjad", "Sadegh"];
const COURSE_NAMES: &[&str] = &["Programming", "Math", "Physic", "Chemistry", "Sport"];
const PROGRAMMING_LANGUAGES: &[&str] = &["Python", "Javascript", "C#", "Java", "C"];
const GRADE_STRINGS: &[&str] = &["High", "Normal", "Low"];
const SCORES: &[f64] = &[10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 13.5, 14.0, 14.5, 15.0, 15.5, 16.0, 16.5, 17.0, 17.5, 18.0, 18.5, 19.0, 19.5, 20.0];

pub async fn init_db() -> anyhow::Result<()> {
    let conn = Connection::open_in_memory().await?;
    
    conn.call(|c| {
        c.execute_batch(
            r#"
            PRAGMA foreign_keys = ON;
            CREATE TABLE Persons(Id INTEGER PRIMARY KEY, Name TEXT, Age INTEGER, Grade INTEGER, [Score Quran] REAL);
            CREATE TABLE Courses(Id INTEGER PRIMARY KEY, PersonId INTEGER, Name TEXT, Score REAL);
            CREATE TABLE Programmings(Id INTEGER PRIMARY KEY, PersonId INTEGER, Language TEXT, Grade TEXT);
            "#,
        )?;
        Ok(())
    }).await?;
    
    // Generate random data with fixed seed for reproducibility
    let mut rng = StdRng::seed_from_u64(42);
    
    // Insert 100 Persons
    let person_data: Vec<(i32, &str, i32, i32, f64)> = (1..=100)
        .map(|id| {
            let name = *PERSON_NAMES.choose(&mut rng).unwrap();
            let age = 18 + (rng.gen_range(0..20) as i32);
            let grade = rng.gen_range(1..4) as i32;
            let score_quran = *SCORES.choose(&mut rng).unwrap();
            (id, name, age, grade, score_quran)
        })
        .collect();
    
    conn.call(move |c| {
        for (id, name, age, grade, score_quran) in person_data {
            c.execute(
                "INSERT INTO Persons (Id, Name, Age, Grade, [Score Quran]) VALUES (?, ?, ?, ?, ?)",
                rusqlite::params![id, name, age, grade, score_quran],
            )?;
        }
        Ok(())
    }).await?;
    
    // Insert 200 Courses (linked to persons)
    let course_data: Vec<(i32, i32, &str, f64)> = (1..=200)
        .map(|id| {
            let person_id = (id % 100) + 1;
            let course_name = *COURSE_NAMES.choose(&mut rng).unwrap();
            let score = *SCORES.choose(&mut rng).unwrap();
            (id, person_id, course_name, score)
        })
        .collect();
    
    conn.call(move |c| {
        for (id, person_id, course_name, score) in course_data {
            c.execute(
                "INSERT INTO Courses (Id, PersonId, Name, Score) VALUES (?, ?, ?, ?)",
                rusqlite::params![id, person_id, course_name, score],
            )?;
        }
        Ok(())
    }).await?;
    
    // Insert 300 Programmings (linked to persons)
    let programming_data: Vec<(i32, i32, &str, &str)> = (1..=300)
        .map(|id| {
            let person_id = (id % 100) + 1;
            let language = *PROGRAMMING_LANGUAGES.choose(&mut rng).unwrap();
            let grade = *GRADE_STRINGS.choose(&mut rng).unwrap();
            (id, person_id, language, grade)
        })
        .collect();
    
    conn.call(move |c| {
        for (id, person_id, language, grade) in programming_data {
            c.execute(
                "INSERT INTO Programmings (Id, PersonId, Language, Grade) VALUES (?, ?, ?, ?)",
                rusqlite::params![id, person_id, language, grade],
            )?;
        }
        Ok(())
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
        let mut stmt = c.prepare(&query)?;
        
        // Get column names in order
        let column_names: Vec<String> = stmt
            .column_names()
            .iter()
            .map(|s| s.to_string())
            .collect();
        
        let mut rows = stmt.query([])?;
        let mut data = Vec::new();
        
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
            data.push(Value::Object(obj));
        }
        
        // Return structure with columns and data to preserve order
        let result = json!({
            "columns": column_names,
            "data": data
        });
        
        Ok(serde_json::to_string_pretty(&result).expect("serialize JSON"))
    }).await
    .map_err(|e| {
        match e {
            tokio_rusqlite::Error::Rusqlite(err) => err.to_string(),
            _ => e.to_string(),
        }
    })
}
