import React from 'react';
import { FileText, Download, Share2, Bitcoin, Trash2 } from 'lucide-react';
import Card from '../../../components/ui/Card';

const FileTable = ({ files, handleDownload, handleShareClick, handleSaleClick, handleDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-payfile-maroon/5 shadow-sm min-h-[500px]">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-payfile-maroon" />
                <h2 className="text-xl font-bold">My Files</h2>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {files.length} Files
            </span>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-payfile-maroon/5">
                        <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">File Name</th>
                        <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</th>
                        <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-payfile-maroon/5">
                    {files.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="py-20 text-center text-gray-400 text-sm italic">
                                No files found.
                            </td>
                        </tr>
                    ) : (
                        files.map((file) => (
                            <tr key={file._id} className="group hover:bg-payfile-cream/30 transition-colors">
                                <td className="py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-payfile-maroon group-hover:text-payfile-gold transition-colors">{file.name}</span>
                                    </div>
                                </td>
                                <td className="py-5 text-xs text-gray-500 font-medium">
                                    {formatFileSize(file.size)}
                                </td>
                                <td className="py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleDownload(file._id, file.name)} className="p-2 rounded-xl bg-payfile-cream text-payfile-maroon hover:bg-payfile-gold hover:text-white transition-all">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleShareClick(file)} className="p-2 rounded-xl bg-payfile-cream text-payfile-maroon hover:bg-payfile-gold hover:text-white transition-all">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleSaleClick(file)} className="p-2 rounded-xl bg-payfile-amber/10 text-payfile-amber hover:bg-payfile-amber hover:text-white transition-all">
                                            <Bitcoin className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(file._id)} className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all">
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
  );
};

export default FileTable;
