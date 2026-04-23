import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const usePurchase = (saleId) => {
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [buyLoading, setBuyLoading] = useState(false);

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

    const handleBuyNow = async () => {
        // ── Guard: user must be logged in ──────────────────────────────────────
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login, carrying the current listing URL so we bounce
            // the buyer straight back here after they authenticate.
            navigate(`/login?redirect=/listing/${saleId}`);
            return;
        }

        setBuyLoading(true);
        setError('');

        try {
            // Authorization header is automatically added by the global
            // axios interceptor in main.jsx — no need to set it manually here.
            const response = await axios.post('/api/purchases', { saleId });

            if (response.data.status === 'success') {
                const { tokenId } = response.data.data.purchase;
                // Go directly to the checkout page — no intermediate "Launch Checkout" button
                navigate(`/checkout/${tokenId}`);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                // Token expired or invalid — clear stale auth and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate(`/login?redirect=/listing/${saleId}`);
            } else {
                setError(
                    err.response?.data?.message ||
                    'Failed to initiate purchase. Please try again.'
                );
            }
        } finally {
            setBuyLoading(false);
        }
    };

    return {
        sale,
        loading,
        error,
        buyLoading,
        handleBuyNow,
    };
};

export default usePurchase;
