# DART OpenAPI 가이드

> API Key: `c1cb15169326b68bd3d68f63969f2cd67dad63be`
> Base URL: `https://opendart.fss.or.kr/api`
> 전부 무료, 일일 ~10,000건 제한

## 데이터 가용 범위

| 카테고리 | 데이터 시작 | 비고 |
|----------|------------|------|
| 재무제표 (주요계정/전체) | **2015년~** | 분기/반기/연간 모두 가능 |
| 사업보고서 정보 (배당/주주/직원 등) | **2015년~** | 연간 + 분기 |
| 재무지표 (ROE, 마진율 등) | **2023 Q3~** | 비교적 최근만 |
| 공시정보 검색 | 제한 없음 | |
| 지분공시 | 제한 없음 | |

**2015~2020년 등 과거 데이터도 모두 조회 가능 (재무지표 제외)**

## 보고서 코드 (reprt_code)

| 코드 | 보고서 |
|------|--------|
| `11013` | 1분기보고서 |
| `11012` | 반기보고서 |
| `11014` | 3분기보고서 |
| `11011` | 사업보고서 (연간) |

## 회사 식별자

DART API는 종목코드(6자리)가 아니라 **corp_code(8자리)**를 사용함.
- `/api/corpCode.xml`로 전체 매핑 다운로드 (ZIP → XML)
- 이미 `kr_company_names_en.json` 생성 시 다운로드한 데이터에서 매핑 가능

---

## 카테고리 1: 재무제표 (DS003) — 핵심

### 단일회사 주요계정
```
GET /api/fnlttSinglAcnt.json
  ?crtfc_key={KEY}&corp_code={8자리}&bsns_year=2024&reprt_code=11011&fs_div=CFS
```
- 매출액, 영업이익, 당기순이익, 총자산, 총부채, 자본총계 등
- `fs_div`: `CFS`(연결) / `OFS`(별도)
- 당기/전기/전전기 3개년 비교
- **금융회사(은행/보험/증권)도 조회 가능!** (KB금융 테스트 확인됨)

### 다중회사 주요계정 (배치)
```
GET /api/fnlttMultiAcnt.json
  ?crtfc_key={KEY}&corp_code=00126380,00164779,...&bsns_year=2024&reprt_code=11011
```
- **최대 100개 회사 동시 조회**
- 2,743개 회사 = ~28번 호출로 전체 갱신 가능
- 자동 데이터 파이프라인 핵심

### 단일회사 전체 재무제표
```
GET /api/fnlttSinglAcntAll.json
  ?crtfc_key={KEY}&corp_code={8자리}&bsns_year=2024&reprt_code=11014&fs_div=CFS
```
- BS(재무상태표), IS(손익계산서), CIS(포괄손익), CF(현금흐름), SCE(자본변동)
- 모든 XBRL 계정과목 포함 (EPS 직접 조회 가능)
- 금융업 포함

### 재무지표 (사전 계산된 비율)
```
GET /api/fnlttSinglIndx.json
  ?crtfc_key={KEY}&corp_code={8자리}&bsns_year=2024&reprt_code=11011&idx_cl_code=M210000
```
- `M210000`: 수익성 (매출총이익률, 영업이익률, 순이익률, ROE)
- `M220000`: 안정성 (부채비율, 유동비율)
- `M230000`: 성장성 (매출성장률, 영업이익성장률)
- `M240000`: 활동성 (총자산회전율)
- **2023 Q3 이후만 가능**
- 배치 버전: `/api/fnlttCmpnyIndx.json` (100개 동시)

---

## 카테고리 2: 사업보고서 정보 (DS002) — 28개 API

### 배당 현황
```
GET /api/alotMatter.json
  ?crtfc_key={KEY}&corp_code={8자리}&bsns_year=2024&reprt_code=11011
```
- 주당배당금(보통주/우선주), 배당수익률, 배당성향
- 당기/전기/전전기 비교

### 최대주주 현황
```
GET /api/hyslrSttus.json
  ?crtfc_key={KEY}&corp_code={8자리}&bsns_year=2024&reprt_code=11011
```
- 주주명, 관계, 보유주식수, 지분율

### 직원 현황
```
GET /api/empSttus.json
  ?crtfc_key={KEY}&corp_code={8자리}&bsns_year=2024&reprt_code=11011
```
- 사업부문별/성별 정규직/계약직 수, 평균근속연수, 연간급여총액, 1인평균급여

### 자기주식 취득/처분
```
GET /api/tesstkAcqsDspsSttus.json
```

### 임원 현황
```
GET /api/exctVSttus.json
```

### 감사인 및 감사의견
```
GET /api/accnutAdtorNmNdAdtOpinion.json
```

### 기타 (22개)
- 증자/감자, 소액주주, 사외이사, 임원보수(개인별/전체), 타법인출자, 주식총수,
  채무증권 발행실적, 기업어음/단기사채/회사채/신종자본증권/조건부자본증권 잔액,
  감사용역/비감사용역 계약, 공모/사모 자금사용내역 등

---

## 카테고리 3: 공시정보 (DS001)

### 공시 검색
```
GET /api/list.json
  ?crtfc_key={KEY}&corp_code={8자리}&bgn_de=20240101&end_de=20241231&page_count=100
```
- 공시유형별 필터링 가능
- 페이지네이션 (최대 100건/페이지)

### 기업 개황
```
GET /api/company.json
  ?crtfc_key={KEY}&corp_code={8자리}
```
- 회사명, 영문명, 종목코드, 대표자, 법인등록번호, 업종코드, 홈페이지, 주소, 결산월 등

### 고유번호 전체 목록
```
GET /api/corpCode.xml?crtfc_key={KEY}
```
- ZIP 다운로드 → XML 파싱
- corp_code ↔ stock_code 매핑, 영문 회사명 포함
- **이미 영문명 매핑에 사용함**

---

## 카테고리 4: 지분공시 (DS004)

### 대량보유 (5%+ 지분)
```
GET /api/majorstock.json
  ?crtfc_key={KEY}&corp_code={8자리}
```

### 임원/주요주주 소유
```
GET /api/elestock.json
  ?crtfc_key={KEY}&corp_code={8자리}
```

---

## 카테고리 5: 주요사항보고서 (DS005) — 36개 API

유상증자, 무상증자, 감자, 합병, 분할, 사업양수도, 자기주식처분,
채무불이행, 영업정지, 회생절차 등 기업 이벤트 정보

---

## 카테고리 6: 증권신고서 (DS006) — 6개 API

IPO, 채권발행, DR, 합병, 주식교환, 분할 관련 신고서 요약

---

## 프로젝트 활용 로드맵

### 즉시 가능
- [x] **영문 회사명** — corpCode.xml에서 추출 완료 (3,946/3,949개)

### 단기 (데이터 자동화)
- [ ] **분기 데이터 자동 갱신** — fnlttMultiAcnt로 2,743개사 재무데이터 일괄 업데이트
- [ ] **금융업 359개사 추가** — fnlttSinglAcnt가 금융업도 지원 (KB금융 테스트 확인)
- [ ] Python 스크립트: `scripts/update_kr_data_dart.py`

### 중기 (새 기능)
- [ ] **배당 정보** 섹션 추가 (alotMatter)
- [ ] **재무지표** 차트 추가 (ROE, 부채비율 등 — 2023 Q3~)
- [ ] **기업 프로필** 카드 (CEO, 설립일, 홈페이지 — company.json)
- [ ] **최대주주** 정보 표시

### 장기
- [ ] **최근 공시** 피드 (list.json)
- [ ] 전체 재무제표 상세보기 (fnlttSinglAcntAll)
- [ ] 대량보유 지분 변동 알림

---

## 에러 코드

| 코드 | 의미 |
|------|------|
| `000` | 정상 |
| `010` | 등록되지 않은 인증키 |
| `011` | 사용할 수 없는 인증키 |
| `013` | 조회된 데이터 없음 |
| `020` | 요청 제한 초과 (일일 한도) |
| `021` | 조회 가능 회사 개수 초과 (배치 최대 100) |
| `100` | 필드 오류 |
| `800` | 시스템 점검 |
| `900` | 정의되지 않은 오류 |

## 참고 링크

- [DART OpenAPI 메인](https://opendart.fss.or.kr/)
- [개발가이드](https://opendart.fss.or.kr/guide/main.do?apiGrpCd=DS001)
- [English Guide](https://engopendart.fss.or.kr/guide/main.do?apiGrpCd=DE001)
- [OpenDartReader (Python)](https://github.com/FinanceData/OpenDartReader)
- [dart-fss (Python)](https://dart-fss.readthedocs.io/)
- [재무정보 일괄다운로드](https://opendart.fss.or.kr/disclosureinfo/fnltt/dwld/main.do)
