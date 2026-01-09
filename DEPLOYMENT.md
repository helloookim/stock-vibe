# Cloudflare Pages 배포 가이드

## 문제점
Cloudflare Pages는 파일당 최대 25MB까지만 허용합니다. 원본 `financial_data.json`과 `eps_data.json` 파일이 이 제한을 초과하여 배포가 불가능했습니다.

## 해결 방법
대용량 JSON 파일을 작은 청크로 분할하고, 런타임에 동적으로 로드하는 방식으로 변경했습니다.

## 파일 구조

### 원본 파일 (Git에서 제외됨)
- `financial_data.json` (~29MB)
- `financial_data_separate.json` (~2.8MB)
- `eps_data.json` (~11MB)

### 분할된 파일 (Git에 포함됨)
```
public/data/
├── financial_data_00.json          (7.2MB)
├── financial_data_01.json          (7.1MB)
├── financial_data_02.json          (6.8MB)
├── financial_data_03.json          (5.9MB)
├── financial_data_04.json          (2.3MB)
├── financial_data_index.json       (860B)
├── financial_data_separate_00.json (2.8MB)
├── financial_data_separate_index.json (279B)
├── eps_data_00.json                (2.4MB)
├── eps_data_01.json                (2.5MB)
├── eps_data_02.json                (2.4MB)
├── eps_data_03.json                (2.2MB)
├── eps_data_04.json                (1.4MB)
├── eps_data_05.json                (238KB)
└── eps_data_index.json             (970B)
```

## 데이터 재생성 방법

### 1. Python 데이터 처리 스크립트 실행
```bash
# 원본 재무 데이터 생성
python process_data.py

# EPS 데이터 생성
python process_eps_data.py
```

### 2. 데이터 분할
```bash
# 대용량 JSON 파일을 청크로 분할
python split_financial_data.py
```

이 스크립트는 다음을 수행합니다:
- `financial_data.json` → 5개 청크
- `financial_data_separate.json` → 1개 청크
- `eps_data.json` → 6개 청크
- 각 데이터셋에 대한 인덱스 파일 생성

### 3. 빌드 및 배포
```bash
# 프로젝트 빌드
npm run build

# Cloudflare Pages에 배포 (자동 또는 수동)
```

## 동작 원리

### 데이터 로더 (`src/dataLoader.js`)
- 각 데이터셋에 대한 `DataLoader` 클래스 제공
- 인덱스 파일을 먼저 로드하여 청크 정보 확인
- 필요한 청크를 동적으로 로드 (lazy loading)
- 모든 청크를 병렬로 로드하여 성능 최적화

### React 앱 통합
```javascript
import { loadAllFinancialData, epsDataLoader } from './dataLoader';

// 앱 시작 시 모든 데이터 로드
const [financial, eps] = await Promise.all([
    loadAllFinancialData(),  // consolidated + separate 병합
    epsDataLoader.loadAll()
]);
```

## 장점

1. **Cloudflare Pages 호환**: 모든 파일이 25MB 이하
2. **빠른 초기 로딩**: 병렬 청크 로드로 성능 향상
3. **확장 가능**: 데이터가 더 커지면 `CHUNK_SIZE` 조정 가능
4. **메모리 효율적**: 필요한 청크만 선택적으로 로드 가능 (현재는 전체 로드)

## 설정

### 청크 크기 조정
`split_financial_data.py`의 `CHUNK_SIZE` 변수를 조정:

```python
CHUNK_SIZE = 500  # 회사 수 (현재 설정)
```

더 많은 회사가 추가되어 청크가 25MB를 초과하면 이 값을 줄이세요.

## 주의사항

1. 원본 JSON 파일은 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
2. `public/data/` 폴더의 청크 파일은 반드시 커밋하세요
3. 데이터 업데이트 시 반드시 `split_financial_data.py`를 실행하세요
4. 모든 청크가 25MB 이하인지 확인하세요 (스크립트가 자동으로 경고 표시)

## 배포 확인

배포 후 브라우저 개발자 도구의 Network 탭에서 다음을 확인:
- 인덱스 파일이 먼저 로드되는지
- 청크 파일이 병렬로 로드되는지
- 모든 파일이 성공적으로 로드되는지 (200 OK)
