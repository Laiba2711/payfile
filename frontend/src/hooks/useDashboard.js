import { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfirm } from '../context/ConfirmContext';

const useDashboard = () => {
    const confirm = useConfirm();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [expiry, setExpiry] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sales, setSales] = useState([]);
    const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0, activeListings: 0 });
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // Modals & temporary states
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareFile, setShareFile] = useState(null);
    const [shareExpiry, setShareExpiry] = useState(7);
    const [sharePassword, setSharePassword] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');

    const [showSaleModal, setShowSaleModal] = useState(false);
    const [saleFile, setSaleFile] = useState(null);
    const [salePrice, setSalePrice] = useState('');
    const [btcAddress, setBtcAddress] = useState('');
    const [listingExpiry, setListingExpiry] = useState('');
    const [currency, setCurrency] = useState('BTC');
    const [network, setNetwork] = useState('TRC20');
    const [generatedSaleLink, setGeneratedSaleLink] = useState('');

    useEffect(() => {
        fetchFiles();
        fetchSales();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('/api/files', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(response.data.data.files);
        } catch (err) {
            console.error('Error fetching files:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
    };

    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('/api/sales', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                const salesData = response.data.data.sales;
                setSales(salesData);
                
                const confirmedSales = salesData.filter(s => s.status === 'sold');
                const revenue = confirmedSales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
                setStats({
                    totalSales: confirmedSales.length,
                    totalRevenue: revenue.toFixed(4),
                    activeListings: salesData.filter(s => s.status === 'active').length
                });
            }
        } catch (err) {
            console.error('Error fetching sales:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
            setSuccess('');
        }
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!selectedFile) return setError('Please select a file first');

        const formData = new FormData();
        formData.append('file', selectedFile);
        if (expiry) formData.append('expiry', expiry);

        setUploading(true);
        setProgress(0);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            showToast('Upload successful!');
            setSelectedFile(null);
            setExpiry('');
            fetchFiles();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
        const isConfirmed = await confirm(
            'Are you sure you want to delete this file? This action cannot be undone.',
            'Delete File?'
        );
        if (!isConfirmed) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('File deleted successfully');
            fetchFiles();
            fetchSales();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete file');
        }
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/files/download/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            setError('Failed to download file.');
        }
    };

    const handleGenerateShareLink = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/files/${shareFile._id}/share`, {
                days: shareExpiry,
                password: sharePassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/download/${shareFile._id}`;
            setGeneratedLink(shareUrl);
            showToast('Share link configured successfully!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to generate share link', 'error');
        }
    };

    const handleCreateListing = async (e) => {
        if (e) e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/sales', {
                fileId: saleFile._id,
                price: salePrice,
                currency,
                network: currency === 'USDT' ? network : '',
                address: btcAddress,
                expiry: listingExpiry
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                const baseUrl = window.location.origin;
                const saleUrl = `${baseUrl}/listing/${response.data.data.sale._id}`;
                setGeneratedSaleLink(saleUrl);
                showToast('Sale listing created successfully!');
                fetchSales();
                setSalePrice('');
                setBtcAddress('');
                setListingExpiry('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create sale listing');
            showToast(err.response?.data?.message || 'Failed to create sale listing', 'error');
        }
    };

    const closeShareModal = () => {
        setShowShareModal(false);
        setShareFile(null);
        setGeneratedLink('');
    };

    const closeSaleModal = () => {
        setShowSaleModal(false);
        setSaleFile(null);
        setGeneratedSaleLink('');
    };

    return {
        userData,
        files,
        sales,
        stats,
        uploading,
        progress,
        error,
        success,
        toast,
        selectedFile,
        expiry,
        setExpiry,
        handleFileChange,
        handleUpload,
        handleDelete,
        handleDownload,
        
        // Share Modal states/actions
        showShareModal,
        setShowShareModal,
        shareFile,
        setShareFile,
        shareExpiry,
        setShareExpiry,
        sharePassword,
        setSharePassword,
        generatedLink,
        handleGenerateShareLink,
        closeShareModal,

        // Sale Modal states/actions
        showSaleModal,
        setShowSaleModal,
        saleFile,
        setSaleFile,
        salePrice,
        setSalePrice,
        btcAddress,
        setBtcAddress,
        listingExpiry,
        setListingExpiry,
        currency,
        setCurrency,
        network,
        setNetwork,
        generatedSaleLink,
        handleCreateListing,
        closeSaleModal,

        showToast
    };
};

export default useDashboard;
