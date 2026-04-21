import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, Lock, AlertCircle, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';
import Loader from '../components/ui/Loader';

const SharedDownloadPage = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFileInfo();
  }, [fileId]);

  const fetchFileInfo = async () => {
    try {
      const response = await axios.get(`/api/files/shared/info/${fileId}`);
      if (response.data.status === 'success') {
        setFileInfo(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File not found or link expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setError('');
    setDownloading(true);

    try {
      const response = await axios.post(`/api/files/shared/download/${fileId}`, 
        { password },
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileInfo.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response && err.response.data instanceof Blob) {
        // Parse blob error response
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.message || 'Download failed');
          } catch (e) {
            setError('Download failed. Incorrect password?');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.response?.data?.message || 'Failed to download file.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <Loader variant="fullscreen" label="Loading..." />;
  }

  if (error && !fileInfo) {
    return (
      <div className="min-h-screen bg-payfile-white pt-32 pb-12 flex flex-col items-center">
        <Card className="max-w-md w-full p-8 border-payfile-maroon/20 bg-payfile-cream/10 text-center">
          <AlertCircle className="w-12 h-12 text-payfile-maroon mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Button variant="primary" className="w-full" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-payfile-white pt-32 pb-20 text-payfile-maroon flex flex-col">
      <div className="flex-1 max-w-md mx-auto px-6 w-full flex flex-col justify-center">
        <Card className="border-payfile-gold/10 bg-white overflow-hidden shadow-2xl p-8 relative">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-payfile-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-payfile-maroon/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-payfile-cream/50 border border-payfile-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-payfile-gold" />
            </div>

            <h1 className="text-2xl font-black text-center mb-2 tracking-tight">Download File</h1>
            <p className="text-center text-sm text-gray-500 font-medium mb-8">Access the shared document securely.</p>

            <div className="bg-payfile-cream/20 border border-payfile-maroon/5 rounded-2xl p-5 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-5 h-5 text-payfile-maroon shrink-0" />
                <span className="text-sm font-bold truncate text-payfile-maroon">{fileInfo.name}</span>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0 ml-4">{formatFileSize(fileInfo.size)}</span>
            </div>

            <form onSubmit={handleDownload} className="space-y-6">
              {fileInfo.requiresPassword && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    <Lock className="w-3 h-3 text-payfile-amber" /> Password Required
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter document password"
                    className="w-full bg-payfile-cream/50 border border-payfile-maroon/10 rounded-2xl px-5 py-4 text-sm font-black text-payfile-maroon outline-none focus:border-payfile-gold/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {error && <p className="text-xs font-bold text-red-500 ml-1">{error}</p>}
                </div>
              )}

              <Button 
                variant="primary" 
                type="submit" 
                className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-payfile-amber/20"
                loading={downloading}
              >
                Secure Download
              </Button>
            </form>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SharedDownloadPage;
