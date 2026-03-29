import React, { useState, useEffect } from 'react';
import { Upload, FileText, ShoppingBag, Search, Info, CheckCircle2, XCircle, Download, Share2, Bitcoin, Trash2, Calendar, Copy, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';

const Dashboard = () => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiry, setExpiry] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFile, setShareFile] = useState(null);
  const [shareExpiry, setShareExpiry] = useState(7);
  const [generatedLink, setGeneratedLink] = useState('');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleFile, setSaleFile] = useState(null);
  const [salePrice, setSalePrice] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [listingExpiry, setListingExpiry] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [generatedSaleLink, setGeneratedSaleLink] = useState('');
  const [sales, setSales] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    fetchFiles();
    fetchSales();
  }, []);

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
        setSales(response.data.data.sales);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
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
    e.preventDefault();
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for handling binary data
      });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download file. Please try again.');
    }
  };

  const handleShareClick = (file) => {
    setShareFile(file);
    setGeneratedLink('');
    setShowShareModal(true);
  };

  const handleGenerateShareLink = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/download/${shareFile._id}?days=${shareExpiry}`;
    setGeneratedLink(shareUrl);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    showToast('Link copied to clipboard!');
  };

  const handleSaleClick = (file) => {
    setSaleFile(file);
    setGeneratedSaleLink('');
    setShowSaleModal(true);
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/sales', {
        fileId: saleFile._id,
        price: salePrice,
        currency,
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
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file? This will also remove any active sale listings.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('File deleted successfully', 'success');
      fetchFiles();
      fetchSales(); // Refresh sales too since they might have been deleted
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete file');
    }
  };

  return (
    <div className="min-h-screen bg-payfile-black pt-28 pb-12 text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {userData.firstName} {userData.lastName}</h1>
          <p className="text-slate-400">Manage your files, share them securely, and sell them for Bitcoin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upload File Section */}
          <div className="lg:col-span-1">
            <Card className="h-full border-white/10 p-6 bg-[#0a0a0a]">
              <div className="flex items-center gap-3 mb-1">
                <Upload className="w-5 h-5 text-slate-400" />
                <h2 className="text-xl font-bold">Upload File</h2>
              </div>
              <p className="text-sm text-slate-500 mb-8 tracking-wide">Select a file to upload to decentralized storage</p>
              
              <form className="space-y-6" onSubmit={handleUpload}>
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Choose File</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      className="hidden" 
                      id="file-upload" 
                      onChange={handleFileChange}
                    />
                    <label 
                      htmlFor="file-upload"
                      className="flex items-center gap-3 w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-300 bg-white/10 px-3 py-1.5 rounded whitespace-nowrap">Choose file</span>
                      <span className="text-sm text-slate-400 truncate">
                        {selectedFile ? selectedFile.name : 'No file chosen'}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Expiry (days, optional)</label>
                  <input 
                    type="number"
                    placeholder="Leave empty for no expiry"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-payfile-green/50 transition-colors text-slate-300 placeholder:text-slate-600"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>

                {success && (
                  <div className="flex items-center gap-2 text-payfile-green text-xs font-medium py-1 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-medium py-1 animate-fade-in">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-payfile-green h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <Button 
                  variant="primary" 
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-payfile-green hover:bg-payfile-green/90 text-sm font-bold"
                  type="submit"
                  disabled={uploading || !selectedFile}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Your Files Section */}
          <div className="lg:col-span-2">
            <Card className="h-full border-white/5 bg-[#0a0a0a] p-6">
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-1">Your Files</h2>
                <p className="text-sm text-slate-500 tracking-wide">{files.length} {files.length === 1 ? 'file' : 'files'} stored</p>
              </div>
              
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-4">
                      <th className="pb-4 font-bold">Filename</th>
                      <th className="pb-4 font-bold">Size</th>
                      <th className="pb-4 font-bold">Uploaded</th>
                      <th className="pb-4 font-bold text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {files.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center opacity-40">
                            <FileText className="w-12 h-12 mb-4 text-slate-600" />
                            <p className="text-sm">No files uploaded yet</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      files.map((file) => (
                        <tr key={file._id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-5 pr-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-slate-200 truncate max-w-[200px]">{file.name}</span>
                            </div>
                          </td>
                          <td className="py-5 text-sm text-slate-400">{formatFileSize(file.size)}</td>
                          <td className="py-5 text-sm text-slate-400">{formatDate(file.createdAt)}</td>
                          <td className="py-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => handleDownload(file._id, file.name)}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-slate-400 hover:text-white"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleShareClick(file)}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-slate-400 hover:text-white"
                                title="Share"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleSaleClick(file)}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-slate-400 hover:text-white"
                                title="Sell for Bitcoin"
                              >
                                <Bitcoin className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(file._id)}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all text-slate-400"
                                title="Delete File"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                   </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* My Sale Listings Section */}
        <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card className="border-white/5 bg-[#0a0a0a] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">My Sale Listings</h2>
                <p className="text-sm text-slate-500 font-medium">{sales.length} listings</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">BTC Address</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr key={sale._id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-slate-100">{sale.price} {sale.currency}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-medium text-slate-400 font-mono">
                            {sale.address.substring(0, 10)}...{sale.address.substring(sale.address.length - 4)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {(() => {
                            const isExpired = sale.expiresAt && new Date(sale.expiresAt) < new Date();
                            const status = isExpired ? 'expired' : sale.status;
                            return (
                              <span className={`${
                                status === 'active' ? 'bg-payfile-green/10 text-payfile-green border-payfile-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                              } inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border`}>
                                {status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-medium text-slate-500">
                            {formatDate(sale.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => {
                                const url = `${window.location.origin}/listing/${sale._id}`;
                                navigator.clipboard.writeText(url);
                                showToast('Listing link copied!');
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-[11px] font-bold text-slate-300"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Link
                            </button>
                            <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-slate-400 hover:text-white">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                            <Bitcoin className="w-6 h-6 opacity-30" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">No listings created yet</p>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                              Create a listing to sell your files for Bitcoin or USDT
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Manage Purchases Section */}
        <div className="mb-12">
          <Card className="border-white/5 bg-white/[0.01]">
            <h2 className="text-xl font-bold mb-2">Manage Purchases</h2>
            <p className="text-sm text-slate-500 mb-8">Confirm payments and manage purchase tokens for your listings</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Purchase Token ID</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Enter purchase token ID" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-payfile-green/50 transition-colors text-white"
                    />
                  </div>
                  <Button variant="primary" className="px-8 bg-payfile-green">
                    Check
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-payfile-green/5 border border-payfile-green/10 flex gap-4">
                <div className="mt-1">
                  <Info className="w-5 h-5 text-payfile-green" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-payfile-green">How it works:</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When a buyer generates a purchase token and sends Bitcoin to your address, enter the token ID here to check its status. Once you verify the payment in your Bitcoin wallet, click "Confirm Payment" to unlock the file for download.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md border-white/10 bg-[#0a0a0a] p-8 relative shadow-2xl">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-2"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-1">Share File</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Generate a shareable link for: <span className="text-slate-300 font-medium">{shareFile?.name}</span>
            </p>

            <div className="space-y-6">
              {!generatedLink ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Link expires in (days)</label>
                    <input 
                      type="number"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-payfile-green/50 transition-colors text-payfile-green font-bold"
                      value={shareExpiry}
                      onChange={(e) => setShareExpiry(e.target.value)}
                    />
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full py-4 bg-payfile-green hover:bg-payfile-green/90 text-sm font-bold"
                    onClick={handleGenerateShareLink}
                  >
                    Generate Share Link
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Share Link</label>
                    <div className="flex gap-2">
                      <div className="flex-1 overflow-hidden">
                        <input 
                          type="text"
                          readOnly
                          value={generatedLink}
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-400 outline-none truncate"
                        />
                      </div>
                      <button 
                        onClick={copyLink}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 p-3 rounded-lg text-slate-400 hover:text-white transition-all scale-100 active:scale-95"
                        title="Copy to clipboard"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">This link will expire in {shareExpiry} days</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="text-sm font-bold text-slate-400 hover:text-white bg-white/5 border border-white/5 hover:border-white/10 px-8 py-2.5 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sale Listing Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-xl border-white/10 bg-[#0a0a0a] p-8 relative shadow-2xl">
            <button 
              onClick={() => setShowSaleModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-2"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-1">Create Sale Listing</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Set a price and Bitcoin address to sell: <span className="text-slate-300 font-medium">{saleFile?.name}</span>
            </p>

            {!generatedSaleLink ? (
              <form className="space-y-6" onSubmit={handleCreateListing}>
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Currency *</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none appearance-none text-slate-300 cursor-pointer focus:border-payfile-green/50 transition-colors"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="USDT">USDT (Tether)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Price ({currency}) *</label>
                    <input 
                      type="text"
                      required
                      placeholder={`e.g., ${currency === 'BTC' ? '0.0001' : '10.00'}`}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-payfile-green/50 transition-colors text-slate-300"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">Enter amount in {currency} (e.g., {currency === 'BTC' ? '0.0001 BTC' : '10.00 USDT'})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Expiry (days, optional)</label>
                    <input 
                      type="number"
                      placeholder="e.g., 30"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-payfile-green/50 transition-colors text-slate-300"
                      value={listingExpiry}
                      onChange={(e) => setListingExpiry(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Your {currency} Address *</label>
                  <input 
                    type="text"
                    required
                    placeholder={`${currency === 'BTC' ? 'bc1q...' : '0x...'}`}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-payfile-green/50 transition-colors text-slate-300"
                    value={btcAddress}
                    onChange={(e) => setBtcAddress(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">Buyers will send {currency} to this address</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowSaleModal(false)}
                    className="px-8 py-2.5 rounded-lg border border-white/10 text-sm font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2.5 rounded-lg bg-payfile-green hover:bg-payfile-green/90 text-sm font-bold text-black transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                  >
                    Create Listing
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-payfile-green/5 border border-payfile-green/10 rounded-xl p-5 flex items-center justify-center gap-3 backdrop-blur-md">
                  <CheckCircle2 className="w-5 h-5 text-payfile-green" />
                  <span className="text-sm font-bold text-payfile-green">Listing created successfully!</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Public Purchase Link</label>
                    <div className="flex gap-2">
                      <div className="flex-1 overflow-hidden">
                        <input 
                          type="text"
                          readOnly
                          value={generatedSaleLink}
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-400 outline-none truncate"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedSaleLink);
                          showToast('Listing link copied!');
                        }}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 p-3 rounded-lg text-slate-400 hover:text-white transition-all"
                        title="Copy link"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Share this link with potential buyers</p>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowSaleModal(false)}
                    className="px-8 py-2.5 rounded-lg bg-payfile-green hover:bg-payfile-green/90 text-sm font-bold text-black transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 right-10 z-[200] animate-toast-in">
          <div className="flex items-center gap-4 bg-black/80 backdrop-blur-2xl border border-payfile-green/20 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-l-4 border-l-payfile-green">
            <div className="w-8 h-8 rounded-full bg-payfile-green/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-payfile-green" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Notification</p>
              <p className="text-sm font-bold text-white tracking-tight">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
