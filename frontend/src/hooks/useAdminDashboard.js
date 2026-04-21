import { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfirm } from '../context/ConfirmContext.jsx';


const useAdminDashboard = () => {
    const confirm = useConfirm();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [searchTokenId, setSearchTokenId] = useState('');
    const [purchaseDetails, setPurchaseDetails] = useState(null);
    const [checkingToken, setCheckingToken] = useState(false);
    const [confirmingPayment, setConfirmingPayment] = useState(false);
    const [retryingPayout, setRetryingPayout] = useState(false);

    const getHeaders = () => ({
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, chartRes] = await Promise.all([
                axios.get('/api/admin/stats', getHeaders()),
                axios.get('/api/admin/income-stats', getHeaders())
            ]);

            if (statsRes.data.status === 'success') setStats(statsRes.data.data);
            if (chartRes.data.status === 'success') setChartData(chartRes.data.data.stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        setDownloading(true);
        try {
            const response = await axios.get('/api/admin/report', { 
                ...getHeaders(),
                responseType: 'blob' 
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `satoshibin-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setDownloading(false);
        }
    };

    const handleCheckToken = async () => {
        if (!searchTokenId) return;
        setCheckingToken(true);
        setPurchaseDetails(null);
        try {
            const response = await axios.get(`/api/admin/verify-purchase/${searchTokenId}`, getHeaders());
            if (response.data.status === 'success') {
                setPurchaseDetails(response.data.data.purchase);
            }
        } catch (err) {
            console.error('Check error:', err);
        } finally {
            setCheckingToken(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!purchaseDetails) return;

        const isConfirmed = await confirm(
            `Manually confirm payment for Token ID ${purchaseDetails.tokenId}? Only proceed if you have verified the funds on-chain.`,
            'Confirm Manual Payment'
        );
        if (!isConfirmed) return;

        setConfirmingPayment(true);
        try {
            const response = await axios.patch(`/api/admin/confirm-purchase/${purchaseDetails.tokenId}`, {}, getHeaders());
            if (response.data.status === 'success') {
                setPurchaseDetails({ ...purchaseDetails, status: 'confirmed' });
            }
        } catch (err) {
            console.error('Confirm error:', err);
        } finally {
            setConfirmingPayment(false);
        }
    };

    const handleRetryPayout = async () => {
        if (!purchaseDetails) return;
        setRetryingPayout(true);
        try {
            const response = await axios.post(`/api/admin/retry-payout/${purchaseDetails.tokenId}`, {}, getHeaders());
            if (response.data.status === 'success') {
                setPurchaseDetails({ 
                    ...purchaseDetails, 
                    payoutsProcessed: response.data.data.payoutsProcessed,
                    sellerPayoutProcessed: response.data.data.sellerPayoutProcessed,
                    adminPayoutProcessed: response.data.data.adminPayoutProcessed
                });
            }
        } catch (err) {
            console.error('Retry error:', err);
        } finally {
            setRetryingPayout(false);
        }
    };

    return {
        stats,
        chartData,
        loading,
        downloading,
        searchTokenId,
        setSearchTokenId,
        purchaseDetails,
        checkingToken,
        confirmingPayment,
        retryingPayout,
        handleDownloadReport,
        handleCheckToken,
        handleConfirmPayment,
        handleRetryPayout
    };
};

export default useAdminDashboard;
