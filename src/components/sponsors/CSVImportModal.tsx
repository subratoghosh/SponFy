'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Mail,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { formatCurrencyINR } from '@/lib/utils';
import { parseCSV, mapCSVToCompanyInputs, generateSampleCSV, ParsedCompanyInput } from '@/lib/csv/parser';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaignId?: string;
}

export function CSVImportModal({ isOpen, onClose, onSuccess, campaignId }: CSVImportModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedCompanies, setParsedCompanies] = useState<ParsedCompanyInput[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setParsingError('Please select a valid .csv spreadsheet file.');
      return;
    }

    setParsingError(null);
    setSelectedFile(file);

    try {
      const text = await file.text();
      const { rows } = parseCSV(text);
      const mapped = mapCSVToCompanyInputs(rows);

      if (mapped.length === 0) {
        setParsingError('No valid company records could be extracted from this CSV file. Make sure it contains at least a "Company Name" column.');
        setParsedCompanies([]);
      } else {
        setParsedCompanies(mapped);
      }
    } catch (err: any) {
      setParsingError(`Failed to parse CSV: ${err.message || 'Malformed file formatting'}`);
      setParsedCompanies([]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sponfy_companies_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast('Template downloaded: sponfy_companies_template.csv', 'info');
  };

  const handleImport = async () => {
    if (parsedCompanies.length === 0) return;

    setIsImporting(true);
    try {
      const res = await fetch('/api/sponsors/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies: parsedCompanies,
          campaignId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import companies');
      }

      toast(
        `Successfully imported ${data.importedCount} companies` +
          (data.skippedCount ? ` (${data.skippedCount} skipped duplicates)` : '') +
          ' into your workspace!',
        'success'
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      toast(err.message || 'Import failed. Check CSV structure.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedCompanies([]);
    setParsingError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#0C382E]/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-[#0C382E] text-[#FAF4E6] flex items-start justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FAF4E6]/10 text-[#FFF0B3]">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <h2 className="font-heading font-black text-xl text-[#FAF4E6]">
                Import Companies from CSV
              </h2>
            </div>
            <p className="text-xs text-[#FAF4E6]/70 max-w-lg">
              Load your existing spreadsheet of sponsor leads, contact emails, and estimated budgets directly into your active workspace.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#FAF4E6]/70 hover:text-[#FAF4E6] transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Download Template Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF4E6] border border-[#0C382E]/10 text-xs">
            <div className="flex items-center gap-2 text-[#0C382E]">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
              <span>Supports auto-detecting Company Name, Website, Industry, Email, Contact POC, and INR Values.</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1 font-bold text-[#0C382E] hover:text-[#2D6A4F] underline shrink-0 cursor-pointer ml-2"
            >
              <Download className="w-3.5 h-3.5" />
              CSV Template
            </button>
          </div>

          {/* Upload Dropzone */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-[#0C382E] bg-[#FAF4E6]/80 scale-[0.99]'
                  : 'border-[#0C382E]/20 hover:border-[#0C382E]/50 bg-[#FAF4E6]/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-[#0C382E]/5 text-[#0C382E] flex items-center justify-center shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#0C382E]">
                  Click to browse or drop your CSV file here
                </p>
                <p className="text-xs text-[#0C382E]/60 mt-0.5">
                  Standard comma-separated format (.csv) up to 10MB
                </p>
              </div>
            </div>
          ) : (
            /* Selected File & Preview */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF4E6] border border-[#0C382E]/15 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#0C382E] text-[#FFF0B3] flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-xs text-[#0C382E] truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-[#0C382E]/60 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {parsedCompanies.length} companies detected
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs border-[#0C382E]/20 text-[#0C382E] hover:bg-white"
                >
                  Change File
                </Button>
              </div>

              {/* Data Preview Table */}
              {parsedCompanies.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#0C382E]">
                    <span className="font-bold font-heading">
                      Previewing first {Math.min(5, parsedCompanies.length)} of {parsedCompanies.length} rows:
                    </span>
                    <span className="text-[11px] text-[#0C382E]/60">All rows will be imported</span>
                  </div>

                  <div className="border border-[#0C382E]/10 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF4E6] text-[#0C382E]/70 font-semibold text-[10px] uppercase border-b border-[#0C382E]/10">
                        <tr>
                          <th className="py-2 px-3">Company</th>
                          <th className="py-2 px-3">Industry</th>
                          <th className="py-2 px-3">Estimated Value</th>
                          <th className="py-2 px-3">Contact</th>
                          <th className="py-2 px-3">Stage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0C382E]/5">
                        {parsedCompanies.slice(0, 5).map((comp, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF4E6]/40">
                            <td className="py-2 px-3 font-semibold text-[#0C382E] flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 opacity-40 shrink-0" />
                              <span className="truncate max-w-[120px]">{comp.name}</span>
                            </td>
                            <td className="py-2 px-3 text-[#0C382E]/70 truncate max-w-[100px]">
                              {comp.industry || 'General Tech'}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-[#0C382E]">
                              {comp.pipelineValue ? formatCurrencyINR(comp.pipelineValue) : '₹0'}
                            </td>
                            <td className="py-2 px-3 text-[#0C382E]/70 truncate max-w-[120px]">
                              {comp.contactEmail ? (
                                <span className="flex items-center gap-1 truncate text-[#2D6A4F]">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{comp.contactEmail}</span>
                                </span>
                              ) : (
                                comp.contactName || '-'
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0C382E]/10 text-[#0C382E]">
                                {comp.stage || 'Discovered'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {parsingError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{parsingError}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-[#FAF4E6]/40 border-t border-[#0C382E]/10 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isImporting}
            className="text-xs text-[#0C382E]/70 hover:text-[#0C382E]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleImport}
            disabled={parsedCompanies.length === 0 || isImporting}
            className="bg-[#0C382E] text-[#FFF0B3] hover:bg-[#0C382E]/90 text-xs font-bold gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing Records...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                Import {parsedCompanies.length > 0 ? `${parsedCompanies.length} Companies` : 'CSV'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
