import React from 'react';
import { Upload, Plus } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const UploadSection = ({ 
  handleUpload, 
  handleFileChange, 
  selectedFile, 
  expiry, 
  setExpiry, 
  uploading, 
  progress 
}) => {
  return (
    <Card className="border-payfile-maroon/5 bg-payfile-cream/30 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
          <Upload className="w-6 h-6 text-payfile-gold" />
          <h2 className="text-xl font-bold">Upload File</h2>
      </div>
      
      <form className="space-y-6" onSubmit={handleUpload}>
          <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Select File</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-payfile-gold/20 rounded-3xl cursor-pointer hover:bg-payfile-gold/5 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Plus className="w-8 h-8 text-payfile-gold/40 group-hover:text-payfile-gold transition-colors mb-2" />
                      <p className="text-xs text-gray-500 font-medium">
                          {selectedFile ? selectedFile.name : 'Choose file to upload'}
                      </p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
          </div>

          <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Expiry Period (Days)</label>
              <input
                  type="number"
                  placeholder="Permanent storage if empty"
                  className="w-full bg-white border border-payfile-maroon/10 rounded-2xl px-5 py-3 text-sm outline-none focus:border-payfile-gold/40 transition-all"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
              />
          </div>

          {uploading && (
              <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-payfile-gold h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>
          )}

          <Button 
              variant="primary" 
              className="w-full py-4 text-sm font-bold shadow-lg shadow-payfile-amber/20"
              disabled={uploading || !selectedFile}
              type="submit"
          >
              Upload File
          </Button>
      </form>
    </Card>
  );
};

export default UploadSection;
