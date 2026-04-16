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
        if (!data || data.purchase?.status === 'confirmed') {
            clearInterval(pollingRef.current);
            return;
        }
        pollingRef.current = setInterval(async () => {
            const status = await fetchData(true);
            if (status === 'confirmed') clearInterval(pollingRef.current);
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
        if (!inv && !breakdown) return null;

        const amount = breakdown?.totalAmount ?? inv?.payments?.[0]?.amount ?? null;
        const currency = breakdown?.currency ?? inv?.payments?.[0]?.currency_code ?? 'BTC';
        const address = inv?.payments?.[0]?.payment_address ?? breakdown?.sellerAddress ?? '';
        const paymentUrl = inv?.payments?.[0]?.payment_url ?? null;
        const confirmations = inv?.payments?.[0]?.confirmations ?? 0;
        const required = inv?.payments?.[0]?.min_confirmations ?? 1;

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
    const isConfirmed = purchase?.status === 'confirmed';
    const isExpired = invoice?.status === 'expired' || invoice?.status === 'invalid';
    const displayStatus = isConfirmed ? 'confirmed' : isExpired ? 'expired' : 'pending';

    const fileName = purchase?.file?.name ?? purchase?.sale?.file?.name ?? 'Your File';
    const fileSize = purchase?.file?.size ?? purchase?.sale?.file?.size;

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
        fileSize
    };
};

export default useCheckout;
