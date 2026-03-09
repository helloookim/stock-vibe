/**
 * Data Loader for Korean stock financial data (restructured format)
 *
 * Data files:
 *   - kr_quarterly_00.json, kr_quarterly_01.json (pre-merged, EPS integrated)
 *   - kr_quarterly_index.json (chunk index)
 *   - kr_annual.json (pre-merged annual data)
 */

class DataLoader {
    constructor(indexFile) {
        this.indexFile = indexFile;
        this.index = null;
        this.loadedChunks = new Map();
        this.allData = null;
    }

    async init() {
        try {
            const response = await fetch(`/data/${this.indexFile}`);
            if (!response.ok) throw new Error(`Failed to load index: ${response.status}`);
            this.index = await response.json();
            return true;
        } catch (error) {
            console.error(`Error loading index ${this.indexFile}:`, error);
            return false;
        }
    }

    findChunkForCode(code) {
        if (!this.index) return null;
        for (const chunk of this.index.chunks) {
            if (code >= chunk.start && code <= chunk.end) return chunk;
        }
        return null;
    }

    async loadChunk(chunkIndex) {
        if (this.loadedChunks.has(chunkIndex)) return this.loadedChunks.get(chunkIndex);
        const chunk = this.index.chunks[chunkIndex];
        try {
            const response = await fetch(`/data/${chunk.file}`);
            if (!response.ok) throw new Error(`Failed to load chunk: ${response.status}`);
            const data = await response.json();
            this.loadedChunks.set(chunkIndex, data);
            return data;
        } catch (error) {
            console.error(`Error loading chunk ${chunk.file}:`, error);
            return null;
        }
    }

    async getCompany(code) {
        if (!this.index) await this.init();
        if (this.allData && this.allData[code]) return this.allData[code];
        const chunkInfo = this.findChunkForCode(code);
        if (!chunkInfo) return null;
        const chunkIndex = this.index.chunks.indexOf(chunkInfo);
        const chunkData = await this.loadChunk(chunkIndex);
        return chunkData ? chunkData[code] : null;
    }

    async loadAll() {
        if (this.allData) return this.allData;
        if (!this.index) await this.init();
        const chunks = await Promise.all(
            this.index.chunks.map((_, idx) => this.loadChunk(idx))
        );
        this.allData = {};
        chunks.forEach(chunk => { if (chunk) Object.assign(this.allData, chunk); });
        return this.allData;
    }
}

// Singleton loader for quarterly data (includes EPS)
const quarterlyDataLoader = new DataLoader('kr_quarterly_index.json');

// Backward-compatible alias (used by Home.jsx via financialDataLoader.getCompany())
export const financialDataLoader = quarterlyDataLoader;

// Cache for annual data
let annualDataCache = null;

/**
 * Load all quarterly financial data (pre-merged, includes EPS)
 */
export async function loadAllFinancialData() {
    return quarterlyDataLoader.loadAll();
}

/**
 * Load all annual financial data
 */
export async function loadAllAnnualFinancialData() {
    if (annualDataCache) return annualDataCache;
    try {
        const response = await fetch('/data/kr_annual.json');
        if (!response.ok) throw new Error(`Failed to load annual data: ${response.status}`);
        annualDataCache = await response.json();
        return annualDataCache;
    } catch (error) {
        console.error('Error loading annual data:', error);
        return {};
    }
}
