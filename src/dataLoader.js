/**
 * Data Loader for chunked financial data
 * Handles lazy loading of company data from split JSON files
 */

class DataLoader {
    constructor(dataType = 'financial_data') {
        this.dataType = dataType;
        this.index = null;
        this.loadedChunks = new Map();
        this.allData = null;
    }

    /**
     * Initialize by loading the index file
     */
    async init() {
        try {
            const response = await fetch(`/data/${this.dataType}_index.json`);
            if (!response.ok) {
                throw new Error(`Failed to load index: ${response.status}`);
            }
            this.index = await response.json();
            return true;
        } catch (error) {
            console.error(`Error loading ${this.dataType} index:`, error);
            return false;
        }
    }

    /**
     * Find which chunk contains a specific stock code
     */
    findChunkForCode(code) {
        if (!this.index) return null;

        for (const chunk of this.index.chunks) {
            if (code >= chunk.start && code <= chunk.end) {
                return chunk;
            }
        }
        return null;
    }

    /**
     * Load a specific chunk by index
     */
    async loadChunk(chunkIndex) {
        if (this.loadedChunks.has(chunkIndex)) {
            return this.loadedChunks.get(chunkIndex);
        }

        const chunk = this.index.chunks[chunkIndex];
        try {
            const response = await fetch(`/data/${chunk.file}`);
            if (!response.ok) {
                throw new Error(`Failed to load chunk: ${response.status}`);
            }
            const data = await response.json();
            this.loadedChunks.set(chunkIndex, data);
            return data;
        } catch (error) {
            console.error(`Error loading chunk ${chunk.file}:`, error);
            return null;
        }
    }

    /**
     * Get data for a specific company code
     */
    async getCompany(code) {
        if (!this.index) {
            await this.init();
        }

        // If all data is already loaded, return directly
        if (this.allData && this.allData[code]) {
            return this.allData[code];
        }

        // Find and load the chunk containing this code
        const chunkInfo = this.findChunkForCode(code);
        if (!chunkInfo) {
            return null;
        }

        const chunkIndex = this.index.chunks.indexOf(chunkInfo);
        const chunkData = await this.loadChunk(chunkIndex);

        return chunkData ? chunkData[code] : null;
    }

    /**
     * Load all data at once (for complete list)
     * This loads all chunks in parallel
     */
    async loadAll() {
        if (this.allData) {
            return this.allData;
        }

        if (!this.index) {
            await this.init();
        }

        console.log(`Loading all ${this.index.num_chunks} chunks for ${this.dataType}...`);

        // Load all chunks in parallel
        const chunkPromises = this.index.chunks.map((_, idx) => this.loadChunk(idx));
        const chunks = await Promise.all(chunkPromises);

        // Merge all chunks
        this.allData = {};
        chunks.forEach(chunk => {
            if (chunk) {
                Object.assign(this.allData, chunk);
            }
        });

        console.log(`Loaded ${Object.keys(this.allData).length} companies for ${this.dataType}`);
        return this.allData;
    }

    /**
     * Get all company codes (lightweight, from index only)
     */
    getAllCodes() {
        if (!this.index) return [];

        const codes = [];
        for (const chunk of this.index.chunks) {
            // Generate codes in range (this is approximate)
            // For exact codes, you'd need to load the chunks
            codes.push(chunk.start, chunk.end);
        }
        return codes;
    }

    /**
     * Preload specific chunks based on code ranges
     */
    async preloadRange(startCode, endCode) {
        if (!this.index) {
            await this.init();
        }

        const chunksToLoad = [];
        this.index.chunks.forEach((chunk, idx) => {
            if (chunk.start <= endCode && chunk.end >= startCode) {
                chunksToLoad.push(idx);
            }
        });

        const promises = chunksToLoad.map(idx => this.loadChunk(idx));
        await Promise.all(promises);
    }
}

// Create singleton instances
export const financialDataLoader = new DataLoader('financial_data');
export const financialDataSeparateLoader = new DataLoader('financial_data_separate');
export const epsDataLoader = new DataLoader('eps_data');

// Helper function to load and merge financial data (consolidated + separate)
export async function loadAllFinancialData() {
    const [consolidated, separate] = await Promise.all([
        financialDataLoader.loadAll(),
        financialDataSeparateLoader.loadAll()
    ]);

    // Merge both datasets
    return { ...consolidated, ...separate };
}

// Helper function to initialize all loaders
export async function initializeDataLoaders() {
    const results = await Promise.all([
        financialDataLoader.init(),
        financialDataSeparateLoader.init(),
        epsDataLoader.init()
    ]);

    return results.every(r => r === true);
}
