# Install DuckDB CLI if not already installed
# Uncomment the following lines if you need to install DuckDB
# $duckdbUrl = "https://github.com/duckdb/duckdb/releases/download/v0.9.2/duckdb_cli-windows-amd64.zip"
# $duckdbZip = "duckdb_cli.zip"
# $duckdbDir = "duckdb_cli"
# 
# if (-not (Test-Path "duckdb.exe")) {
#     Write-Host "Downloading DuckDB CLI..."
#     Invoke-WebRequest -Uri $duckdbUrl -OutFile $duckdbZip
#     Expand-Archive -Path $duckdbZip -DestinationPath $duckdbDir -Force
#     Copy-Item "$duckdbDir\duckdb.exe" -Destination "."
#     Remove-Item $duckdbZip -Force
#     Remove-Item $duckdbDir -Recurse -Force
# }

# Set script directory as base path
$scriptDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location -Path $scriptDir

# Create a DuckDB database from the SQL file
Write-Host "Creating project structure database..."
duckdb project-structure.db < project-structure.sql

# Run queries to display project structure
Write-Host "`nProject Components and Relationships:"
duckdb project-structure.db "SELECT c.name, c.type, r.relationship_type, c2.name as related_to FROM components c LEFT JOIN relationships r ON c.id = r.source_id LEFT JOIN components c2 ON r.target_id = c2.id ORDER BY c.id, r.id;"

Write-Host "`nFiles by Component:"
duckdb project-structure.db "SELECT c.name as component, f.path, f.file_type, f.description FROM files f JOIN components c ON f.component_id = c.id ORDER BY c.id, f.id;"

Write-Host "`nDone!"
