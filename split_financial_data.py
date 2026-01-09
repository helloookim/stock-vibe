"""Split large financial JSON files into smaller chunks for Cloudflare Pages (25MB limit)"""
import json
import os
import sys
import io

# Set stdout encoding to UTF-8 on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuration
CHUNK_SIZE = 500  # Number of companies per chunk
OUTPUT_DIR = "public/data"

def split_json_file(input_file, output_prefix, chunk_size=CHUNK_SIZE):
    """Split a large JSON file into smaller chunks"""

    print(f"\nProcessing {input_file}...")

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Load the data
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Sort by stock code for consistent chunking
    sorted_codes = sorted(data.keys())
    total_companies = len(sorted_codes)

    print(f"Total companies: {total_companies}")

    # Calculate number of chunks
    num_chunks = (total_companies + chunk_size - 1) // chunk_size
    print(f"Will create {num_chunks} chunks of ~{chunk_size} companies each")

    chunks_info = []

    # Split into chunks
    for i in range(num_chunks):
        start_idx = i * chunk_size
        end_idx = min((i + 1) * chunk_size, total_companies)

        chunk_codes = sorted_codes[start_idx:end_idx]
        chunk_data = {code: data[code] for code in chunk_codes}

        # Determine code range for this chunk
        first_code = chunk_codes[0]
        last_code = chunk_codes[-1]

        # Create filename
        chunk_filename = f"{output_prefix}_{i:02d}.json"
        chunk_path = os.path.join(OUTPUT_DIR, chunk_filename)

        # Save chunk
        with open(chunk_path, 'w', encoding='utf-8') as f:
            json.dump(chunk_data, f, ensure_ascii=False, separators=(',', ':'))

        # Get file size
        file_size = os.path.getsize(chunk_path)
        file_size_mb = file_size / (1024 * 1024)

        chunk_info = {
            'file': chunk_filename,
            'start': first_code,
            'end': last_code,
            'count': len(chunk_codes),
            'size_mb': round(file_size_mb, 2)
        }
        chunks_info.append(chunk_info)

        print(f"  Chunk {i}: {first_code}-{last_code} ({len(chunk_codes)} companies, {file_size_mb:.2f} MB)")

    # Create index file
    index_data = {
        'source_file': input_file,
        'total_companies': total_companies,
        'num_chunks': num_chunks,
        'chunks': chunks_info
    }

    index_filename = f"{output_prefix}_index.json"
    index_path = os.path.join(OUTPUT_DIR, index_filename)

    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)

    print(f"\nCreated index file: {index_filename}")
    print(f"All chunks saved to: {OUTPUT_DIR}/")

    # Check for files over 25MB
    oversized = [c for c in chunks_info if c['size_mb'] > 25]
    if oversized:
        print(f"\nWARNING: {len(oversized)} chunks exceed 25MB limit:")
        for c in oversized:
            print(f"  {c['file']}: {c['size_mb']} MB")
        print("Consider reducing CHUNK_SIZE")
    else:
        print(f"\n✓ All chunks are under 25MB limit")

    return chunks_info

def main():
    # Split financial_data.json
    if os.path.exists('financial_data.json'):
        split_json_file('financial_data.json', 'financial_data')

    # Split financial_data_separate.json
    if os.path.exists('financial_data_separate.json'):
        split_json_file('financial_data_separate.json', 'financial_data_separate')

    # Split eps_data.json
    if os.path.exists('eps_data.json'):
        split_json_file('eps_data.json', 'eps_data')

    print("\n" + "="*60)
    print("Split complete!")
    print("="*60)

if __name__ == '__main__':
    main()
