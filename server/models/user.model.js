const mongoose = require("mongoose")

let riskProfileSchema = mongoose.Schema({
    investmentAmount: Number,
    timeHorizonYears: Number,
    riskTolerance: { type: String, enum: ['Low', 'Medium', 'High'] },
    dividendPreference: { type: String, enum: ['High Dividend', 'Balanced', 'Growth'] },
    ageRange: { type: String, enum: ['18-25', '25-40', '40+'] },
    monthlyInvestment: { type: Number, default: 0 },
    investmentGoal: { type: String, enum: ['Wealth Building', 'Passive Income', 'Retirement', 'Capital Growth'] },
    investorType: String,
    expectedReturnMin: Number,
    expectedReturnMax: Number,
    profileScore: Number,
    suggestedAllocation: mongoose.Schema.Types.Mixed
}, { _id: false })

let schema = mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true, lowercase: true },
    password: { type: String, require: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    riskProfile: riskProfileSchema,
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
    passwordResetToken: String,
    passwordResetExpiry: Date,
    refreshToken: String,
    otpCode: String,
    otpExpiry: Date,
    otpPurpose: String
}, { timestamps: true })

let User = mongoose.model("User", schema)
module.exports = { User }
