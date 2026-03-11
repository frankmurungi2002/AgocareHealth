# ============================================
# AGROCARE DATABASE SETUP SCRIPT (WINDOWS)
# ============================================
# This script sets up both PostgreSQL and MongoDB databases
# Run with: powershell -ExecutionPolicy Bypass -File setup-databases.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "AGROCARE DATABASE SETUP" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# CHECK PREREQUISITES
# ============================================

Write-Host "[1/4] Checking prerequisites..." -ForegroundColor Yellow

# Check PostgreSQL
$pgExists = $false
try {
    $psql = & where.exe psql 2>$null
    if ($psql) {
        $pgExists = $true
        Write-Host "✓ PostgreSQL found" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ PostgreSQL not found" -ForegroundColor Red
}

# Check MongoDB
$mongoExists = $false
try {
    $mongosh = & where.exe mongosh 2>$null
    if ($mongosh) {
        $mongoExists = $true
        Write-Host "✓ MongoDB found" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ MongoDB not found" -ForegroundColor Red
}

if (-not $pgExists -and -not $mongoExists) {
    Write-Host ""
    Write-Host "ERROR: Neither PostgreSQL nor MongoDB found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "  2. MongoDB: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================
# SETUP POSTGRESQL DATABASE
# ============================================

if ($pgExists) {
    Write-Host "[2/4] Setting up PostgreSQL database..." -ForegroundColor Yellow
    
    Write-Host "  Enter PostgreSQL username (default: postgres): " -NoNewline
    $pgUser = Read-Host
    if ([string]::IsNullOrWhiteSpace($pgUser)) { $pgUser = "postgres" }
    
    Write-Host "  Enter PostgreSQL password: " -NoNewline
    $pgPass = Read-Host -AsSecureString
    $pgPassPlain = [System.Net.NetworkCredential]::new('', $pgPass).Password
    
    Write-Host "  Enter PostgreSQL host (default: localhost): " -NoNewline
    $pgHost = Read-Host
    if ([string]::IsNullOrWhiteSpace($pgHost)) { $pgHost = "localhost" }
    
    Write-Host "  Enter PostgreSQL port (default: 5432): " -NoNewline
    $pgPort = Read-Host
    if ([string]::IsNullOrWhiteSpace($pgPort)) { $pgPort = "5432" }
    
    # Create database
    Write-Host "  Creating database agrocare_db..." -ForegroundColor Cyan
    try {
        $env:PGPASSWORD = $pgPassPlain
        & psql -h $pgHost -U $pgUser -p $pgPort -c "CREATE DATABASE agrocare_db;" 2>$null
        
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
            Write-Host "  ✓ Database created/verified" -ForegroundColor Green
        }
        
        # Execute SQL initialization script
        Write-Host "  Running initialization script..." -ForegroundColor Cyan
        $sqlFile = Split-Path $PSCommandPath | Join-Path -ChildPath "init-postgresql.sql"
        if (Test-Path $sqlFile) {
            & psql -h $pgHost -U $pgUser -p $pgPort -d agrocare_db -f $sqlFile 2>$null
            Write-Host "  ✓ Tables and indexes created" -ForegroundColor Green
        } else {
            Write-Host "  ✗ init-postgresql.sql not found" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Error setting up PostgreSQL: $_" -ForegroundColor Red
    }
    
    Write-Host ""
} else {
    Write-Host "[2/4] PostgreSQL not available - Skipping" -ForegroundColor Gray
    Write-Host ""
}

# ============================================
# SETUP MONGODB DATABASE
# ============================================

if ($mongoExists) {
    Write-Host "[3/4] Setting up MongoDB database..." -ForegroundColor Yellow
    
    Write-Host "  Enter MongoDB host (default: localhost): " -NoNewline
    $mongoHost = Read-Host
    if ([string]::IsNullOrWhiteSpace($mongoHost)) { $mongoHost = "localhost" }
    
    Write-Host "  Enter MongoDB port (default: 27017): " -NoNewline
    $mongoPort = Read-Host
    if ([string]::IsNullOrWhiteSpace($mongoPort)) { $mongoPort = "27017" }
    
    Write-Host "  Creating MongoDB database and collections..." -ForegroundColor Cyan
    try {
        $jsFile = Split-Path $PSCommandPath | Join-Path -ChildPath "init-mongodb.js"
        if (Test-Path $jsFile) {
            & mongosh --host $mongoHost --port $mongoPort < $jsFile 2>$null
            Write-Host "  ✓ MongoDB collections and indexes created" -ForegroundColor Green
        } else {
            Write-Host "  ✗ init-mongodb.js not found" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Error setting up MongoDB: $_" -ForegroundColor Red
    }
    
    Write-Host ""
} else {
    Write-Host "[3/4] MongoDB not available - Skipping" -ForegroundColor Gray
    Write-Host ""
}

# ============================================
# UPDATE APPLICATION.PROPERTIES
# ============================================

Write-Host "[4/4] Updating application configuration..." -ForegroundColor Yellow

$propsFile = Split-Path $PSCommandPath | Split-Path | Join-Path -ChildPath "backend\src\main\resources\application.properties"

if (Test-Path $propsFile) {
    Write-Host "  Found application.properties at: $propsFile" -ForegroundColor Cyan
    Write-Host "  You may need to update the following settings if different:" -ForegroundColor Yellow
    Write-Host "    - spring.datasource.url" -ForegroundColor Gray
    Write-Host "    - spring.datasource.username" -ForegroundColor Gray
    Write-Host "    - spring.datasource.password" -ForegroundColor Gray
    Write-Host "    - spring.data.mongodb.uri" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  application.properties not found" -ForegroundColor Red
}

# ============================================
# COMPLETION
# ============================================

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "DATABASE SETUP COMPLETE!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Verify PostgreSQL database is running" -ForegroundColor White
Write-Host "  2. Verify MongoDB database is running" -ForegroundColor White
Write-Host "  3. Navigate to backend directory: cd backend" -ForegroundColor White
Write-Host "  4. Run: mvn spring-boot:run" -ForegroundColor White
Write-Host "  5. Test: curl http://localhost:8080/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Yellow
Write-Host "  Username: patient_francis" -ForegroundColor White
Write-Host "  Password: (same as entered above)" -ForegroundColor White
Write-Host ""
