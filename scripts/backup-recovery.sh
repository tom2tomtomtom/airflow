#!/usr/bin/env bash

# =============================================================================
# AIRWAVE Production Backup & Recovery System
# =============================================================================
# Comprehensive backup solution for database, files, and configurations
# Supports both automated and manual backup/recovery operations

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
LOG_FILE="$BACKUP_DIR/backup.log"
MAX_BACKUPS="${MAX_BACKUPS:-30}"
RETENTION_DAYS="${RETENTION_DAYS:-90}"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env.production" ]; then
    source "$PROJECT_ROOT/.env.production"
elif [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${GREEN}[$timestamp] INFO: $message${NC}" ;;
        "WARN")  echo -e "${YELLOW}[$timestamp] WARN: $message${NC}" ;;
        "ERROR") echo -e "${RED}[$timestamp] ERROR: $message${NC}" ;;
        "DEBUG") echo -e "${BLUE}[$timestamp] DEBUG: $message${NC}" ;;
    esac
    
    echo "[$timestamp] $level: $message" >> "$LOG_FILE"
}

# Ensure backup directory exists
setup_backup_environment() {
    mkdir -p "$BACKUP_DIR"/{database,files,config,temp}
    touch "$LOG_FILE"
    
    log "INFO" "Backup environment initialized at $BACKUP_DIR"
}

# Database backup using Supabase CLI or pg_dump
backup_database() {
    local backup_name="db_$(date +%Y%m%d_%H%M%S)"
    local backup_file="$BACKUP_DIR/database/${backup_name}.sql"
    local backup_file_compressed="${backup_file}.gz"
    
    log "INFO" "Starting database backup: $backup_name"
    
    if command -v supabase &> /dev/null && [ -n "${SUPABASE_PROJECT_ID:-}" ]; then
        # Use Supabase CLI if available
        log "INFO" "Using Supabase CLI for database backup"
        
        if supabase db dump --project-id "$SUPABASE_PROJECT_ID" > "$backup_file"; then
            gzip "$backup_file"
            log "INFO" "Database backup completed: $backup_file_compressed"
            echo "$backup_file_compressed"
        else
            log "ERROR" "Supabase database backup failed"
            return 1
        fi
        
    elif [ -n "${DATABASE_URL:-}" ]; then
        # Use pg_dump with connection string
        log "INFO" "Using pg_dump for database backup"
        
        if pg_dump "$DATABASE_URL" \
            --no-owner \
            --no-privileges \
            --verbose \
            --file="$backup_file" 2>> "$LOG_FILE"; then
            
            gzip "$backup_file"
            log "INFO" "Database backup completed: $backup_file_compressed"
            echo "$backup_file_compressed"
        else
            log "ERROR" "pg_dump database backup failed"
            return 1
        fi
    else
        log "ERROR" "No database connection configured. Set SUPABASE_PROJECT_ID or DATABASE_URL"
        return 1
    fi
}

# File system backup (uploads, assets, etc.)
backup_files() {
    local backup_name="files_$(date +%Y%m%d_%H%M%S)"
    local backup_file="$BACKUP_DIR/files/${backup_name}.tar.gz"
    
    log "INFO" "Starting file system backup: $backup_name"
    
    # Define directories to backup
    local backup_dirs=()
    [ -d "$PROJECT_ROOT/uploads" ] && backup_dirs+=("uploads")
    [ -d "$PROJECT_ROOT/assets" ] && backup_dirs+=("assets")
    [ -d "$PROJECT_ROOT/public/uploads" ] && backup_dirs+=("public/uploads")
    [ -d "$PROJECT_ROOT/.next" ] && backup_dirs+=(".next")
    
    if [ ${#backup_dirs[@]} -eq 0 ]; then
        log "WARN" "No file directories found to backup"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    if tar -czf "$backup_file" \
        --exclude="*.tmp" \
        --exclude="*.log" \
        --exclude="node_modules" \
        "${backup_dirs[@]}" 2>> "$LOG_FILE"; then
        
        log "INFO" "File backup completed: $backup_file"
        echo "$backup_file"
    else
        log "ERROR" "File backup failed"
        return 1
    fi
}

# Configuration backup
backup_config() {
    local backup_name="config_$(date +%Y%m%d_%H%M%S)"
    local backup_file="$BACKUP_DIR/config/${backup_name}.tar.gz"
    
    log "INFO" "Starting configuration backup: $backup_name"
    
    cd "$PROJECT_ROOT"
    
    # Backup configuration files (excluding sensitive data)
    if tar -czf "$backup_file" \
        --exclude=".env*" \
        --exclude="*.key" \
        --exclude="*.pem" \
        package.json \
        package-lock.json \
        next.config.js \
        tsconfig.json \
        tailwind.config.js \
        vitest.config.ts \
        docker-compose.yml \
        Dockerfile \
        supabase/ \
        scripts/ \
        docs/ \
        2>> "$LOG_FILE"; then
        
        log "INFO" "Configuration backup completed: $backup_file"
        echo "$backup_file"
    else
        log "ERROR" "Configuration backup failed"
        return 1
    fi
}

# Create a complete system backup
full_backup() {
    log "INFO" "Starting full system backup"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local full_backup_dir="$BACKUP_DIR/full_$timestamp"
    mkdir -p "$full_backup_dir"
    
    local backup_manifest="$full_backup_dir/backup_manifest.json"
    local backup_success=true
    
    # Initialize manifest
    cat > "$backup_manifest" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "version": "$(cd "$PROJECT_ROOT" && git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "backups": {
EOF

    # Database backup
    if db_backup=$(backup_database); then
        cp "$db_backup" "$full_backup_dir/"
        echo "    \"database\": \"$(basename "$db_backup")\"," >> "$backup_manifest"
    else
        backup_success=false
    fi
    
    # File backup
    if file_backup=$(backup_files); then
        cp "$file_backup" "$full_backup_dir/"
        echo "    \"files\": \"$(basename "$file_backup")\"," >> "$backup_manifest"
    else
        backup_success=false
    fi
    
    # Configuration backup
    if config_backup=$(backup_config); then
        cp "$config_backup" "$full_backup_dir/"
        echo "    \"config\": \"$(basename "$config_backup")\"" >> "$backup_manifest"
    else
        backup_success=false
    fi
    
    # Close manifest
    echo -e "  }\n}" >> "$backup_manifest"
    
    if [ "$backup_success" = true ]; then
        log "INFO" "Full backup completed successfully: $full_backup_dir"
        
        # Create compressed archive of full backup
        local full_archive="$BACKUP_DIR/full_backup_$timestamp.tar.gz"
        tar -czf "$full_archive" -C "$BACKUP_DIR" "full_$timestamp"
        rm -rf "$full_backup_dir"
        
        log "INFO" "Full backup archived: $full_archive"
        echo "$full_archive"
    else
        log "ERROR" "Full backup completed with errors"
        return 1
    fi
}

# Restore database from backup
restore_database() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR" "Backup file not found: $backup_file"
        return 1
    fi
    
    log "WARN" "Starting database restore from: $backup_file"
    log "WARN" "This will OVERWRITE the current database!"
    
    # Safety check
    if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
        echo "To confirm database restore, set CONFIRM_RESTORE=yes"
        return 1
    fi
    
    local temp_file="$BACKUP_DIR/temp/restore_$(date +%Y%m%d_%H%M%S).sql"
    
    # Decompress if needed
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$temp_file"
    else
        cp "$backup_file" "$temp_file"
    fi
    
    if [ -n "${DATABASE_URL:-}" ]; then
        if psql "$DATABASE_URL" < "$temp_file" 2>> "$LOG_FILE"; then
            log "INFO" "Database restore completed successfully"
            rm -f "$temp_file"
        else
            log "ERROR" "Database restore failed"
            rm -f "$temp_file"
            return 1
        fi
    else
        log "ERROR" "No database connection configured for restore"
        return 1
    fi
}

# Restore files from backup
restore_files() {
    local backup_file="$1"
    local target_dir="${2:-$PROJECT_ROOT}"
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR" "Backup file not found: $backup_file"
        return 1
    fi
    
    log "WARN" "Starting file restore from: $backup_file to $target_dir"
    
    if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
        echo "To confirm file restore, set CONFIRM_RESTORE=yes"
        return 1
    fi
    
    if tar -xzf "$backup_file" -C "$target_dir" 2>> "$LOG_FILE"; then
        log "INFO" "File restore completed successfully"
    else
        log "ERROR" "File restore failed"
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "INFO" "Cleaning up old backups (retention: $RETENTION_DAYS days, max: $MAX_BACKUPS)"
    
    # Remove backups older than retention period
    find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Keep only MAX_BACKUPS most recent full backups
    ls -t "$BACKUP_DIR"/full_backup_*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
    
    # Remove empty directories
    find "$BACKUP_DIR" -type d -empty -delete 2>/dev/null || true
    
    log "INFO" "Cleanup completed"
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR" "Backup file not found: $backup_file"
        return 1
    fi
    
    log "INFO" "Verifying backup integrity: $backup_file"
    
    case "${backup_file##*.}" in
        "gz")
            if gzip -t "$backup_file" 2>> "$LOG_FILE"; then
                log "INFO" "Backup file integrity verified"
                return 0
            else
                log "ERROR" "Backup file is corrupted"
                return 1
            fi
            ;;
        "sql"|"tar")
            if [ -r "$backup_file" ]; then
                log "INFO" "Backup file is readable"
                return 0
            else
                log "ERROR" "Backup file is not readable"
                return 1
            fi
            ;;
        *)
            log "WARN" "Unknown backup file format, skipping verification"
            return 0
            ;;
    esac
}

# List available backups
list_backups() {
    log "INFO" "Available backups in $BACKUP_DIR:"
    
    echo -e "\n${BLUE}Full Backups:${NC}"
    ls -lah "$BACKUP_DIR"/full_backup_*.tar.gz 2>/dev/null | head -10 || echo "No full backups found"
    
    echo -e "\n${BLUE}Database Backups:${NC}"
    ls -lah "$BACKUP_DIR"/database/db_*.sql.gz 2>/dev/null | head -10 || echo "No database backups found"
    
    echo -e "\n${BLUE}File Backups:${NC}"
    ls -lah "$BACKUP_DIR"/files/files_*.tar.gz 2>/dev/null | head -10 || echo "No file backups found"
    
    echo -e "\n${BLUE}Config Backups:${NC}"
    ls -lah "$BACKUP_DIR"/config/config_*.tar.gz 2>/dev/null | head -10 || echo "No config backups found"
}

# Backup health check
health_check() {
    log "INFO" "Running backup system health check"
    
    local issues=0
    
    # Check backup directory
    if [ ! -d "$BACKUP_DIR" ]; then
        log "ERROR" "Backup directory does not exist: $BACKUP_DIR"
        ((issues++))
    fi
    
    # Check disk space (warn if less than 1GB free)
    local free_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    if [ "$free_space" -lt 1048576 ]; then # 1GB in KB
        log "WARN" "Low disk space in backup directory: $(df -h "$BACKUP_DIR" | awk 'NR==2 {print $4}') free"
        ((issues++))
    fi
    
    # Check recent backups
    local recent_backup=$(find "$BACKUP_DIR" -name "*.tar.gz" -o -name "*.sql.gz" | sort | tail -1)
    if [ -n "$recent_backup" ]; then
        local backup_age=$((($(date +%s) - $(stat -c %Y "$recent_backup")) / 86400))
        if [ "$backup_age" -gt 7 ]; then
            log "WARN" "Most recent backup is $backup_age days old"
            ((issues++))
        fi
    else
        log "WARN" "No backups found"
        ((issues++))
    fi
    
    # Check database connection
    if [ -n "${DATABASE_URL:-}" ]; then
        if ! pg_isready -d "$DATABASE_URL" &>/dev/null; then
            log "WARN" "Database connection check failed"
            ((issues++))
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        log "INFO" "Backup system health check passed"
        return 0
    else
        log "WARN" "Backup system health check found $issues issues"
        return 1
    fi
}

# Schedule automated backups (cron)
schedule_backups() {
    local cron_file="/tmp/airwave_backup_cron"
    
    cat > "$cron_file" << EOF
# AIRWAVE Automated Backup Schedule
# Full backup daily at 2 AM
0 2 * * * $SCRIPT_DIR/backup-recovery.sh full_backup >> $LOG_FILE 2>&1

# Database backup every 6 hours
0 */6 * * * $SCRIPT_DIR/backup-recovery.sh backup_database >> $LOG_FILE 2>&1

# Cleanup old backups weekly
0 3 * * 0 $SCRIPT_DIR/backup-recovery.sh cleanup_old_backups >> $LOG_FILE 2>&1

# Health check daily
0 1 * * * $SCRIPT_DIR/backup-recovery.sh health_check >> $LOG_FILE 2>&1
EOF

    if crontab "$cron_file" 2>/dev/null; then
        log "INFO" "Automated backup schedule installed"
        rm "$cron_file"
    else
        log "ERROR" "Failed to install automated backup schedule"
        rm "$cron_file"
        return 1
    fi
}

# Print usage information
usage() {
    echo "AIRWAVE Backup & Recovery System"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  full_backup                    - Create complete system backup"
    echo "  backup_database               - Backup database only"
    echo "  backup_files                  - Backup files only"
    echo "  backup_config                 - Backup configuration only"
    echo "  restore_database <file>       - Restore database from backup"
    echo "  restore_files <file> [dir]    - Restore files from backup"
    echo "  list_backups                  - List available backups"
    echo "  verify_backup <file>          - Verify backup integrity"
    echo "  cleanup_old_backups          - Remove old backups"
    echo "  health_check                 - Check backup system health"
    echo "  schedule_backups             - Install automated backup schedule"
    echo ""
    echo "Environment Variables:"
    echo "  BACKUP_DIR                   - Backup directory (default: ./backups)"
    echo "  MAX_BACKUPS                  - Maximum backups to keep (default: 30)"
    echo "  RETENTION_DAYS              - Days to keep backups (default: 90)"
    echo "  DATABASE_URL                 - Database connection string"
    echo "  SUPABASE_PROJECT_ID         - Supabase project ID"
    echo "  CONFIRM_RESTORE=yes         - Required for restore operations"
    echo ""
}

# Main execution
main() {
    setup_backup_environment
    
    case "${1:-}" in
        "full_backup")
            full_backup
            ;;
        "backup_database")
            backup_database
            ;;
        "backup_files")
            backup_files
            ;;
        "backup_config")
            backup_config
            ;;
        "restore_database")
            restore_database "${2:-}"
            ;;
        "restore_files")
            restore_files "${2:-}" "${3:-}"
            ;;
        "list_backups")
            list_backups
            ;;
        "verify_backup")
            verify_backup "${2:-}"
            ;;
        "cleanup_old_backups")
            cleanup_old_backups
            ;;
        "health_check")
            health_check
            ;;
        "schedule_backups")
            schedule_backups
            ;;
        "help"|"--help"|"-h"|"")
            usage
            ;;
        *)
            echo "Unknown command: $1"
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
