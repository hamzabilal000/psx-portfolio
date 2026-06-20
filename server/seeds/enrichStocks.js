/**
 * Enrichment script — fetches real fundamentals from Yahoo Finance (via the AI service)
 * and updates each stock in MongoDB with live P/E, ROE, beta, volatility, 5yr return.
 *
 * Prerequisites:
 *   1. MongoDB must be running
 *   2. AI service must be running: cd ai-service && python main.py
 *   3. Stocks must already be seeded: node seeds/seedStocks.js
 *
 * Run: node seeds/enrichStocks.js
 */
require('dotenv').config()
const mongoose = require("mongoose")
const axios = require("axios")
const { Stock } = require("../models/stock.model")

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8001"
const DELAY_MS = 800   // polite delay between yfinance calls

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function enrich() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/psx-portfolio")
    console.log("MongoDB connected")

    const stocks = await Stock.find({ yahooTicker: { $exists: true, $ne: null } })
    console.log(`Found ${stocks.length} stocks with Yahoo tickers. Enriching...\n`)

    let success = 0, failed = 0

    for (const stock of stocks) {
        try {
            const res = await axios.get(`${AI_URL}/enrich/${stock.yahooTicker}`, { timeout: 15000 })
            const { data: enriched, success: ok } = res.data

            if (!ok || !enriched || Object.keys(enriched).length === 0) {
                console.log(`  ✗ ${stock.symbol.padEnd(8)} — no data`)
                failed++
            } else {
                await Stock.findByIdAndUpdate(stock._id, enriched)
                const keys = Object.keys(enriched).join(', ')
                console.log(`  ✓ ${stock.symbol.padEnd(8)} — updated: ${keys}`)
                success++
            }
        } catch (e) {
            const msg = e.response?.data?.error || e.message
            console.log(`  ✗ ${stock.symbol.padEnd(8)} — ${msg}`)
            failed++
        }
        await sleep(DELAY_MS)
    }

    await mongoose.disconnect()
    console.log(`\nDone! ${success} enriched, ${failed} failed.`)
    console.log("Re-seed prices if needed: node seeds/seedStocks.js")
}

enrich().catch(e => { console.error(e); process.exit(1) })
