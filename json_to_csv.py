"""
Convert financial_data.json to CSV format
"""
import json
import csv

# CONFIGURATION
INPUT_JSON = "financial_data.json"
OUTPUT_CSV = "financial_data.csv"

def json_to_csv(input_file, output_file):
    # Load JSON data
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Open CSV file for writing
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        
        # Write header
        header = [
            '종목코드',
            '회사명',
            '업종',
            '연도',
            '분기',
            '매출액',
            '영업이익',
            '당기순이익',
            '매출액_IFRS코드',
            '매출액_한글명',
            '영업이익_IFRS코드',
            '영업이익_한글명',
            '당기순이익_IFRS코드',
            '당기순이익_한글명'
        ]
        writer.writerow(header)
        
        # Write data rows
        for code in sorted(data.keys()):
            company = data[code]
            name = company['name']
            sector = company['sector'] if company['sector'] else ''
            
            for record in company['history']:
                row = [
                    code,
                    name,
                    sector,
                    record['year'],
                    record['quarter'],
                    record.get('revenue', ''),
                    record.get('op_profit', ''),
                    record.get('net_income', ''),
                    record.get('revenue_ifrs_code', ''),
                    record.get('revenue_korean_name', ''),
                    record.get('op_profit_ifrs_code', ''),
                    record.get('op_profit_korean_name', ''),
                    record.get('net_income_ifrs_code', ''),
                    record.get('net_income_korean_name', '')
                ]
                writer.writerow(row)
    
    print(f"Successfully converted {input_file} to {output_file}")

def main():
    # Convert consolidated data
    json_to_csv(INPUT_JSON, OUTPUT_CSV)
    
    # Also convert separate data if it exists
    import os
    separate_json = "financial_data_separate.json"
    if os.path.exists(separate_json):
        separate_csv = "financial_data_separate.csv"
        json_to_csv(separate_json, separate_csv)
        print(f"Also converted {separate_json} to {separate_csv}")

if __name__ == '__main__':
    main()
