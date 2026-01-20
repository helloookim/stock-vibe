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

// Helper function to load and merge financial data (consolidated + separate + income statement)
export async function loadAllFinancialData() {
    const [consolidated, separate, incomeStatement] = await Promise.all([
        financialDataLoader.loadAll(),
        financialDataSeparateLoader.loadAll(),
        fetch('/income_statement_revenue.json').then(r => r.json()).catch(() => ({}))
    ]);

    // Start with consolidated + separate
    const merged = { ...consolidated, ...separate };

    // Merge income statement data (for companies missing from 포괄손익계산서)
    // These are companies like 한화오션 that have revenue in 손익계산서 but not in 포괄손익계산서
    Object.entries(incomeStatement).forEach(([code, data]) => {
        if (!merged[code]) {
            // Company not in consolidated/separate - add entirely
            merged[code] = data;
        } else {
            // Company exists but might be missing revenue data
            // Update name and sector to latest (from income statement which uses 2025 Q3 data)
            merged[code].name = data.name;
            merged[code].sector = data.sector;

            // Merge history entries that have revenue
            const existingHistory = merged[code].history || [];
            const incomeHistory = data.history || [];

            incomeHistory.forEach(incomeEntry => {
                const existingEntry = existingHistory.find(
                    e => e.year === incomeEntry.year && e.quarter === incomeEntry.quarter
                );

                if (existingEntry) {
                    // Entry exists - fill in missing revenue if needed
                    if (existingEntry.revenue === null || existingEntry.revenue === undefined) {
                        existingEntry.revenue = incomeEntry.revenue;
                    }
                    if (existingEntry.op_profit === null || existingEntry.op_profit === undefined) {
                        existingEntry.op_profit = incomeEntry.op_profit;
                    }
                } else {
                    // Entry doesn't exist - add it
                    existingHistory.push(incomeEntry);
                }
            });

            // Sort history by year and quarter
            merged[code].history = existingHistory.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                const qOrder = { '1Q': 1, '2Q': 2, '3Q': 3, '4Q': 4 };
                return (qOrder[a.quarter] || 0) - (qOrder[b.quarter] || 0);
            });
        }
    });

    return merged;
}

// Helper function to load and merge annual financial data
export async function loadAllAnnualFinancialData() {
    const [annual, incomeStatementAnnual] = await Promise.all([
        fetch('/financial_data_annual.json').then(r => r.json()).catch(() => ({})),
        fetch('/income_statement_annual.json').then(r => r.json()).catch(() => ({}))
    ]);

    // Merge income statement annual data
    Object.entries(incomeStatementAnnual).forEach(([code, data]) => {
        if (!annual[code]) {
            // Company not in annual - add entirely
            annual[code] = data;
        } else {
            // Company exists but might be missing revenue data
            // Update name and sector to latest (from income statement which uses 2025 Q3 data)
            annual[code].name = data.name;
            annual[code].sector = data.sector;

            const existingHistory = annual[code].history || [];
            const incomeHistory = data.history || [];

            incomeHistory.forEach(incomeEntry => {
                const existingEntry = existingHistory.find(e => e.year === incomeEntry.year);

                if (existingEntry) {
                    // Entry exists - fill in missing revenue if needed
                    if (existingEntry.revenue === null || existingEntry.revenue === undefined) {
                        existingEntry.revenue = incomeEntry.revenue;
                    }
                    if (existingEntry.op_profit === null || existingEntry.op_profit === undefined) {
                        existingEntry.op_profit = incomeEntry.op_profit;
                    }
                    if (existingEntry.net_income === null || existingEntry.net_income === undefined) {
                        existingEntry.net_income = incomeEntry.net_income;
                    }
                } else {
                    // Entry doesn't exist - add it
                    existingHistory.push(incomeEntry);
                }
            });

            // Sort history by year
            annual[code].history = existingHistory.sort((a, b) => a.year - b.year);
        }
    });

    return annual;
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
