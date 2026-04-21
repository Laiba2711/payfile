/**
 * Validates that all required environment variables are present.
 * Logs warnings for missing optional vars and exits in production only
 * if the absolute critical ones (MongoDB + JWT) are absent.
 */
const validateConfig = () => {
    // Hard-required: app cannot function at all without these
    const criticalVars = [
        'MONGO_URI',
        'JWT_SECRET',
    ];

    // Important but the app can partially start without them (Bitcart features disabled)
    const importantVars = [
        'BITCART_HOST',
        'BITCART_API_KEY',
        'BITCART_STORE_ID',
        'BITCART_WALLET_ID',
        'BITCART_USDT_TRC20_WALLET_ID',
        'BITCART_USDT_ERC20_WALLET_ID',
        'BITCART_WEBHOOK_SECRET',
    ];

    const missingCritical = criticalVars.filter(v => !process.env[v]);
    const missingImportant = importantVars.filter(v => !process.env[v]);

    if (missingCritical.length > 0) {
        console.error('❌ CRITICAL: Missing required environment variables:');
        missingCritical.forEach(m => console.error(`   - ${m}`));
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }

    if (missingImportant.length > 0) {
        console.warn('⚠️  WARNING: Missing Bitcart/payment environment variables (payment features will be disabled):');
        missingImportant.forEach(m => console.warn(`   - ${m}`));
    }

    if (missingCritical.length === 0 && missingImportant.length === 0) {
        console.log('✅ Configuration validated: All environment variables are present.');
    }
};

module.exports = { validateConfig };
