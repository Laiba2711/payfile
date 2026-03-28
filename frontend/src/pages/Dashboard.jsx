import React from 'react';
import { Upload, FileText, ShoppingBag, Search, Info } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-payfile-black pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, Laiba Rashid</h1>
          <p className="text-slate-400">Manage your files, share them securely, and sell them for Bitcoin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upload File Section */}
          <div className="lg:col-span-1">
            <Card className="h-full border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-5 h-5 text-payfile-green" />
                <h2 className="text-xl font-bold">Upload File</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">Select a file to upload to decentralized storage</p>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Choose File</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      className="hidden" 
                      id="file-upload" 
                    />
                    <label 
                      htmlFor="file-upload"
                      className="flex items-center justify-between w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sm text-slate-500">No file chosen</span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded text-white">Choose file</span>
                    </label>
                  </div>
                </div>

                <Input 
                  label="Expiry (days, optional)" 
                  placeholder="Leave empty for no expiry" 
                />

                <Button variant="primary" className="w-full flex items-center justify-center gap-2 py-3">
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
              </form>
            </Card>
          </div>

          {/* Your Files Section */}
          <div className="lg:col-span-2">
            <Card className="h-full border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Your Files</h2>
              </div>
              
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 mb-1">No files uploaded yet</p>
                <p className="text-sm text-slate-600">Upload your first file to get started</p>
              </div>
            </Card>
          </div>
        </div>

        {/* My Sale Listings Section */}
        <div className="mb-8">
          <Card className="border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gradient">My Sale Listings</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-slate-400 mb-1">No listings created yet</p>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                Create a listing to sell your files for Bitcoin
              </p>
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
    </div>
  );
};

export default Dashboard;
