import { useState, useEffect } from 'react';
import axios from 'axios';

const usePurchase = (saleId) => {
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tokenGenerated, setTokenGenerated] = useState(false);
    const [purchase, setPurchase] = useState(null);

    useEffect(() => {
        fetchSaleDetails();
    }, [saleId]);

    const fetchSaleDetails = async () => {
        try {
            const response = await axios.get(`/api/sales/public/${saleId}`);
            if (response.data.status === 'success') {
                setSale(response.data.data.sale);
            }
        } catch (err) {
            setError('Sale listing not found or has expired.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (tokenGenerated && purchase && purchase.status === 'pending') {
            interval = setInterval(async () => {
                try {
                    const response = await axios.get(`/api/purchases/status/${purchase.tokenId}`);
                    if (response.data.data.status === 'confirmed') {
                        setPurchase(prev => ({ ...prev, status: 'confirmed' }));
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error('Error polling status:', err);
                }
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [tokenGenerated, purchase]);

    const handleGenerateToken = async () => {
        try {
            const response = await axios.post('/api/purchases', { saleId });
            if (response.data.status === 'success') {
                setPurchase(response.data.data.purchase);
                setTokenGenerated(true);
            }
        } catch (err) {
            setError('Failed to generate purchase token. Please try again.');
        }
    };

    const handleDownload = async () => {
        if (!purchase || purchase.status !== 'confirmed') return;
        const downloadUrl = `/api/files/public/download/${sale.file._id}?token=${purchase.tokenId}`;
        window.open(downloadUrl, '_blank');
    };

    return {
        sale,
        loading,
        error,
        tokenGenerated,
        purchase,
        handleGenerateToken,
        handleDownload
    };
};

export default usePurchase;
