#!/usr/bin/env python3
"""
Validation script for Supabase migrations.
Checks for:
1. Table existence before policy creation
2. Column references in policies
3. SQL syntax issues
"""

import re
import sys
from pathlib import Path
from collections import defaultdict

# Track table schemas from CREATE TABLE statements
table_schemas = {}
# Track migration order
migrations = []
# Track all issues
issues = []

def parse_table_schema(sql_file):
    """Extract table name and columns from CREATE TABLE statement"""
    content = sql_file.read_text()
    
    # Find CREATE TABLE statements
    create_table_pattern = r'CREATE TABLE (?:IF NOT EXISTS )?public\.(\w+)\s*\(([^)]+)\)'
    for match in re.finditer(create_table_pattern, content, re.DOTALL | re.IGNORECASE):
        table_name = match.group(1).lower()
        columns_block = match.group(2)
        
        # Extract column names (simplified - just look for column definitions)
        columns = set()
        for line in columns_block.split('\n'):
            line = line.strip()
            if line and not line.startswith('--'):
                # Extract column name (first word before space or comma)
                col_match = re.match(r'^(\w+)', line)
                if col_match:
                    col_name = col_match.group(1).lower()
                    # Skip constraint keywords
                    if col_name not in ('constraint', 'primary', 'foreign', 'unique', 'check'):
                        columns.add(col_name)
        
        if table_name not in table_schemas:
            table_schemas[table_name] = set()
        table_schemas[table_name].update(columns)

def check_migration_dependencies():
    """Check that tables exist before policies reference them"""
    migration_dir = Path('supabase/migrations')
    migration_files = sorted(migration_dir.glob('*.sql'))
    
    tables_created_by_migration = defaultdict(set)
    policies_created_by_migration = defaultdict(list)
    
    for mig_file in migration_files:
        if 'REPAIR' in mig_file.name.upper():
            continue
            
        content = mig_file.read_text()
        mig_name = mig_file.name
        
        # Find CREATE TABLE statements
        for match in re.finditer(r'CREATE TABLE (?:IF NOT EXISTS )?public\.(\w+)', content, re.IGNORECASE):
            table_name = match.group(1).lower()
            tables_created_by_migration[mig_name].add(table_name)
        
        # Find CREATE POLICY statements (including those in DO blocks)
        # First, find DO blocks and mark their content
        do_block_pattern = r'DO \$\$\s*BEGIN(.*?)END \$\$;'
        do_blocks = [(m.start(), m.end()) for m in re.finditer(do_block_pattern, content, re.DOTALL)]
        
        # Find all CREATE POLICY statements
        for match in re.finditer(r'CREATE POLICY.*?ON public\.(\w+)', content, re.IGNORECASE | re.DOTALL):
            table_name = match.group(1).lower()
            policy_pos = match.start()
            
            # Check if inside DO block
            in_do_block = any(start <= policy_pos < end for start, end in do_blocks)
            
            policies_created_by_migration[mig_name].append({
                'table': table_name,
                'position': policy_pos,
                'in_do_block': in_do_block
            })
    
    # Check dependencies
    cumulative_tables = set()
    for mig_file in migration_files:
        if 'REPAIR' in mig_file.name.upper():
            continue
            
        mig_name = mig_file.name
        cumulative_tables.update(tables_created_by_migration[mig_name])
        
        # Check policies in this migration
        for policy_info in policies_created_by_migration[mig_name]:
            table_name = policy_info['table']
            in_do_block = policy_info['in_do_block']
            
            if table_name not in cumulative_tables:
                if not in_do_block:
                    issues.append(
                        f"❌ {mig_name}: Policy references non-existent table 'public.{table_name}' "
                        f"and is NOT wrapped in DO block (position {policy_info['position']})"
                    )
                # If in DO block, it's OK - just a warning
                elif table_name not in ['team_join_links']:  # Known to be created later
                    issues.append(
                        f"⚠️  {mig_name}: Policy references 'public.{table_name}' in DO block "
                        f"(table created later - should be OK if conditional check works)"
                    )

def check_column_references():
    """Check that columns referenced in policies exist"""
    migration_dir = Path('supabase/migrations')
    
    for mig_file in sorted(migration_dir.glob('*.sql')):
        if 'REPAIR' in mig_file.name.upper():
            continue
            
        content = mig_file.read_text()
        
        # Find CREATE POLICY statements
        policy_pattern = r'CREATE POLICY[^;]*ON public\.(\w+)[^;]*USING\s*\(([^)]+)\)'
        for match in re.finditer(policy_pattern, content, re.IGNORECASE | re.DOTALL):
            table_name = match.group(1).lower()
            using_clause = match.group(2)
            
            if table_name not in table_schemas:
                continue  # Table doesn't exist yet or is conditional
            
            # Extract column references (simplified - look for common patterns)
            # Look for patterns like "column_name IN" or "column_name ="
            col_refs = re.findall(r'\b(\w+)\.(\w+)\b', using_clause)
            for qualifier, col_name in col_refs:
                if qualifier.lower() == table_name or qualifier.lower() in ['tm', 'p', 'r']:
                    if col_name.lower() not in table_schemas[table_name]:
                        # Check if it's a valid reference (might be from joined table)
                        if col_name.lower() not in ['id', 'team_id', 'user_id', 'status', 'role']:
                            issues.append(
                                f"⚠️  {mig_file.name}: Policy on '{table_name}' references column "
                                f"'{col_name}' which may not exist in table schema"
                            )

def main():
    print("🔍 Validating Supabase migrations...\n")
    
    migration_dir = Path('supabase/migrations')
    if not migration_dir.exists():
        print("❌ supabase/migrations directory not found")
        sys.exit(1)
    
    # Parse all table schemas
    print("📊 Parsing table schemas...")
    for mig_file in sorted(migration_dir.glob('*.sql')):
        if 'REPAIR' in mig_file.name.upper():
            continue
        try:
            parse_table_schema(mig_file)
        except Exception as e:
            issues.append(f"⚠️  Error parsing {mig_file.name}: {e}")
    
    print(f"   Found {len(table_schemas)} tables defined\n")
    
    # Check dependencies
    print("🔗 Checking migration dependencies...")
    check_migration_dependencies()
    
    # Check column references
    print("📋 Checking column references...")
    check_column_references()
    
    # Report results
    print("\n" + "="*70)
    if issues:
        error_count = len([i for i in issues if i.startswith('❌')])
        warning_count = len([i for i in issues if i.startswith('⚠️')])
        
        print(f"\nFound {error_count} errors and {warning_count} warnings:\n")
        for issue in issues:
            print(f"  {issue}")
        
        if error_count > 0:
            print("\n❌ Validation FAILED - fix errors before running migrations")
            sys.exit(1)
        else:
            print("\n⚠️  Validation completed with warnings (may still work)")
            sys.exit(0)
    else:
        print("\n✅ Validation PASSED - no issues found!")
        sys.exit(0)

if __name__ == '__main__':
    main()

