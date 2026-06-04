# KR Stock Data Quality Report
Generated: 2026-06-04 11:12:14

## Summary
- Total companies scanned: 3085
- Companies with issues: 2077
- Critical issues: 18
- Warning issues: 4276
- Info issues: 876

---

## Critical Issues

### Absurd Values (13 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 007720 | 소노스퀘어 | 2024 | 3Q | revenue | 36975.9조 | revenue=36,975,890,328,000,000 (>1000.0조) |
| 007720 | 소노스퀘어 | 2024 | 3Q | op_profit | 1058.5조 | op_profit=1,058,469,818,000,000 (>1000.0조) |
| 032080 | 아즈텍WB | 2019 | 3Q | revenue | 12647.7조 | revenue=12,647,656,640,000,000 (>1000.0조) |
| 032080 | 아즈텍WB | 2019 | 3Q | net_income | 1152.2조 | net_income=1,152,218,692,000,000 (>1000.0조) |
| 060310 | 3S | 2022 | 3Q | revenue | 10406.6조 | revenue=10,406,577,832,000,000 (>1000.0조) |
| 060310 | 3S | 2022 | 3Q | op_profit | 1138.0조 | op_profit=1,138,047,546,000,000 (>1000.0조) |
| 102260 | 동성케미컬 | 2017 | 2Q | revenue | 211391.1조 | revenue=211,391,072,734,000,000 (>1000.0조) |
| 160600 | 이큐셀 | 2025 | 2Q | revenue | 31791.0조 | revenue=31,790,974,711,000,000 (>1000.0조) |
| 160600 | 이큐셀 | 2025 | 2Q | op_profit | 1568.2조 | op_profit=1,568,190,557,000,000 (>1000.0조) |
| 160600 | 이큐셀 | 2025 | 2Q | net_income | -3763.6조 | net_income=-3,763,592,202,000,000 (>1000.0조) |
| 311060 | 엘에이티 | 2017 | - | revenue | 6892.4조 | revenue=6,892,393,543,000,000 (>1000.0조) |
| 323350 | 다원넥스뷰 | 2024 | 2Q | revenue | 5025.2조 | revenue=5,025,160,349,000,000 (>1000.0조) |
| 323350 | 다원넥스뷰 | 2024 | 2Q | net_income | -5712.3조 | net_income=-5,712,257,033,000,000 (>1000.0조) |

### Q4 Op Profit > Revenue (5 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 019490 | 엑시큐어하이트론 | 2025 | 4Q | op_profit | 87억 | op_profit=87억 > revenue=4억 |
| 033560 | 블루콤 | 2025 | 4Q | op_profit | 15억 | op_profit=15억 > revenue=6억 |
| 207940 | 삼성바이오로직스 | 2025 | 4Q | op_profit | 3781억 | op_profit=3781억 > revenue=3086억 |
| 246690 | TS인베스트먼트 | 2025 | 4Q | op_profit | 73억 | op_profit=73억 > revenue=64억 |
| 352770 | 셀레스트라 | 2021 | 4Q | op_profit | 309억 | op_profit=309억 > revenue=283억 |

---

## Warning Issues

### Annual NI Spike (>5x YoY) (597 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 000100 | 유한양행 | 2020 | - | net_income | 1904억 | 2020 NI=1904억 vs 2019 NI=366억 (5.2x) |
| 000180 | 성창기업지주 | 2016 | - | net_income | 211억 | 2016 NI=211억 vs 2015 NI=22억 (9.5x) |
| 000230 | 일동홀딩스 | 2016 | - | net_income | 2662억 | 2016 NI=2662억 vs 2015 NI=213억 (12.5x) |
| 000320 | 노루홀딩스 | 2019 | - | net_income | 199억 | 2019 NI=199억 vs 2018 NI=27억 (7.5x) |
| 000440 | 중앙에너비스 | 2020 | - | net_income | 192억 | 2020 NI=192억 vs 2019 NI=6억 (31.2x) |
| 000490 | 대동 | 2020 | - | net_income | 210억 | 2020 NI=210억 vs 2019 NI=30억 (7.0x) |
| 000640 | 동아쏘시오홀딩스 | 2020 | - | net_income | 1624억 | 2020 NI=1624억 vs 2019 NI=200억 (8.1x) |
| 000640 | 동아쏘시오홀딩스 | 2023 | - | net_income | 559억 | 2023 NI=559억 vs 2022 NI=78억 (7.1x) |
| 000650 | 천일고속 | 2017 | - | net_income | 271억 | 2017 NI=271억 vs 2016 NI=25억 (10.8x) |
| 000880 | 한화 | 2016 | - | net_income | 1.3조 | 2016 NI=1.3조 vs 2015 NI=1205억 (10.7x) |
| 000910 | 유니온 | 2017 | - | net_income | 19억 | 2017 NI=19억 vs 2016 NI=2억 (10.2x) |
| 000950 | 전방 | 2022 | - | net_income | 675억 | 2022 NI=675억 vs 2021 NI=2억 (421.8x) |
| 000970 | 한국주철관공업 | 2021 | - | net_income | 659억 | 2021 NI=659억 vs 2020 NI=102억 (6.4x) |
| 001020 | 페이퍼코리아 | 2021 | - | net_income | 92억 | 2021 NI=92억 vs 2020 NI=2억 (38.2x) |
| 001080 | 만호제강 | 2022 | - | net_income | 64억 | 2022 NI=64억 vs 2021 NI=9억 (7.4x) |
| 001230 | 동국홀딩스 | 2021 | - | net_income | 5586억 | 2021 NI=5586억 vs 2020 NI=695억 (8.0x) |
| 001380 | SG글로벌 | 2018 | - | net_income | 33억 | 2018 NI=33억 vs 2017 NI=3억 (9.3x) |
| 001390 | KG케미칼 | 2019 | - | net_income | 2193억 | 2019 NI=2193억 vs 2018 NI=278억 (7.9x) |
| 001440 | 대한전선 | 2021 | - | net_income | 289억 | 2021 NI=289억 vs 2020 NI=27억 (10.8x) |
| 001540 | 안국약품 | 2017 | - | net_income | 82억 | 2017 NI=82억 vs 2016 NI=13억 (6.1x) |
| 001540 | 안국약품 | 2024 | - | net_income | 163억 | 2024 NI=163억 vs 2023 NI=10억 (16.4x) |
| 001740 | SK네트웍스 | 2024 | - | net_income | 463억 | 2024 NI=463억 vs 2023 NI=55억 (8.5x) |
| 001770 | SHD | 2021 | - | net_income | 58억 | 2021 NI=58억 vs 2020 NI=5억 (11.8x) |
| 001770 | SHD | 2024 | - | net_income | 29억 | 2024 NI=29억 vs 2023 NI=1억 (26.5x) |
| 001780 | 알루코 | 2022 | - | net_income | 157억 | 2022 NI=157억 vs 2021 NI=24억 (6.4x) |
| 001800 | 오리온홀딩스 | 2017 | - | net_income | 1.5조 | 2017 NI=1.5조 vs 2016 NI=2490억 (6.0x) |
| 002000 | 생고뱅코리아홀딩스 | 2017 | - | net_income | 1394억 | 2017 NI=1394억 vs 2016 NI=265억 (5.3x) |
| 002020 | 코오롱 | 2024 | - | net_income | 1576억 | 2024 NI=1576억 vs 2023 NI=154억 (10.2x) |
| 002030 | 아세아 | 2016 | - | net_income | 676억 | 2016 NI=676억 vs 2015 NI=82억 (8.2x) |
| 002140 | 고려산업 | 2023 | - | net_income | 31억 | 2023 NI=31억 vs 2022 NI=4억 (7.5x) |
| 002150 | 도화엔지니어링 | 2017 | - | net_income | 117억 | 2017 NI=117억 vs 2016 NI=13억 (9.3x) |
| 002150 | 도화엔지니어링 | 2023 | - | net_income | 207억 | 2023 NI=207억 vs 2022 NI=16억 (13.1x) |
| 002230 | 피에스텍 | 2021 | - | net_income | 64억 | 2021 NI=64억 vs 2020 NI=4억 (14.7x) |
| 002240 | 고려제강 | 2021 | - | net_income | 1333억 | 2021 NI=1333억 vs 2020 NI=27억 (48.9x) |
| 002310 | 아세아제지 | 2018 | - | net_income | 787억 | 2018 NI=787억 vs 2017 NI=50억 (15.7x) |
| 002320 | 한진 | 2021 | - | net_income | 1618억 | 2021 NI=1618억 vs 2020 NI=91억 (17.8x) |
| 002380 | 케이씨씨 | 2025 | - | net_income | 1.5조 | 2025 NI=1.5조 vs 2024 NI=2933억 (5.2x) |
| 002450 | 삼익악기 | 2025 | - | net_income | 173억 | 2025 NI=173억 vs 2024 NI=31억 (5.5x) |
| 002600 | 조흥 | 2024 | - | net_income | 25억 | 2024 NI=25억 vs 2023 NI=4억 (7.1x) |
| 002620 | 제일파마홀딩스 | 2017 | - | net_income | 5193억 | 2017 NI=5193억 vs 2016 NI=79억 (65.8x) |
| 002690 | 동일제강 | 2019 | - | net_income | 11억 | 2019 NI=11억 vs 2018 NI=1억 (8.2x) |
| 002690 | 동일제강 | 2021 | - | net_income | 83억 | 2021 NI=83억 vs 2020 NI=3억 (27.2x) |
| 002710 | TCC스틸 | 2018 | - | net_income | 98억 | 2018 NI=98억 vs 2017 NI=15억 (6.5x) |
| 002790 | 아모레퍼시픽홀딩스 | 2021 | - | net_income | 2920억 | 2021 NI=2920억 vs 2020 NI=220억 (13.2x) |
| 002870 | 신풍 | 2018 | - | net_income | 87억 | 2018 NI=87억 vs 2017 NI=8억 (10.8x) |
| 002870 | 신풍 | 2025 | - | net_income | 20억 | 2025 NI=20억 vs 2024 NI=3억 (6.5x) |
| 002900 | TYM | 2021 | - | net_income | 395억 | 2021 NI=395억 vs 2020 NI=64억 (6.2x) |
| 002990 | 금호건설 | 2021 | - | net_income | 1481억 | 2021 NI=1481억 vs 2020 NI=264억 (5.6x) |
| 003000 | 부광약품 | 2018 | - | net_income | 1457억 | 2018 NI=1457억 vs 2017 NI=111억 (13.1x) |
| 003030 | 세아제강지주 | 2018 | - | net_income | 3228억 | 2018 NI=3228억 vs 2017 NI=291억 (11.1x) |

*...and 547 more entries (truncated)*


### EPS Sign Mismatch (134 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 000020 | 동화약품 | 2025 | 1Q | eps | 1 | eps=1 but net_income=-8억 |
| 000220 | 유유제약 | 2025 | 2Q | eps | -7 | eps=-7 but net_income=6억 |
| 000300 | DH오토넥스 | 2025 | 3Q | eps | -9 | eps=-9 but net_income=29억 |
| 000680 | LS네트웍스 | 2025 | 1Q | eps | -47 | eps=-47 but net_income=18억 |
| 000880 | 한화 | 2025 | 4Q | eps | -1,620 | eps=-1,620 but net_income=2314억 |
| 001230 | 동국홀딩스 | 2025 | 1Q | eps | -31 | eps=-31 but net_income=22억 |
| 001250 | GS글로벌 | 2025 | 3Q | eps | 13 | eps=13 but net_income=-17억 |
| 001720 | 신영증권 | 2025 | 4Q | eps | 1,435 | eps=1,435 but net_income=-46억 |
| 002320 | 한진 | 2025 | 1Q | eps | -81 | eps=-81 but net_income=5억 |
| 002710 | TCC스틸 | 2025 | 1Q | eps | 4 | eps=4 but net_income=-71,592,793 |
| 003220 | 대원제약 | 2025 | 1Q | eps | -1 | eps=-1 but net_income=49억 |
| 003670 | 포스코퓨처엠 | 2025 | 2Q | eps | 548 | eps=548 but net_income=-355억 |
| 004170 | 신세계 | 2025 | 2Q | eps | -258 | eps=-258 but net_income=83억 |
| 004690 | 삼천리 | 2025 | 4Q | eps | -26 | eps=-26 but net_income=29억 |
| 005110 | 한창 | 2016 | 4Q | eps | -61 | eps=-61 but net_income=59억 |
| 006060 | 화승인더스트리 | 2025 | 3Q | eps | 26 | eps=26 but net_income=-5억 |
| 006200 | 한국전자홀딩스 | 2025 | 2Q | eps | 6 | eps=6 but net_income=-23억 |
| 006650 | 대한유화 | 2025 | 4Q | eps | -395 | eps=-395 but net_income=27억 |
| 006840 | AK홀딩스 | 2025 | 1Q | eps | 230 | eps=230 but net_income=-50억 |
| 007810 | 코리아써키트 | 2025 | 1Q | eps | 41 | eps=41 but net_income=-22억 |
| 008110 | 대동전자 | 2025 | 2Q | eps | 347 | eps=347 but net_income=-5억 |
| 008500 | 일정실업 | 2025 | 3Q | eps | 3 | eps=3 but net_income=-2억 |
| 009310 | 참엔지니어링 | 2025 | 2Q | eps | -293 | eps=-293 but net_income=29억 |
| 009440 | KC그린홀딩스 | 2025 | 1Q | eps | 22 | eps=22 but net_income=-10억 |
| 009440 | KC그린홀딩스 | 2025 | 3Q | eps | 67 | eps=67 but net_income=-49억 |
| 009830 | 한화솔루션 | 2025 | 3Q | eps | -117 | eps=-117 but net_income=45억 |
| 011210 | 현대위아 | 2025 | 2Q | eps | -7 | eps=-7 but net_income=173억 |
| 014100 | 메디앙스 | 2025 | 3Q | eps | 135 | eps=135 but net_income=-2,319,625 |
| 016250 | SGC E&C | 2025 | 1Q | eps | -424 | eps=-424 but net_income=6억 |
| 016450 | 한세예스24홀딩스 | 2025 | 3Q | eps | -103 | eps=-103 but net_income=26억 |
| 019680 | 대교 | 2025 | 1Q | eps | -2 | eps=-2 but net_income=2억 |
| 024910 | 경창산업 | 2025 | 2Q | eps | 11 | eps=11 but net_income=-6억 |
| 025900 | 동화기업 | 2025 | 2Q | eps | 85 | eps=85 but net_income=-8억 |
| 025950 | 동신건설 | 2025 | 2Q | eps | -202 | eps=-202 but net_income=17억 |
| 028080 | 휴맥스홀딩스 | 2025 | 3Q | eps | -1 | eps=-1 but net_income=78,512,693 |
| 029480 | 광무 | 2025 | 3Q | eps | -45 | eps=-45 but net_income=25억 |
| 031310 | 아이즈비전 | 2025 | 1Q | eps | 9 | eps=9 but net_income=-5억 |
| 031820 | 아이티센씨티에스 | 2025 | 2Q | eps | -34 | eps=-34 but net_income=6억 |
| 033230 | 인성정보 | 2025 | 3Q | eps | 3 | eps=3 but net_income=-4억 |
| 034220 | LG디스플레이 | 2025 | 3Q | eps | -41 | eps=-41 but net_income=12억 |
| 035080 | 그래디언트 | 2025 | 2Q | eps | -359 | eps=-359 but net_income=33억 |
| 036710 | 심텍홀딩스 | 2025 | 2Q | eps | 52 | eps=52 but net_income=-94억 |
| 036710 | 심텍홀딩스 | 2025 | 3Q | eps | -14 | eps=-14 but net_income=25억 |
| 036810 | 에프에스티 | 2025 | 1Q | eps | 1 | eps=1 but net_income=-2억 |
| 037950 | 엘컴텍 | 2025 | 2Q | eps | 2 | eps=2 but net_income=-7,301,899 |
| 038530 | 케이바이오 | 2025 | 1Q | eps | -2 | eps=-2 but net_income=47,995,377 |
| 038870 | 에코바이오 | 2025 | 2Q | eps | 5 | eps=5 but net_income=-7억 |
| 038870 | 에코바이오 | 2025 | 3Q | eps | 135 | eps=135 but net_income=-13,424,777 |
| 039200 | 오스코텍 | 2025 | 3Q | eps | -13 | eps=-13 but net_income=6억 |
| 040910 | 아이씨디 | 2025 | 2Q | eps | -425 | eps=-425 but net_income=86,669,972 |

*...and 84 more entries (truncated)*


### One-Time Gain/Loss (Quarterly) (2672 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 000020 | 동화약품 | 2016 | 4Q | net_income | 191억 | NI=191억 vs OP=5억 (37.7x) |
| 000020 | 동화약품 | 2017 | 4Q | net_income | 396억 | NI=396억 vs OP=-1억 (276.5x) |
| 000040 | KR모터스 | 2026 | 1Q | net_income | 194억 | NI=194억 vs OP=-7억 (28.9x) |
| 000100 | 유한양행 | 2018 | 3Q | net_income | 109억 | NI=109억 vs OP=2억 (71.8x) |
| 000100 | 유한양행 | 2020 | 1Q | net_income | 1154억 | NI=1154억 vs OP=11억 (107.4x) |
| 000100 | 유한양행 | 2023 | 3Q | net_income | 190억 | NI=190억 vs OP=9억 (21.5x) |
| 000100 | 유한양행 | 2023 | 4Q | net_income | 841억 | NI=841억 vs OP=60억 (14.1x) |
| 000100 | 유한양행 | 2024 | 1Q | net_income | 108억 | NI=108억 vs OP=6억 (18.7x) |
| 000140 | 하이트진로홀딩스 | 2019 | 1Q | net_income | -165억 | NI=-165억 vs OP=-10억 (16.0x) |
| 000140 | 하이트진로홀딩스 | 2025 | 4Q | net_income | -779억 | NI=-779억 vs OP=-69억 (11.3x) |
| 000150 | 두산 | 2020 | 2Q | net_income | -2372억 | NI=-2372억 vs OP=79억 (30.0x) |
| 000150 | 두산 | 2021 | 4Q | net_income | 561억 | NI=561억 vs OP=-49억 (11.6x) |
| 000210 | DL | 2021 | 4Q | net_income | -1435억 | NI=-1435억 vs OP=52억 (27.5x) |
| 000210 | DL | 2023 | 2Q | net_income | -898억 | NI=-898억 vs OP=-71억 (12.7x) |
| 000230 | 일동홀딩스 | 2016 | 3Q | net_income | 2544억 | NI=2544억 vs OP=-14억 (176.2x) |
| 000230 | 일동홀딩스 | 2024 | 3Q | net_income | -157억 | NI=-157억 vs OP=1억 (149.7x) |
| 000230 | 일동홀딩스 | 2024 | 4Q | net_income | 832억 | NI=832억 vs OP=46억 (17.9x) |
| 000250 | 삼천당제약 | 2021 | 4Q | net_income | -37억 | NI=-37억 vs OP=-1억 (24.8x) |
| 000250 | 삼천당제약 | 2024 | 4Q | net_income | -89억 | NI=-89억 vs OP=-5억 (16.4x) |
| 000300 | DH오토넥스 | 2017 | 2Q | net_income | -35억 | NI=-35억 vs OP=-3억 (12.4x) |
| 000300 | DH오토넥스 | 2023 | 2Q | net_income | -233억 | NI=-233억 vs OP=-5억 (43.6x) |
| 000300 | DH오토넥스 | 2024 | 4Q | net_income | 1206억 | NI=1206억 vs OP=-42억 (28.5x) |
| 000430 | 대원강업 | 2021 | 4Q | net_income | 86억 | NI=86억 vs OP=-4억 (19.3x) |
| 000440 | 중앙에너비스 | 2020 | 4Q | net_income | 190억 | NI=190억 vs OP=-2억 (117.8x) |
| 000480 | 시알홀딩스 | 2020 | 2Q | net_income | 350억 | NI=350억 vs OP=-18억 (19.2x) |
| 000640 | 동아쏘시오홀딩스 | 2018 | 4Q | net_income | -1875억 | NI=-1875억 vs OP=140억 (13.4x) |
| 000640 | 동아쏘시오홀딩스 | 2020 | 4Q | net_income | 1347억 | NI=1347억 vs OP=99억 (13.6x) |
| 000650 | 천일고속 | 2017 | 3Q | net_income | 248억 | NI=248억 vs OP=-8억 (30.9x) |
| 000670 | 영풍 | 2016 | 1Q | net_income | 269억 | NI=269억 vs OP=-17억 (15.8x) |
| 000670 | 영풍 | 2017 | 2Q | net_income | 387억 | NI=387억 vs OP=20억 (19.5x) |
| 000670 | 영풍 | 2025 | 3Q | net_income | -1280억 | NI=-1280억 vs OP=-88억 (14.6x) |
| 000680 | LS네트웍스 | 2017 | 2Q | net_income | 88억 | NI=88억 vs OP=-3억 (34.3x) |
| 000680 | LS네트웍스 | 2018 | 2Q | net_income | 149억 | NI=149억 vs OP=-14억 (10.3x) |
| 000680 | LS네트웍스 | 2019 | 3Q | net_income | -647억 | NI=-647억 vs OP=-46억 (14.0x) |
| 000680 | LS네트웍스 | 2021 | 3Q | net_income | 152억 | NI=152억 vs OP=-4억 (39.2x) |
| 000680 | LS네트웍스 | 2022 | 1Q | net_income | 66억 | NI=66억 vs OP=5억 (13.5x) |
| 000680 | LS네트웍스 | 2025 | 3Q | net_income | -39억 | NI=-39억 vs OP=-3억 (12.7x) |
| 000700 | 유수홀딩스 | 2020 | 2Q | net_income | 53억 | NI=53억 vs OP=2억 (30.4x) |
| 000760 | 이화산업 | 2021 | 1Q | net_income | 633억 | NI=633억 vs OP=-11억 (60.0x) |
| 000800 | 경남기업 | 2018 | 2Q | net_income | 182억 | NI=182억 vs OP=-9억 (21.2x) |
| 000850 | 화천기공 | 2024 | 2Q | net_income | 39억 | NI=39억 vs OP=-1억 (27.9x) |
| 000850 | 화천기공 | 2025 | 1Q | net_income | 16억 | NI=16억 vs OP=1억 (10.9x) |
| 000860 | 강남제비스코 | 2018 | 1Q | net_income | 33억 | NI=33억 vs OP=1억 (31.4x) |
| 000860 | 강남제비스코 | 2020 | 4Q | net_income | 98억 | NI=98억 vs OP=2억 (49.3x) |
| 000860 | 강남제비스코 | 2021 | 1Q | net_income | 901억 | NI=901억 vs OP=-6억 (147.8x) |
| 000880 | 한화 | 2018 | 4Q | net_income | -3843억 | NI=-3843억 vs OP=-135억 (28.4x) |
| 000890 | 보해양조 | 2024 | 4Q | net_income | 54억 | NI=54억 vs OP=3억 (16.8x) |
| 000910 | 유니온 | 2018 | 2Q | net_income | -243억 | NI=-243억 vs OP=11억 (22.7x) |
| 000910 | 유니온 | 2018 | 4Q | net_income | -480억 | NI=-480억 vs OP=2억 (195.7x) |
| 000910 | 유니온 | 2019 | 1Q | net_income | -69억 | NI=-69억 vs OP=-2억 (28.8x) |

*...and 2622 more entries (truncated)*


### Q4 Revenue Too Large (77 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 002620 | 제일파마홀딩스 | 2018 | 4Q | revenue | 950억 | Q4=950억 > 500% of avg Q1-Q3=159억 |
| 003090 | 대웅 | 2016 | 4Q | revenue | 9769억 | Q4=9769억 > 500% of avg Q1-Q3=1668억 |
| 003480 | 한진중공업홀딩스 | 2017 | 4Q | revenue | 8316억 | Q4=8316억 > 500% of avg Q1-Q3=573억 |
| 003580 | HLB글로벌 | 2019 | 4Q | revenue | 235억 | Q4=235억 > 500% of avg Q1-Q3=38억 |
| 005110 | 한창 | 2016 | 4Q | revenue | 447억 | Q4=447억 > 500% of avg Q1-Q3=76억 |
| 005870 | 휴니드테크놀러지스 | 2016 | 4Q | revenue | 1459억 | Q4=1459억 > 500% of avg Q1-Q3=110억 |
| 005870 | 휴니드테크놀러지스 | 2017 | 4Q | revenue | 1572억 | Q4=1572억 > 500% of avg Q1-Q3=79억 |
| 005870 | 휴니드테크놀러지스 | 2020 | 4Q | revenue | 1322억 | Q4=1322억 > 500% of avg Q1-Q3=220억 |
| 006040 | 동원산업 | 2022 | 4Q | revenue | 6.5조 | Q4=6.5조 > 500% of avg Q1-Q3=8578억 |
| 007700 | F&F 홀딩스 | 2021 | 4Q | revenue | 5651억 | Q4=5651억 > 500% of avg Q1-Q3=540억 |
| 009440 | KC그린홀딩스 | 2023 | 4Q | revenue | 6867억 | Q4=6867억 > 500% of avg Q1-Q3=39억 |
| 012170 | 아센디오 | 2017 | 4Q | revenue | 258억 | Q4=258억 > 500% of avg Q1-Q3=34억 |
| 021080 | 에이티넘인베스트 | 2021 | 4Q | revenue | 873억 | Q4=873억 > 500% of avg Q1-Q3=101억 |
| 027580 | 상보 | 2020 | 4Q | revenue | 878억 | Q4=878억 > 500% of avg Q1-Q3=140억 |
| 028300 | HLB | 2021 | 4Q | revenue | 437억 | Q4=437억 > 500% of avg Q1-Q3=87억 |
| 035620 | 바른손이앤에이 | 2019 | 4Q | revenue | 113억 | Q4=113억 > 500% of avg Q1-Q3=19억 |
| 039200 | 오스코텍 | 2018 | 4Q | revenue | 154억 | Q4=154억 > 500% of avg Q1-Q3=11억 |
| 039200 | 오스코텍 | 2025 | 4Q | revenue | 789억 | Q4=789억 > 500% of avg Q1-Q3=70억 |
| 042940 | 상지건설 | 2019 | 4Q | revenue | 983억 | Q4=983억 > 500% of avg Q1-Q3=22억 |
| 043580 | 에임하이글로벌 | 2017 | 4Q | revenue | 200억 | Q4=200억 > 500% of avg Q1-Q3=11억 |
| 046390 | 삼화네트웍스 | 2021 | 4Q | revenue | 278억 | Q4=278억 > 500% of avg Q1-Q3=17억 |
| 048530 | 인트론바이오 | 2018 | 4Q | revenue | 138억 | Q4=138억 > 500% of avg Q1-Q3=23억 |
| 052020 | 에스티큐브 | 2016 | 4Q | revenue | 114억 | Q4=114억 > 500% of avg Q1-Q3=13억 |
| 052190 | 세영디앤씨 | 2018 | 4Q | revenue | 122억 | Q4=122억 > 500% of avg Q1-Q3=24억 |
| 052300 | 오션인더블유 | 2021 | 4Q | revenue | 505억 | Q4=505억 > 500% of avg Q1-Q3=39억 |
| 054620 | APS | 2024 | 4Q | revenue | 723억 | Q4=723억 > 500% of avg Q1-Q3=72억 |
| 056080 | 유진로봇 | 2025 | 4Q | revenue | 204억 | Q4=204억 > 500% of avg Q1-Q3=26억 |
| 056730 | CNT85 | 2018 | 4Q | revenue | 101억 | Q4=101억 > 500% of avg Q1-Q3=18억 |
| 058530 | 파나케이아 | 2023 | 4Q | revenue | 173억 | Q4=173억 > 500% of avg Q1-Q3=15억 |
| 058530 | 파나케이아 | 2024 | 4Q | revenue | 112억 | Q4=112억 > 500% of avg Q1-Q3=22억 |
| 060900 | 에이전트AI | 2021 | 4Q | revenue | 157억 | Q4=157억 > 500% of avg Q1-Q3=22억 |
| 064240 | 홈캐스트 | 2025 | 4Q | revenue | 746억 | Q4=746억 > 500% of avg Q1-Q3=104억 |
| 065150 | 대산F&B | 2023 | 4Q | revenue | 128.7조 | Q4=128.7조 > 500% of avg Q1-Q3=323억 |
| 067630 | HLB생명과학 | 2016 | 4Q | revenue | 281억 | Q4=281억 > 500% of avg Q1-Q3=47억 |
| 072770 | 멤레이비티 | 2024 | 4Q | revenue | 842억 | Q4=842억 > 500% of avg Q1-Q3=153억 |
| 079950 | 인베니아 | 2023 | 4Q | revenue | 160억 | Q4=160억 > 500% of avg Q1-Q3=22억 |
| 083790 | CG인바이츠 | 2019 | 4Q | revenue | 107억 | Q4=107억 > 500% of avg Q1-Q3=11억 |
| 089150 | 케이씨티 | 2021 | 4Q | revenue | 90억 | Q4=90억 > 500% of avg Q1-Q3=16억 |
| 090470 | 제이스텍 | 2025 | 4Q | revenue | 198억 | Q4=198억 > 500% of avg Q1-Q3=36억 |
| 092870 | 엑시콘 | 2016 | 4Q | revenue | 285억 | Q4=285억 > 500% of avg Q1-Q3=55억 |
| 092870 | 엑시콘 | 2025 | 4Q | revenue | 451억 | Q4=451억 > 500% of avg Q1-Q3=70억 |
| 095700 | 제넥신 | 2017 | 4Q | revenue | 185억 | Q4=185억 > 500% of avg Q1-Q3=33억 |
| 108230 | 톱텍 | 2023 | 4Q | revenue | 4052억 | Q4=4052억 > 500% of avg Q1-Q3=655억 |
| 110990 | 디아이티 | 2020 | 4Q | revenue | 180억 | Q4=180억 > 500% of avg Q1-Q3=35억 |
| 118000 | 메타케어 | 2023 | 4Q | revenue | 430억 | Q4=430억 > 500% of avg Q1-Q3=83억 |
| 119860 | 커넥트웨이브 | 2022 | 4Q | revenue | 3283억 | Q4=3283억 > 500% of avg Q1-Q3=414억 |
| 140910 | 에이리츠 | 2018 | 4Q | revenue | 158억 | Q4=158억 > 500% of avg Q1-Q3=23억 |
| 145270 | 케이탑리츠 | 2021 | 4Q | revenue | 224억 | Q4=224억 > 500% of avg Q1-Q3=32억 |
| 145270 | 케이탑리츠 | 2023 | 4Q | revenue | 170억 | Q4=170억 > 500% of avg Q1-Q3=33억 |
| 148140 | 비디아이 | 2018 | 4Q | revenue | 642억 | Q4=642억 > 500% of avg Q1-Q3=72억 |

*...and 27 more entries (truncated)*


### Q4 Revenue Too Small (37 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 001970 | 에스지신성건설 | 2024 | 4Q | revenue | 31억 | Q4=31억 < 10% of avg Q1-Q3=455억 |
| 003080 | SB성보 | 2016 | 4Q | revenue | 14억 | Q4=14억 < 10% of avg Q1-Q3=189억 |
| 003080 | SB성보 | 2017 | 4Q | revenue | 15억 | Q4=15억 < 10% of avg Q1-Q3=189억 |
| 003080 | SB성보 | 2018 | 4Q | revenue | 8억 | Q4=8억 < 10% of avg Q1-Q3=163억 |
| 003080 | SB성보 | 2020 | 4Q | revenue | 10억 | Q4=10억 < 10% of avg Q1-Q3=169억 |
| 003080 | SB성보 | 2021 | 4Q | revenue | 17억 | Q4=17억 < 10% of avg Q1-Q3=187억 |
| 003080 | SB성보 | 2025 | 4Q | revenue | 17억 | Q4=17억 < 10% of avg Q1-Q3=209억 |
| 033200 | 모아텍 | 2025 | 4Q | revenue | 9억 | Q4=9억 < 10% of avg Q1-Q3=102억 |
| 046390 | 삼화네트웍스 | 2023 | 4Q | revenue | 7억 | Q4=7억 < 10% of avg Q1-Q3=205억 |
| 047920 | HLB제약 | 2017 | 4Q | revenue | 2억 | Q4=2억 < 10% of avg Q1-Q3=51억 |
| 048410 | 현대바이오 | 2024 | 4Q | revenue | 4억 | Q4=4억 < 10% of avg Q1-Q3=49억 |
| 058820 | CMG제약 | 2024 | 4Q | revenue | 267억 | Q4=267억 < 10% of avg Q1-Q3=7.6조 |
| 073540 | 에프알텍 | 2024 | 4Q | revenue | 93억 | Q4=93억 < 10% of avg Q1-Q3=1.9조 |
| 085310 | 엔케이 | 2020 | 4Q | revenue | 7억 | Q4=7억 < 10% of avg Q1-Q3=281억 |
| 102260 | 동성케미컬 | 2017 | 4Q | revenue | 1984억 | Q4=1984억 < 10% of avg Q1-Q3=70463.8조 |
| 104620 | 노랑풍선 | 2020 | 4Q | revenue | 4억 | Q4=4억 < 10% of avg Q1-Q3=65억 |
| 119500 | 포메탈 | 2025 | 4Q | revenue | 0 | Q4=0 < 10% of avg Q1-Q3=170억 |
| 136510 | 스마트솔루션즈 | 2022 | 4Q | revenue | 6억 | Q4=6억 < 10% of avg Q1-Q3=66억 |
| 140910 | 에이리츠 | 2016 | 4Q | revenue | 0 | Q4=0 < 10% of avg Q1-Q3=112억 |
| 140910 | 에이리츠 | 2021 | 4Q | revenue | 2억 | Q4=2억 < 10% of avg Q1-Q3=24억 |
| 155960 | 지디 | 2017 | 4Q | revenue | 1억 | Q4=1억 < 10% of avg Q1-Q3=42억 |
| 160600 | 이큐셀 | 2025 | 4Q | revenue | 47억 | Q4=47억 < 10% of avg Q1-Q3=10597.0조 |
| 195440 | 퓨전 | 2021 | 4Q | revenue | 1,388,480 | Q4=1,388,480 < 10% of avg Q1-Q3=13억 |
| 197210 | 리드 | 2017 | 4Q | revenue | 11억 | Q4=11억 < 10% of avg Q1-Q3=133억 |
| 197210 | 리드 | 2020 | 4Q | revenue | 34,347,364 | Q4=34,347,364 < 10% of avg Q1-Q3=25억 |
| 205470 | 휴마시스 | 2022 | 4Q | revenue | 52억 | Q4=52억 < 10% of avg Q1-Q3=1552억 |
| 226950 | 올릭스 | 2024 | 4Q | revenue | 45,214,014 | Q4=45,214,014 < 10% of avg Q1-Q3=19억 |
| 234080 | JW생명과학 | 2021 | 4Q | revenue | 444억 | Q4=444억 < 10% of avg Q1-Q3=14.3조 |
| 234920 | 자이글 | 2022 | 4Q | revenue | 2억 | Q4=2억 < 10% of avg Q1-Q3=49억 |
| 253840 | 수젠텍 | 2022 | 4Q | revenue | 19억 | Q4=19억 < 10% of avg Q1-Q3=332억 |
| 269620 | 시스웍 | 2022 | 4Q | revenue | 34,947,014 | Q4=34,947,014 < 10% of avg Q1-Q3=88억 |
| 293580 | 나우IB | 2024 | 4Q | revenue | 3억 | Q4=3억 < 10% of avg Q1-Q3=104억 |
| 298380 | 에이비엘바이오 | 2025 | 4Q | revenue | 0 | Q4=0 < 10% of avg Q1-Q3=264억 |
| 310210 | 보로노이 | 2025 | 4Q | revenue | 22,056,000 | Q4=22,056,000 < 10% of avg Q1-Q3=25억 |
| 330730 | 스톤브릿지벤처스 | 2022 | 4Q | revenue | 8억 | Q4=8억 < 10% of avg Q1-Q3=96억 |
| 383800 | LX홀딩스 | 2022 | 4Q | revenue | 50억 | Q4=50억 < 10% of avg Q1-Q3=773억 |
| 383930 | 디티앤씨알오 | 2023 | 4Q | revenue | 8억 | Q4=8억 < 10% of avg Q1-Q3=86억 |

### Revenue YoY Drop (>50%) (612 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 000040 | KR모터스 | 2017 | - | revenue | 417억 | 2017 rev=417억 vs 2016 rev=848억 (-51%) |
| 000040 | KR모터스 | 2024 | - | revenue | 160억 | 2024 rev=160억 vs 2023 rev=784억 (-80%) |
| 000210 | DL | 2020 | - | revenue | 1.6조 | 2020 rev=1.6조 vs 2019 rev=9.7조 (-84%) |
| 000230 | 일동홀딩스 | 2016 | - | revenue | 408억 | 2016 rev=408억 vs 2015 rev=4764억 (-91%) |
| 000240 | 한국앤컴퍼니 | 2016 | - | revenue | 903억 | 2016 rev=903억 vs 2015 rev=2236억 (-60%) |
| 000300 | DH오토넥스 | 2023 | - | revenue | 328억 | 2023 rev=328억 vs 2022 rev=5367억 (-94%) |
| 000360 | 삼환기업 | 2018 | - | revenue | 1679억 | 2018 rev=1679억 vs 2015 rev=4662억 (-64%) |
| 000370 | 한화손해보험 | 2023 | - | revenue | 3742억 | 2023 rev=3742억 vs 2022 rev=5.9조 (-94%) |
| 000400 | 롯데손해보험 | 2023 | - | revenue | 3425억 | 2023 rev=3425억 vs 2022 rev=2.5조 (-86%) |
| 000800 | 경남기업 | 2018 | - | revenue | 2405억 | 2018 rev=2405억 vs 2015 rev=6367억 (-62%) |
| 000810 | 삼성화재해상보험 | 2023 | - | revenue | 2.1조 | 2023 rev=2.1조 vs 2022 rev=19.6조 (-89%) |
| 001140 | 국보 | 2023 | - | revenue | 474억 | 2023 rev=474억 vs 2022 rev=1023억 (-54%) |
| 001210 | 금호전기 | 2018 | - | revenue | 773억 | 2018 rev=773억 vs 2017 rev=3387억 (-77%) |
| 001230 | 동국홀딩스 | 2023 | - | revenue | 1.8조 | 2023 rev=1.8조 vs 2022 rev=8.5조 (-78%) |
| 001500 | 현대차증권 | 2025 | - | revenue | 3434억 | 2025 rev=3434억 vs 2024 rev=1.8조 (-81%) |
| 001800 | 오리온홀딩스 | 2017 | - | revenue | 1127억 | 2017 rev=1127억 vs 2016 rev=2.4조 (-95%) |
| 002290 | 삼일기업공사 | 2016 | - | revenue | 282억 | 2016 rev=282억 vs 2015 rev=733억 (-61%) |
| 002420 | 세기상사 | 2020 | - | revenue | 22억 | 2020 rev=22억 vs 2019 rev=51억 (-57%) |
| 002620 | 제일파마홀딩스 | 2017 | - | revenue | 444억 | 2017 rev=444억 vs 2016 rev=6173억 (-93%) |
| 002630 | 오리엔트바이오 | 2019 | - | revenue | 316억 | 2019 rev=316억 vs 2018 rev=1212억 (-74%) |
| 002870 | 신풍 | 2020 | - | revenue | 338억 | 2020 rev=338억 vs 2019 rev=1569억 (-78%) |
| 002880 | 대유에이텍 | 2023 | - | revenue | 5669억 | 2023 rev=5669억 vs 2022 rev=1.4조 (-60%) |
| 003280 | 흥아해운 | 2019 | - | revenue | 1022억 | 2019 rev=1022억 vs 2018 rev=7539억 (-86%) |
| 003300 | 한일홀딩스 | 2022 | - | revenue | 401억 | 2022 rev=401억 vs 2021 rev=1.8조 (-98%) |
| 003480 | 한진중공업홀딩스 | 2016 | - | revenue | 3000억 | 2016 rev=3000억 vs 2015 rev=1.3조 (-77%) |
| 003690 | 코리안리 | 2023 | - | revenue | 2426억 | 2023 rev=2426억 vs 2022 rev=7.7조 (-97%) |
| 004740 | 보루네오가구 | 2018 | - | revenue | 16억 | 2018 rev=16억 vs 2016 rev=324억 (-95%) |
| 004800 | 효성 | 2018 | - | revenue | 3.0조 | 2018 rev=3.0조 vs 2017 rev=12.5조 (-76%) |
| 004870 | 티웨이홀딩스 | 2020 | - | revenue | 2769억 | 2020 rev=2769억 vs 2019 rev=8175억 (-66%) |
| 004870 | 티웨이홀딩스 | 2022 | - | revenue | 115억 | 2022 rev=115억 vs 2021 rev=2267억 (-95%) |
| 005070 | 코스모신소재 | 2019 | - | revenue | 2439억 | 2019 rev=2439억 vs 2018 rev=5340억 (-54%) |
| 005090 | SGC에너지 | 2020 | - | revenue | 1065억 | 2020 rev=1065억 vs 2019 rev=2842억 (-63%) |
| 005110 | 한창 | 2024 | - | revenue | 31억 | 2024 rev=31억 vs 2023 rev=663억 (-95%) |
| 005450 | 신한 | 2020 | - | revenue | 23억 | 2020 rev=23억 vs 2019 rev=375억 (-94%) |
| 005830 | DB손해보험 | 2023 | - | revenue | 1.8조 | 2023 rev=1.8조 vs 2022 rev=18.9조 (-91%) |
| 005940 | NH투자증권 | 2023 | - | revenue | 1.6조 | 2023 rev=1.6조 vs 2022 rev=11.2조 (-86%) |
| 006380 | 카프로 | 2023 | - | revenue | 756억 | 2023 rev=756억 vs 2022 rev=4272억 (-82%) |
| 006380 | 카프로 | 2024 | - | revenue | 71억 | 2024 rev=71억 vs 2023 rev=756억 (-91%) |
| 007540 | 샘표 | 2016 | - | revenue | 203억 | 2016 rev=203억 vs 2015 rev=2614억 (-92%) |
| 007630 | 폴루스바이오팜 | 2018 | - | revenue | 102억 | 2018 rev=102억 vs 2017 rev=296억 (-66%) |
| 007630 | 폴루스바이오팜 | 2021 | - | revenue | 32,714,533 | 2021 rev=32,714,533 vs 2020 rev=65억 (-99%) |
| 007680 | 대원 | 2025 | - | revenue | 1121억 | 2025 rev=1121억 vs 2024 rev=2772억 (-60%) |
| 008060 | 대덕 | 2020 | - | revenue | 34억 | 2020 rev=34억 vs 2019 rev=1.1조 (-100%) |
| 008700 | 아남전자 | 2019 | - | revenue | 2억 | 2019 rev=2억 vs 2018 rev=1923억 (-100%) |
| 008800 | 행남사 | 2025 | - | revenue | 4억 | 2025 rev=4억 vs 2024 rev=73억 (-95%) |
| 009310 | 참엔지니어링 | 2023 | - | revenue | 763억 | 2023 rev=763억 vs 2022 rev=1706억 (-55%) |
| 009440 | KC그린홀딩스 | 2019 | - | revenue | 137억 | 2019 rev=137억 vs 2018 rev=5347억 (-97%) |
| 009540 | HD한국조선해양 | 2017 | - | revenue | 15.5조 | 2017 rev=15.5조 vs 2016 rev=39.3조 (-61%) |
| 009810 | 플레이그램 | 2018 | - | revenue | 65억 | 2018 rev=65억 vs 2017 rev=281억 (-77%) |
| 010600 | 웰바이오텍 | 2023 | - | revenue | 721억 | 2023 rev=721억 vs 2022 rev=1581억 (-54%) |

*...and 562 more entries (truncated)*


### Revenue YoY Spike (>300%) (147 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 000230 | 일동홀딩스 | 2019 | - | revenue | 2922억 | 2019 rev=2922억 vs 2018 rev=471억 (+521%) |
| 000240 | 한국앤컴퍼니 | 2017 | - | revenue | 8248억 | 2017 rev=8248억 vs 2016 rev=903억 (+813%) |
| 000680 | LS네트웍스 | 2024 | - | revenue | 1.9조 | 2024 rev=1.9조 vs 2023 rev=3796억 (+409%) |
| 0009K0 | 에임드바이오 | 2025 | - | revenue | 473억 | 2025 rev=473억 vs 2024 rev=118억 (+302%) |
| 001800 | 오리온홀딩스 | 2018 | - | revenue | 2.0조 | 2018 rev=2.0조 vs 2017 rev=1127억 (+1672%) |
| 002420 | 세기상사 | 2021 | - | revenue | 179억 | 2021 rev=179억 vs 2020 rev=22억 (+700%) |
| 002620 | 제일파마홀딩스 | 2019 | - | revenue | 7311억 | 2019 rev=7311억 vs 2018 rev=1427억 (+412%) |
| 003300 | 한일홀딩스 | 2023 | - | revenue | 2.4조 | 2023 rev=2.4조 vs 2022 rev=401억 (+5797%) |
| 005090 | SGC에너지 | 2021 | - | revenue | 1.9조 | 2021 rev=1.9조 vs 2020 rev=1065억 (+1682%) |
| 005450 | 신한 | 2017 | - | revenue | 467억 | 2017 rev=467억 vs 2016 rev=58억 (+701%) |
| 005720 | 넥센 | 2018 | - | revenue | 1.4조 | 2018 rev=1.4조 vs 2017 rev=3140억 (+333%) |
| 007540 | 샘표 | 2017 | - | revenue | 2744억 | 2017 rev=2744억 vs 2016 rev=203억 (+1251%) |
| 008000 | 도레이케미칼 | 2016 | - | revenue | 8565억 | 2016 rev=8565억 vs 2015 rev=2079억 (+312%) |
| 008060 | 대덕 | 2021 | - | revenue | 1.4조 | 2021 rev=1.4조 vs 2020 rev=34억 (+40693%) |
| 009440 | KC그린홀딩스 | 2023 | - | revenue | 6985억 | 2023 rev=6985억 vs 2022 rev=143억 (+4770%) |
| 011930 | 신성이엔지 | 2017 | - | revenue | 9905억 | 2017 rev=9905억 vs 2016 rev=2172억 (+356%) |
| 012170 | 아센디오 | 2017 | - | revenue | 359억 | 2017 rev=359억 vs 2016 rev=58억 (+520%) |
| 019570 | 플루토스 | 2021 | - | revenue | 440억 | 2021 rev=440억 vs 2020 rev=89억 (+394%) |
| 019660 | 글로본 | 2018 | - | revenue | 298억 | 2018 rev=298억 vs 2017 rev=71억 (+319%) |
| 021050 | 서원 | 2024 | - | revenue | 1.2조 | 2024 rev=1.2조 vs 2023 rev=2332억 (+427%) |
| 023770 | 플레이위드 | 2019 | - | revenue | 560억 | 2019 rev=560억 vs 2018 rev=118억 (+374%) |
| 024850 | HLB이노베이션 | 2018 | - | revenue | 500억 | 2018 rev=500억 vs 2017 rev=106억 (+371%) |
| 025620 | 차AI헬스케어 | 2016 | - | revenue | 834억 | 2016 rev=834억 vs 2015 rev=80억 (+941%) |
| 028080 | 휴맥스홀딩스 | 2022 | - | revenue | 6974억 | 2022 rev=6974억 vs 2021 rev=78억 (+8891%) |
| 029480 | 광무 | 2022 | - | revenue | 782억 | 2022 rev=782억 vs 2021 rev=189억 (+313%) |
| 032350 | 롯데관광개발 | 2021 | - | revenue | 1071억 | 2021 rev=1071억 vs 2020 rev=168억 (+538%) |
| 032860 | 더라미 | 2021 | - | revenue | 473억 | 2021 rev=473억 vs 2020 rev=64억 (+642%) |
| 033790 | 피노 | 2020 | - | revenue | 251억 | 2020 rev=251억 vs 2019 rev=57억 (+337%) |
| 033790 | 피노 | 2024 | - | revenue | 307억 | 2024 rev=307억 vs 2023 rev=70억 (+340%) |
| 034810 | 해성산업 | 2020 | - | revenue | 4794억 | 2020 rev=4794억 vs 2019 rev=203억 (+2266%) |
| 036090 | 위지트 | 2024 | - | revenue | 3578억 | 2024 rev=3578억 vs 2023 rev=352억 (+915%) |
| 036220 | 오상헬스케어 | 2020 | - | revenue | 2580억 | 2020 rev=2580억 vs 2018 rev=561억 (+359%) |
| 036710 | 심텍홀딩스 | 2016 | - | revenue | 7900억 | 2016 rev=7900억 vs 2015 rev=1561억 (+406%) |
| 036830 | 솔브레인홀딩스 | 2021 | - | revenue | 4172억 | 2021 rev=4172억 vs 2020 rev=224억 (+1765%) |
| 038340 | 무궁화인포메이션테크놀로지 | 2024 | - | revenue | 337억 | 2024 rev=337억 vs 2023 rev=67억 (+407%) |
| 039200 | 오스코텍 | 2018 | - | revenue | 187억 | 2018 rev=187억 vs 2017 rev=39억 (+379%) |
| 039200 | 오스코텍 | 2020 | - | revenue | 435억 | 2020 rev=435억 vs 2019 rev=44억 (+895%) |
| 039200 | 오스코텍 | 2024 | - | revenue | 340억 | 2024 rev=340억 vs 2023 rev=50억 (+587%) |
| 040910 | 아이씨디 | 2016 | - | revenue | 2309억 | 2016 rev=2309억 vs 2015 rev=180억 (+1182%) |
| 041020 | 폴라리스오피스 | 2023 | - | revenue | 1079억 | 2023 rev=1079억 vs 2022 rev=242억 (+346%) |
| 041190 | 우리기술투자 | 2023 | - | revenue | 1707억 | 2023 rev=1707억 vs 2022 rev=354억 (+383%) |
| 043090 | 더테크놀로지 | 2023 | - | revenue | 159억 | 2023 rev=159억 vs 2022 rev=39억 (+308%) |
| 043580 | 에임하이글로벌 | 2017 | - | revenue | 233억 | 2017 rev=233억 vs 2016 rev=44억 (+424%) |
| 043710 | 서울리거 | 2019 | - | revenue | 784억 | 2019 rev=784억 vs 2018 rev=175억 (+348%) |
| 044180 | KD | 2022 | - | revenue | 1035억 | 2022 rev=1035억 vs 2021 rev=199억 (+419%) |
| 046390 | 삼화네트웍스 | 2019 | - | revenue | 542억 | 2019 rev=542억 vs 2018 rev=126억 (+332%) |
| 047820 | 초록뱀미디어 | 2016 | - | revenue | 1059억 | 2016 rev=1059억 vs 2015 rev=248억 (+326%) |
| 048530 | 인트론바이오 | 2020 | - | revenue | 454억 | 2020 rev=454억 vs 2019 rev=83억 (+444%) |
| 049180 | 셀루메드 | 2020 | - | revenue | 915억 | 2020 rev=915억 vs 2019 rev=179억 (+411%) |
| 053590 | 한국테크놀로지 | 2019 | - | revenue | 2162억 | 2019 rev=2162억 vs 2018 rev=116억 (+1771%) |

*...and 97 more entries (truncated)*


---

## Info Issues

### Annual Without Quarterly (745 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 000140 | 하이트진로홀딩스 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 0001A0 | 덕양에너젠 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 000370 | 한화손해보험 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 000400 | 롯데손해보험 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 0007C0 | 아크릴 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 000810 | 삼성화재해상보험 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 0009K0 | 에임드바이오 | 2024 | - | - | null | Annual data exists for 2024 but no quarterly entries |
| 0009K0 | 에임드바이오 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 0009K0 | 에임드바이오 | 2023 | - | - | null | Annual data exists for 2023 but no quarterly entries |
| 0011A0 | 액스비스 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 001270 | 부국증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 001450 | 현대해상 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 001500 | 현대차증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 0015S0 | 페스카로 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 002800 | 신신제약 | 2016 | - | - | null | Annual data exists for 2016 but no quarterly entries |
| 0030R0 | 대신밸류리츠 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 003470 | 유안타증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 003530 | 한화투자증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 003540 | 대신증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 003690 | 코리안리 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 0054V0 | 엔에이치스팩32호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 005830 | DB손해보험 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 005940 | NH투자증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 006620 | 동구바이오제약 | 2017 | - | - | null | Annual data exists for 2017 but no quarterly entries |
| 006800 | 미래에셋증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 007680 | 대원 | 2017 | - | - | null | Annual data exists for 2017 but no quarterly entries |
| 008000 | 도레이케미칼 | 2018 | - | - | null | Annual data exists for 2018 but no quarterly entries |
| 0088D0 | 메리츠제1호스팩 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0091W0 | 신영스팩11호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0093G0 | 미래에셋비전스팩8호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0096B0 | 삼성스팩12호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0096D0 | 미래에셋비전스팩9호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0097F0 | 미래에셋비전스팩10호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0098T0 | 교보19호스팩 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 009900 | 명신산업 | 2020 | - | - | null | Annual data exists for 2020 but no quarterly entries |
| 0099W0 | 미래에셋비전스팩11호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0099X0 | IBKS제25호스팩 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0101C0 | 하나36호스팩 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0105P0 | 유진스팩12호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0115H0 | 삼성스팩13호 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 0120G0 | 삼양바이오팜 | 2025 | - | - | null | Annual data exists for 2025 but no quarterly entries |
| 012210 | 삼미금속 | 2024 | - | - | null | Annual data exists for 2024 but no quarterly entries |
| 012210 | 삼미금속 | 2023 | - | - | null | Annual data exists for 2023 but no quarterly entries |
| 013890 | 지누스 | 2017 | - | - | null | Annual data exists for 2017 but no quarterly entries |
| 016360 | 삼성증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 017860 | DS단석 | 2023 | - | - | null | Annual data exists for 2023 but no quarterly entries |
| 018250 | 애경산업 | 2017 | - | - | null | Annual data exists for 2017 but no quarterly entries |
| 024110 | 기업은행 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 030610 | 교보증권 | 2022 | - | - | null | Annual data exists for 2022 but no quarterly entries |
| 031210 | 서울보증보험 | 2024 | - | - | null | Annual data exists for 2024 but no quarterly entries |

*...and 695 more entries (truncated)*


### Null Annual Revenue (131 entries)

| Stock Code | Name | Year | Quarter | Field | Value | Detail |
|---|---|---|---|---|---|---|
| 001450 | 현대해상 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 0041L0 | 하나35호스팩 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 004440 | 삼일씨엔에스 | 2016 | - | revenue | null | Annual 2016 revenue is null |
| 0044K0 | 삼성스팩10호 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 004990 | 롯데지주 | 2015 | - | revenue | null | Annual 2015 revenue is null |
| 0071M0 | 삼성스팩11호 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 0093G0 | 미래에셋비전스팩8호 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 0099W0 | 미래에셋비전스팩11호 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 0115H0 | 삼성스팩13호 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 011810 | STX | 2015 | - | revenue | null | Annual 2015 revenue is null |
| 011810 | STX | 2016 | - | revenue | null | Annual 2016 revenue is null |
| 015110 | 중앙건설 | 2015 | - | revenue | null | Annual 2015 revenue is null |
| 015540 | 에코바이브 | 2024 | - | revenue | null | Annual 2024 revenue is null |
| 032680 | 소프트센 | 2022 | - | revenue | null | Annual 2022 revenue is null |
| 037640 | 지에스엔텍 | 2023 | - | revenue | null | Annual 2023 revenue is null |
| 037640 | 지에스엔텍 | 2024 | - | revenue | null | Annual 2024 revenue is null |
| 037640 | 지에스엔텍 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 039230 | 제이앤케이인더스트리 | 2021 | - | revenue | null | Annual 2021 revenue is null |
| 039230 | 제이앤케이인더스트리 | 2023 | - | revenue | null | Annual 2023 revenue is null |
| 039230 | 제이앤케이인더스트리 | 2024 | - | revenue | null | Annual 2024 revenue is null |
| 041460 | 한국전자인증 | 2017 | - | revenue | null | Annual 2017 revenue is null |
| 041460 | 한국전자인증 | 2018 | - | revenue | null | Annual 2018 revenue is null |
| 041460 | 한국전자인증 | 2019 | - | revenue | null | Annual 2019 revenue is null |
| 085810 | 알티캐스트 | 2017 | - | revenue | null | Annual 2017 revenue is null |
| 085810 | 알티캐스트 | 2018 | - | revenue | null | Annual 2018 revenue is null |
| 085810 | 알티캐스트 | 2019 | - | revenue | null | Annual 2019 revenue is null |
| 085810 | 알티캐스트 | 2020 | - | revenue | null | Annual 2020 revenue is null |
| 085810 | 알티캐스트 | 2021 | - | revenue | null | Annual 2021 revenue is null |
| 085810 | 알티캐스트 | 2022 | - | revenue | null | Annual 2022 revenue is null |
| 085810 | 알티캐스트 | 2023 | - | revenue | null | Annual 2023 revenue is null |
| 085810 | 알티캐스트 | 2024 | - | revenue | null | Annual 2024 revenue is null |
| 090740 | 와이앤넥스트 | 2024 | - | revenue | null | Annual 2024 revenue is null |
| 096760 | JW홀딩스 | 2015 | - | revenue | null | Annual 2015 revenue is null |
| 096760 | JW홀딩스 | 2016 | - | revenue | null | Annual 2016 revenue is null |
| 098400 | 엔스퍼트 | 2019 | - | revenue | null | Annual 2019 revenue is null |
| 115180 | 큐리언트 | 2016 | - | revenue | null | Annual 2016 revenue is null |
| 115180 | 큐리언트 | 2017 | - | revenue | null | Annual 2017 revenue is null |
| 115180 | 큐리언트 | 2018 | - | revenue | null | Annual 2018 revenue is null |
| 115180 | 큐리언트 | 2019 | - | revenue | null | Annual 2019 revenue is null |
| 115180 | 큐리언트 | 2020 | - | revenue | null | Annual 2020 revenue is null |
| 140890 | 트러스와이제7호위탁관리부동산투자회사 | 2018 | - | revenue | null | Annual 2018 revenue is null |
| 149980 | 하이로닉 | 2015 | - | revenue | null | Annual 2015 revenue is null |
| 182690 | 테라셈 | 2015 | - | revenue | null | Annual 2015 revenue is null |
| 192080 | 더블유게임즈 | 2015 | - | revenue | null | Annual 2015 revenue is null |
| 199730 | 바이오인프라 | 2024 | - | revenue | null | Annual 2024 revenue is null |
| 199730 | 바이오인프라 | 2025 | - | revenue | null | Annual 2025 revenue is null |
| 208340 | 파멥신 | 2019 | - | revenue | null | Annual 2019 revenue is null |
| 208870 | 하나머스트3호기업인수목적 | 2016 | - | revenue | null | Annual 2016 revenue is null |
| 215090 | 솔디펜스 | 2017 | - | revenue | null | Annual 2017 revenue is null |
| 215100 | 로보로보 | 2015 | - | revenue | null | Annual 2015 revenue is null |

*...and 81 more entries (truncated)*

