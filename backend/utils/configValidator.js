/**
 * Validates that all required environment variables are present.
 * Throws an error with a descriptive message if any are missing.
 */
const validateConfig = () => {
    const requiredVars = [
        'PORT',
        'MONGODB_URI',
        'JWT_SECRET',
        'BITCART_API_URL',
        'BITCART_ADMIN_TOKEN',
        'USDT_TRC20_WALLET_ID',
        'USDT_ERC20_WALLET_ID'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.error('❌ CRITICAL: Missing required environment variables:');
        missing.forEach(m => console.error(`   - ${m}`));
        console.error('\nPlease check your .env file and ensure all USDT and Bitcart configurations are set.\n');
        
        // In production, we should exit if critical config is missing
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    } else {
        console.log('✅ Configuration validated: All required environment variables are present.');
    }
};

module.exports = { validateConfig };
