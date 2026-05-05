import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const useCheckout = (tokenId) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const pollingRef = useRef(null);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const res = await axios.get(`/api/purchases/checkout/${tokenId}`);
            if (res.data.status === 'success') {
                setData(res.data.data);
                return res.data.data.purchase?.status;
            }
        } catch (err) {
            if (!silent) setError('Could not load payment details.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
        return null;
    }, [tokenId]);

    useEffect(() => {
        fetchData(false);
    }, [fetchData]);

    useEffect(() => {
        if (!data || data.purchase?.status === 'completed') {
            clearInterval(pollingRef.current);
            return;
        }
        pollingRef.current = setInterval(async () => {
            const status = await fetchData(true);
            if (status === 'completed') clearInterval(pollingRef.current);
        }, 10000);
        return () => clearInterval(pollingRef.current);
    }, [data, fetchData]);

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
        let activePayment = inv?.payments?.find(p =>
            targetCode === 'BTC'
                ? BITCART_BTC_CODES.includes(p.currency_code)
                : BITCART_USDT_CODES.includes(p.currency_code)
        );

        // Fallback to first payment if no match found
        if (!activePayment) activePayment = inv?.payments?.[0];

        const amount = breakdown?.totalAmount ?? activePayment?.amount ?? null;

        // IMPORTANT: Always prefer breakdown.currency (set by our backend from sale.currency)
        // because it gives clean 'BTC' or 'USDT' — never a raw Bitcart internal code like 'BCL'.
        const rawCurrency = breakdown?.currency ?? activePayment?.currency_code ?? 'BTC';
        const CURRENCY_DISPLAY_MAP = { BCL: 'BTC', USDTTRX: 'USDT', USDTETH: 'USDT', trx: 'USDT' };
        const currency = CURRENCY_DISPLAY_MAP[rawCurrency] ?? rawCurrency;
        const address = activePayment?.payment_address ?? breakdown?.sellerAddress ?? '';
        const paymentUrl = activePayment?.payment_url ?? null;
        const confirmations = activePayment?.confirmations ?? 0;
        const required = activePayment?.min_confirmations ?? 1;

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
