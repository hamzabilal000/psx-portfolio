require('dotenv').config()
const mongoose = require("mongoose")
const { Stock } = require("../models/stock.model")
const { StockPrice } = require("../models/stockprice.model")
const stocks = require("./data/stocks.json")

// Approximate current prices (PKR) — update these or let scheduler fetch live
const seedPrices = {
    // Banking
    MEBL: 284, HBL: 260, UBL: 172, MCB: 240, BAFL: 96, ABL: 134, NBP: 51,
    BAHL: 148, FAYSAL: 44, AKBL: 62,
    // Cement
    LUCK: 870, DGKC: 105, CHCC: 108, MLCF: 55, FCCL: 36,
    KOHC: 145, PIOC: 88, ACPL: 310,
    // Fertilizer
    FFC: 142, EFERT: 98, FATIMA: 72, ENGRO: 315, FFBL: 28,
    // Tech
    SYS: 620, TRG: 88, NETSOL: 186, AVN: 72,
    // Oil & Gas
    OGDC: 121, PPL: 95, PSO: 318, MARI: 1870, APL: 585, SNGP: 68,
    // Power
    HUBC: 135, KAPCO: 58, KEL: 5, NCPL: 62,
    // Pharma / Healthcare
    SEARL: 190, ABOT: 750, GLAXO: 890, HINOON: 1240, SHEZ: 320,
    // Textile
    NML: 128, NCL: 74, GATM: 96, KTML: 55, ILP: 142,
    // FMCG
    NESTLE: 6850, COLG: 2480, NATF: 620, UPFL: 14200, UNITY: 82,
    // Insurance
    EFU: 310, IGIHL: 280, JLICL: 220, AICL: 180,
    // Steel
    ISL: 148, MUGHAL: 122, ASTL: 88,
    // Chemicals
    ICI: 720, LOTPTA: 38,
    // Real Estate
    DCR: 18,
    // Telecom
    PTCL: 18,
    // Auto
    PSMC: 680, INDU: 1580, HCAR: 420,
    // Consumer / Tobacco
    PAEL: 82, PMPK: 820
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/psx-portfolio")
    console.log("DB connected")

    await Stock.deleteMany({})
    await StockPrice.deleteMany({})

    await Stock.insertMany(stocks)
    console.log(`Seeded ${stocks.length} stocks`)

    let priceEntries = Object.entries(seedPrices).map(([symbol, price]) => ({
        symbol,
        price,
        source: 'seed'
    }))
    await StockPrice.insertMany(priceEntries)
    console.log(`Seeded ${priceEntries.length} stock prices`)

    await mongoose.disconnect()
    console.log("Done!")
}

seed().catch(e => { console.error(e); process.exit(1) })
