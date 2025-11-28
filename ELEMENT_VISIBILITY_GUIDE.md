# مستندات: کنترل نمایش المنت‌ها از سمت Tauri

## نحوه کار

این سیستم به شما اجازه می‌دهد که از سمت Rust (Tauri backend) المنت‌های خاصی از صفحه Angular را مخفی یا نمایش دهید، بدون اینکه محتوای صفحه Angular تغییر کند.

## ساختار

### 1. Backend (Rust - lib.rs)

دو command اصلی اضافه شده است:

#### `set_element_visibility`
```rust
#[tauri::command]
async fn set_element_visibility(
    app_handle: AppHandle,
    element_id: String,
    visible: bool
) -> Result<(), String>
```

این command از طریق Event System یک event با نام `element-visibility-change` منتشر می‌کند.

**پارامترها:**
- `element_id`: شناسه المنت (مثلاً `"table-programmings"`)
- `visible`: `true` برای نمایش، `false` برای مخفی کردن

#### `test_auto_hide_programmings` (مثال تست)
```rust
#[tauri::command]
async fn test_auto_hide_programmings(app_handle: AppHandle) -> Result<(), String>
```

یک مثال که بعد از 5 ثانیه جدول Programmings را مخفی می‌کند.

### 2. Frontend (Angular)

#### Event Listener
در `ngOnInit`:
```typescript
this.unlistenVisibility = await listen<ElementVisibilityPayload>('element-visibility-change', (event) => {
  const { element_id, visible } = event.payload;
  this.elementVisibility[element_id] = visible;
});
```

#### شناسه‌های المنت‌های قابل کنترل
```typescript
elementVisibility: { [key: string]: boolean } = {
  'table-persons': true,
  'table-courses': true,
  'table-programmings': true,
  'query-builder': true
};
```

## نحوه استفاده

### از سمت Rust

شما می‌تونید در هر جای کد Rust که `AppHandle` دارید، این command را فراخوانی کنید:

```rust
use tauri::Emitter;

// مخفی کردن جدول Programmings
app_handle.emit("element-visibility-change", ElementVisibilityPayload {
    element_id: "table-programmings".to_string(),
    visible: false,
}).unwrap();

// نمایش مجدد جدول Programmings
app_handle.emit("element-visibility-change", ElementVisibilityPayload {
    element_id: "table-programmings".to_string(),
    visible: true,
}).unwrap();
```

### از سمت Angular (برای تست)

دو متد تست اضافه شده است:

```typescript
// تغییر وضعیت نمایش (toggle)
await this.testToggleTableVisibility('Programmings');

// تست auto-hide از سمت Rust
await this.testAutoHideFromRust();
```

## مثال‌های کاربردی

### مثال 1: مخفی کردن جدول بر اساس شرط
```rust
// در کد Rust خود
async fn check_permission(app_handle: AppHandle, user_role: String) {
    if user_role != "admin" {
        // کاربران غیر admin نمی‌تونن جدول Programmings رو ببینن
        app_handle.emit("element-visibility-change", ElementVisibilityPayload {
            element_id: "table-programmings".to_string(),
            visible: false,
        }).unwrap();
    }
}
```

### مثال 2: مخفی کردن موقت در حین پردازش
```rust
#[tauri::command]
async fn heavy_operation(app_handle: AppHandle) -> Result<(), String> {
    // مخفی کردن جدول در حین پردازش
    app_handle.emit("element-visibility-change", ElementVisibilityPayload {
        element_id: "table-programmings".to_string(),
        visible: false,
    }).map_err(|e| e.to_string())?;
    
    // انجام عملیات سنگین
    // ...
    
    // نمایش مجدد جدول
    app_handle.emit("element-visibility-change", ElementVisibilityPayload {
        element_id: "table-programmings".to_string(),
        visible: true,
    }).map_err(|e| e.to_string())?;
    
    Ok(())
}
```

### مثال 3: کنترل چندین المنت
```rust
fn hide_all_tables(app_handle: &AppHandle) {
    let tables = vec!["table-persons", "table-courses", "table-programmings"];
    
    for table in tables {
        let _ = app_handle.emit("element-visibility-change", ElementVisibilityPayload {
            element_id: table.to_string(),
            visible: false,
        });
    }
}
```

## تست برنامه

برای تست، دو دکمه در نوار ابزار اضافه شده است:

1. **Toggle Programmings**: مخفی/نمایش کردن جدول Programmings
2. **Auto-hide (Rust)**: تست مخفی شدن خودکار بعد از 5 ثانیه از سمت Rust

## افزودن المنت جدید

برای اضافه کردن المنت جدید قابل کنترل:

1. در `db-query.component.ts`:
```typescript
elementVisibility: { [key: string]: boolean } = {
  // المنت‌های موجود...
  'your-new-element': true,  // اضافه کردن المنت جدید
};
```

2. در HTML template، شرط را اضافه کنید:
```html
<div *ngIf="elementVisibility['your-new-element']">
  <!-- محتوای المنت -->
</div>
```

3. از سمت Rust:
```rust
app_handle.emit("element-visibility-change", ElementVisibilityPayload {
    element_id: "your-new-element".to_string(),
    visible: false,
}).unwrap();
```

## نکات مهم

1. ✅ تغییرات فقط روی نمایش المنت تأثیر می‌گذارد، نه روی داده‌ها
2. ✅ می‌توانید هر تعداد المنت که بخواهید کنترل کنید
3. ✅ Event listener به صورت خودکار در `ngOnDestroy` پاک می‌شود
4. ✅ تمام المنت‌ها به صورت پیش‌فرض visible هستند
5. ✅ می‌توانید همزمان چندین المنت را کنترل کنید

## ساختار Event

```typescript
interface ElementVisibilityPayload {
  element_id: string;  // شناسه المنت
  visible: boolean;    // وضعیت نمایش
}
```

Event Name: `"element-visibility-change"`
