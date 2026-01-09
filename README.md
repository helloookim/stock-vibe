# 📊 QUANTVIBE - 한국 주식 재무 분석 대시보드

실시간 한국 주식 시장 재무 데이터 분석 및 시각화 웹 애플리케이션

## ✨ 주요 기능

- **📈 재무 데이터 시각화**: 분기별 매출액, 영업이익, 당기순이익, 영업이익률 차트
- **💰 EPS 분석**: 주당순이익(EPS) 및 YoY 변동률 시각화
- **🔍 다양한 정렬 옵션**:
  - 매출순 (기본)
  - 시가총액순
  - 영업이익순
  - 코드순
- **🎯 동종업계 비교**: 같은 섹터의 다른 기업 빠른 탐색
- **📅 기간 선택**: 듀얼 슬라이더로 분석 기간 조정
- **🔎 실시간 검색**: 종목코드 또는 회사명으로 빠른 검색
- **🎨 반응형 UI**: 사이드바 접기/펼치기, 다크 테마

## 📦 데이터 소스

- **재무 데이터**: DART (전자공시시스템)
- **시가총액**: FinanceDataReader API
- **처리 방식**:
  - 연결재무제표 우선
  - 별도재무제표 fallback
  - 금융/보험업 제외

## 🚀 로컬 개발

### 필수 요구사항

- Node.js 18+
- Python 3.8+
- npm 또는 yarn

### 설치

```bash
# 1. 저장소 클론
git clone https://github.com/helloookim/stock-vibe.git
cd stock-vibe

# 2. 의존성 설치
npm install

# Python 패키지 설치 (데이터 생성용)
pip install FinanceDataReader pandas
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 📊 데이터 생성 및 업데이트

### 1. 재무 데이터 생성

```bash
# DART 재무 데이터 처리
python process_data.py

# EPS 데이터 생성
python process_eps_data.py

# 데이터 분할 (Cloudflare Pages용)
python split_financial_data.py
```

### 2. 시가총액 데이터 생성

```bash
python generate_market_cap.py
```

이 스크립트는 FinanceDataReader API로 실시간 시가총액 데이터를 수집하여 `public/market_cap_data.json`에 저장합니다.

## 🌐 Cloudflare Pages 배포

### 빌드 설정

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node version**: 18

### 파일 크기 최적화

Cloudflare Pages는 파일당 25MB 제한이 있습니다. 이 프로젝트는 다음 전략으로 해결했습니다:

1. **대용량 JSON 분할**
   - `financial_data.json` → 5개 청크
   - `eps_data.json` → 6개 청크
   - 각 청크 < 7MB

2. **동적 로딩**
   - DataLoader 클래스로 청크 병렬 로드
   - 번들 크기: 568KB (압축 전)

3. **정적 파일 분리**
   - 시가총액 데이터는 `public/`에 위치
   - fetch()로 런타임 로드

## 📂 프로젝트 구조

```
korean_stock/
├── public/
│   ├── data/                    # 분할된 데이터 청크
│   │   ├── financial_data_*.json
│   │   ├── eps_data_*.json
│   │   └── *_index.json
│   └── market_cap_data.json     # 시가총액 데이터
├── src/
│   ├── App.jsx                  # 메인 React 컴포넌트
│   ├── dataLoader.js            # 청크 데이터 로더
│   └── index.css                # 스타일
├── process_data.py              # 재무 데이터 처리
├── process_eps_data.py          # EPS 데이터 처리
├── generate_market_cap.py       # 시가총액 데이터 생성
├── split_financial_data.py      # JSON 분할 스크립트
└── DEPLOYMENT.md                # 상세 배포 가이드
```

## 🔧 기술 스택

### Frontend
- React 18
- Recharts (데이터 시각화)
- Vite (빌드 도구)
- Lucide React (아이콘)

### Data Processing
- Python 3
- FinanceDataReader
- Pandas

### Deployment
- Cloudflare Pages
- GitHub Actions (자동 배포)

## 📝 데이터 업데이트 주기

- **재무 데이터**: 분기별 (DART 공시 기준)
- **시가총액**: 매일 (FinanceDataReader API)

## ⚠️ 주의사항

1. **대용량 원본 파일은 Git에 커밋하지 않습니다**
   - `financial_data.json` (39MB)
   - `eps_data.json` (17MB)
   - 이들은 `.gitignore`에 포함됨

2. **`public/data/` 청크 파일만 커밋합니다**
   - 각 파일 < 7MB
   - Git LFS 불필요

3. **데이터 업데이트 시 반드시 분할 실행**
   ```bash
   python split_financial_data.py
   ```

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 풀 리퀘스트 환영합니다!

## 📧 문의

프로젝트 관련 문의: [GitHub Issues](https://github.com/helloookim/stock-vibe/issues)
