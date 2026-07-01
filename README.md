# 🗄️ SqlAmoz2

A simple and intuitive desktop application for executing SQL commands step-by-step and viewing results in real-time.

## ✨ Features

- 🚀 **Execute SQL Commands**: Write and run SQL statements interactively
- 📊 **View Results**: Display query results in a user-friendly interface
- 🔄 **Step-by-Step Execution**: Execute commands one at a time and see instant results
- 💾 **Database Support**: Work with embeded SQLite
- 🎨 **Modern UI**: Built with Angular for a smooth user experience
- 🖥️ **Desktop Application**: Developed with Tauri for lightweight and efficient performance

## 🌍 Supported Operating Systems

- ✅ **Windows** (10 and later)
- ✅ **macOS** (10.13 and later)
- ✅ **Linux** (Ubuntu, Fedora, Debian, and others)

## 📋 Requirements

### For Development:
- **Node.js** (version 20+)
- **pnpm** (for package management)
- **Rust** (for Tauri backend)

## 🚀 Quick Start

### Downlaod

Download latest build from [Release Assets](https://github.com/SMAH1/SqlAmoz2/releases)

### Build

#### 1. Install Dependencies

```bash
cd SqlAmoz2
pnpm install
```

#### 2. Run in Development Mode

```bash
# Launch the Tauri application
pnpm tauri dev
```

#### 3. Build Release Version

```bash
pnpm tauri build
```

The final executable files will be located in `src-tauri/target/release/`.

## 📁 Project Structure

```
SqlAmoz2/
├── src/                          # Angular code (UI)
│   ├── app/
│   │   ├── app.component.*      # Main component
│   │   ├── app.routes.ts        # Application routes
│   │   ├── app.config.ts        # App configuration
│   │   └── db-query/            # Query execution component
│   ├── assets/                  # Static resources
│   ├── index.html               # Main HTML page
│   ├── main.ts                  # Entry point
│   └── styles.css               # Global styles
├── src-tauri/                   # Rust code (Backend & Desktop)
│   ├── src/
│   │   ├── main.rs              # Tauri entry point
│   │   ├── lib.rs               # Main library
│   │   └── db.rs                # Database logic
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
├── package.json                 # Node.js dependencies
├── angular.json                 # Angular configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 💡 Usage

### Writing SQL Commands

1. Open the application
2. Enter your SQL command in the "DB Query" section
3. Click the "Execute" button
4. View results in the table below

## 🔧 Development Commands

```bash
# Run in development mode (watch mode)
pnpm tauri dev

# Build release version
pnpm tauri build

# Build optimized release
pnpm tauri build --release

# Lint TypeScript code
pnpm ng lint

# Run unit tests (if configured)
pnpm test
```

## 🛠️ Technologies Used

### Frontend
- **Angular** 19+ - Modern single-page application framework
- **TypeScript** - Typed programming language
- **CSS** - Styling and layout

### Backend
- **Rust** - Fast and safe systems programming language
- **Tauri** - Lightweight desktop application framework
- **SQLite** - Relational database engine

### Development Tools
- **pnpm** - Fast and efficient package manager
- **Angular CLI** - Angular command-line interface
- **Cargo** - Rust package manager

## 📦 Building Release Versions

To build executable versions for all platforms:

```bash
pnpm tauri build --release
```

Generated executable files:
- **Windows**: `src-tauri/target/release/sqlamoz.exe`
- **macOS**: `src-tauri/target/release/sqlamoz.app`
- **Linux**: `src-tauri/target/release/sqlamoz`

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Bug Reports 🐛

If you encounter any issues, please open a new issue in this repository.

## 🔍 Troubleshooting Guide

### Application won't start

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm tauri dev
```

### Build errors

```bash
# Update Rust
rustup update

# Clean and rebuild
cargo clean
pnpm tauri build
```

## 📄 License

This project is licensed under the MIT License.
