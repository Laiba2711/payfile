import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const useCheckout = (tokenId) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const pollingRef = useRef(null);
    // Track the latest status in a ref so the interval can read it
    // without needing to be re-created every time data changes.
    const statusRef = useRef(null);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const res = await axios.get(`/api/purchases/checkout/${tokenId}`);
            if (res.data.status === 'success') {
                const status = res.data.data.purchase?.status;
                statusRef.current = status;
                setData(res.data.data);
                return status;
            }
        } catch (err) {
            if (!silent) setError('Could not load payment details.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
        return null;
    }, [tokenId]);

    // Initial fetch — runs once on mount (or when tokenId changes).
    useEffect(() => {
        fetchData(false);
    }, [fetchData]);

    // Polling — depends only on tokenId/fetchData, NOT on data.
    // Using statusRef.current inside the interval means we always
    // read the latest status without re-creating the interval on every data update.
    // This prevents the polling storm (80+ simultaneous requests) that occurred
    // when setData() triggered the old effect to restart the interval every 10s.
    useEffect(() => {
        // Clear any existing interval first (e.g. on tokenId change)
        clearInterval(pollingRef.current);

        pollingRef.current = setInterval(async () => {
            // Stop polling if already completed or expired
            if (statusRef.current === 'completed') {
                clearInterval(pollingRef.current);
                return;
            }
            await fetchData(true);
        }, 10000);

        return () => clearInterval(pollingRef.current);
    }, [tokenId, fetchData]);

    const handleDownload = () => {
        const fileId = data?.purchase?.file?._id ?? data?.purchase?.sale?.file?._id;
        if (!fileId) return;
        window.open(`/api/files/public/download/${fileId}?token=${tokenId}`, '_blank');
    };

    const getPaymentInfo = () => {
        const inv = data?.invoice;
        const breakdown = data?.breakdown;
        const purchase = data?.purchase;
        if (!inv && !breakdown) return null;

        // Find the correct payment method from Bitcart's payments array.
        // Bitcart uses internal codes: BTC → 'BCL', USDT/TRC20 → 'USDTTRX' or 'USDT'
        const targetCode = purchase?.sale?.currency === 'USDT' ? 'USDT' : 'BTC';
        const BITCART_BTC_CODES = ['BTC', 'BCL', 'btc'];
        const BITCART_USDT_CODES = ['USDT', 'USDTTRX', 'trx', 'USDTETH'];

        // matchedPayment = the Bitcart payment entry that matches the sale currency (may be undefined)
        const matchedPayment = inv?.payments?.find(p =>
            targetCode === 'BTC'
                ? BITCART_BTC_CODES.includes(p.currency_code)
                : BITCART_USDT_CODES.includes(p.currency_code)
        );

        // anyPayment = fallback for amount/confirmations only — NOT for address
        const anyPayment = matchedPayment ?? inv?.payments?.[0];

        const amount = breakdown?.totalAmount ?? anyPayment?.amount ?? null;

        // IMPORTANT: Always use breakdown.currency (our DB value: 'BTC' or 'USDT')
        // never the raw Bitcart code like 'BCL' or 'USDTTRX'.
        const rawCurrency = breakdown?.currency ?? anyPayment?.currency_code ?? 'BTC';
        const CURRENCY_DISPLAY_MAP = { BCL: 'BTC', USDTTRX: 'USDT', USDTETH: 'USDT', trx: 'USDT' };
        const currency = CURRENCY_DISPLAY_MAP[rawCurrency] ?? rawCurrency;

        // ADDRESS: only use the matched payment's address — never a mismatched currency's address.
        // e.g. if sale is USDT but only a BTC payment exists in Bitcart, using its bc1 address
        // would be WRONG. Fall back to the seller's own address stored in our DB instead.
        const address = matchedPayment?.payment_address ?? breakdown?.sellerAddress ?? '';

        const paymentUrl = matchedPayment?.payment_url ?? null;
        const confirmations = anyPayment?.confirmations ?? 0;
        const required = anyPayment?.min_confirmations ?? 1;

        return {
            address,
            amount,
            currency,
            paymentUrl,
            confirmations,
            required,
        };
    };

    const purchase = data?.purchase;
    const invoice = data?.invoice;
    const payment = getPaymentInfo();
    const isConfirmed = purchase?.status === 'completed';
    const isProcessing = purchase?.status === 'confirmed';
    const isExpired = invoice?.status === 'expired' || invoice?.status === 'invalid';
    
    const displayStatus = isConfirmed ? 'confirmed' : isProcessing ? 'processing' : isExpired ? 'expired' : 'pending';

    const fileName = purchase?.file?.name ?? purchase?.sale?.file?.name ?? 'Your File';
    const fileSize = purchase?.file?.size ?? purchase?.sale?.file?.size;
    const mimeType = purchase?.file?.mimeType ?? purchase?.sale?.file?.mimeType;

    return {
        loading,
        refreshing,
        error,
        data,
        fetchData,
        handleDownload,
        payment,
        isConfirmed,
        isExpired,
        displayStatus,
        fileName,
        fileSize,
        mimeType
    };
};

export default useCheckout;
