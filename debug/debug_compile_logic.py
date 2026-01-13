"""
Simulate the compile_final_data logic for 하이트진로 2025 2Q and 3Q
"""

# Simulated data structure after processing both 반기보고서 and 3분기보고서
data = {
    '000080': {
        2025: {
            '1Q': {
                'revenue': 612776901672  # From 1분기보고서
            },
            '2Q': {
                'revenue': 646554290798  # From 반기보고서 - 당기반기3개월
            },
            '3Q': {
                'revenue': 669532545814  # From 3분기보고서 - 당기3분기3개월
            },
            '3Q_Acc': {
                'revenue': 1928863738284  # From 3분기보고서 - 당기3분기누적
            }
        }
    }
}

print("=== Simulated data structure ===")
print(f"2025 1Q revenue: {data['000080'][2025]['1Q']['revenue']:,}")
print(f"2025 2Q revenue: {data['000080'][2025]['2Q']['revenue']:,}")
print(f"2025 3Q revenue: {data['000080'][2025]['3Q']['revenue']:,}")
print(f"2025 3Q_Acc revenue: {data['000080'][2025]['3Q_Acc']['revenue']:,}")

# Simulate compile_final_data logic
y = 2025
y_data = data['000080'][y]
history = []

for q in ['1Q', '2Q', '3Q']:
    if q in y_data:
        rec = {
            'year': y,
            'quarter': q,
            'revenue': y_data[q].get('revenue'),
        }
        if rec['revenue']:
            history.append(rec)
            print(f"\nAdding {q}: revenue = {rec['revenue']:,}")

print("\n=== Final history ===")
for rec in history:
    print(f"{rec['year']} {rec['quarter']}: revenue = {rec['revenue']:,}")
