"""
Universal TSV (Tab-Separated Values) to CSV (Comma-Separated Values) Converter
Handles multiple encodings and various edge cases
"""
import os
import csv
import sys

def detect_encoding(filepath):
    """Try multiple encodings to find the right one"""
    encodings = ['cp949', 'utf-8', 'euc-kr', 'utf-16', 'latin-1']
    
    for encoding in encodings:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                f.read()
            return encoding
        except UnicodeDecodeError:
            continue
    
    return 'utf-8'  # Fallback

def convert_tsv_to_csv(input_file, output_file=None, encoding=None):
    """
    Convert TSV file to CSV
    
    Args:
        input_file: Path to input TSV file
        output_file: Path to output CSV file (optional, auto-generated if None)
        encoding: Force specific encoding (optional, auto-detect if None)
    """
    # Auto-generate output filename if not provided
    if output_file is None:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}.csv"
    
    # Detect encoding if not specified
    if encoding is None:
        encoding = detect_encoding(input_file)
        print(f"Detected encoding: {encoding}")
    
    # Read TSV and write CSV
    try:
        with open(input_file, 'r', encoding=encoding) as tsv_file:
            # Use csv.reader with tab delimiter
            tsv_reader = csv.reader(tsv_file, delimiter='\t')
            
            with open(output_file, 'w', encoding='utf-8-sig', newline='') as csv_file:
                csv_writer = csv.writer(csv_file, quoting=csv.QUOTE_MINIMAL)
                
                rows_written = 0
                for row in tsv_reader:
                    csv_writer.writerow(row)
                    rows_written += 1
        
        print(f"✓ Converted: {input_file} → {output_file}")
        print(f"  {rows_written} rows written")
        return True
        
    except Exception as e:
        print(f"✗ Error converting {input_file}: {e}")
        return False

def batch_convert_directory(input_dir, output_dir=None, pattern='*.txt'):
    """
    Convert all TSV files in a directory
    
    Args:
        input_dir: Directory containing TSV files
        output_dir: Output directory (optional, same as input if None)
        pattern: File pattern to match (default: *.txt)
    """
    import glob
    
    if output_dir is None:
        output_dir = input_dir
    else:
        os.makedirs(output_dir, exist_ok=True)
    
    # Find all matching files
    search_pattern = os.path.join(input_dir, pattern)
    files = glob.glob(search_pattern)
    
    if not files:
        print(f"No files matching '{pattern}' found in {input_dir}")
        return
    
    print(f"Found {len(files)} files to convert\n")
    
    success_count = 0
    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        output_path = os.path.join(output_dir, os.path.splitext(filename)[0] + '.csv')
        
        if convert_tsv_to_csv(filepath, output_path):
            success_count += 1
        print()  # Empty line between files
    
    print(f"Conversion complete: {success_count}/{len(files)} files succeeded")

def main():
    """
    Command-line interface
    
    Usage:
        # Convert single file
        python tsv_to_csv.py input.txt
        python tsv_to_csv.py input.txt output.csv
        
        # Convert all files in directory
        python tsv_to_csv.py --dir 손익계산서
        python tsv_to_csv.py --dir 손익계산서 --output csv_output
    """
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Single file: python tsv_to_csv.py input.txt [output.csv]")
        print("  Directory:   python tsv_to_csv.py --dir input_folder [--output output_folder]")
        return
    
    if sys.argv[1] == '--dir':
        # Batch mode
        input_dir = sys.argv[2] if len(sys.argv) > 2 else '.'
        output_dir = None
        
        if len(sys.argv) > 3 and sys.argv[3] == '--output':
            output_dir = sys.argv[4] if len(sys.argv) > 4 else None
        
        batch_convert_directory(input_dir, output_dir)
    else:
        # Single file mode
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else None
        convert_tsv_to_csv(input_file, output_file)

if __name__ == '__main__':
    # Example usage when run directly
    if len(sys.argv) == 1:
        print("=== TSV to CSV Converter ===\n")
        '''
        # Example 1: Convert single file
        print("Example 1: Convert single file")
        if os.path.exists("2025_3분기보고서_03_포괄손익계산서_연결_20251231.txt"):
            convert_tsv_to_csv("2025_3분기보고서_03_포괄손익계산서_연결_20251231.txt")
        '''
        # Example 2: Convert all files in a directory
        print("\nExample 2: Convert all files in directory")
        if os.path.exists("손익계산서"):
            batch_convert_directory("손익계산서", "csv_output")
        else:
            print("(손익계산서 directory not found - skipping batch example)")
        
    else:
        main()
