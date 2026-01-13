wrong = 41234708690
acc_hite = 1259331192470
acc_hold = 1252538772259
h3 = 646554290798
h2 = 642895817131
q1 = 612776901672

print(f"잘못된 값: {wrong:,}\n")

# 가능한 조합들 시도
print("=== 누적에서 뭔가를 빼서 계산? ===")
print(f"누적 하이트진로 - 하이트진로 반기3개월 = {acc_hite - h3:,}")
print(f"누적 하이트진로 - 홀딩스 반기3개월 = {acc_hite - h2:,}")
print(f"누적 홀딩스 - 하이트진로 반기3개월 = {acc_hold - h3:,}")
print(f"누적 홀딩스 - 홀딩스 반기3개월 = {acc_hold - h2:,}")

print("\n=== 두 값을 빼기? ===")
print(f"하이트진로 - 홀딩스 = {h3 - h2:,}")
print(f"누적 하이트진로 - 누적 홀딩스 = {acc_hite - acc_hold:,}")

print("\n=== 누적 차이를 더하거나 빼기? ===")
diff = acc_hite - acc_hold
print(f"차이: {diff:,}")
print(f"홀딩스 + 차이 = {h2 + diff:,}")
print(f"하이트진로 - 차이 = {h3 - diff:,}")

print("\n=== 홀딩스 누적 - 하이트진로 1Q - 홀딩스 반기3개월? ===")
calc1 = acc_hold - q1 - h2
print(f"{acc_hold:,} - {q1:,} - {h2:,} = {calc1:,}")
if calc1 == wrong:
    print("★ 일치!")

print("\n=== 하이트진로 누적 - 하이트진로 1Q - 홀딩스 반기3개월? ===")
calc2 = acc_hite - q1 - h2
print(f"{acc_hite:,} - {q1:,} - {h2:,} = {calc2:,}")
if abs(calc2 - wrong) < 10:
    print("★ 거의 일치!")
