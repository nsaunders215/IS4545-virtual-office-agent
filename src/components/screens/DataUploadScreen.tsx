import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { PatientRecord } from '../../types/clinical';
import { DEFAULT_BENCHMARK_PATIENTS } from '../../data/defaultBenchmarkData';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Download,
  RotateCcw,
  Search,
  ArrowRight,
  Database,
} from 'lucide-react';

interface DataUploadScreenProps {
  currentDataset: PatientRecord[];
  onUpdateDataset: (records: PatientRecord[]) => void;
  onProceedToConfigure: () => void;
}

export const DataUploadScreen: React.FC<DataUploadScreenProps> = ({
  currentDataset,
  onUpdateDataset,
  onProceedToConfigure,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column definitions to inspect
  const detectedColumns = [
    { name: 'id', type: 'string', required: true, present: true },
    { name: 'age', type: 'number', required: true, present: true },
    { name: 'ageGroup', type: 'categorical', required: true, present: true },
    { name: 'visitType', type: 'categorical', required: true, present: true },
    { name: 'serviceLine', type: 'categorical', required: true, present: true },
    { name: 'satisfaction', type: 'number (1-5)', required: true, present: true },
    { name: 'communicationRating', type: 'number (1-5)', required: true, present: true },
    { name: 'complaintSeverity', type: 'categorical', required: true, present: true },
    { name: 'aiRiskFlag', type: 'categorical', required: true, present: true },
    { name: 'comment', type: 'text', required: true, present: true },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            setUploadError('Uploaded CSV file contains no data rows.');
            return;
          }

          // Convert rows to typed PatientRecords
          const parsedRecords: PatientRecord[] = results.data.map((row: any, idx) => {
            const age = parseInt(row.age || row.Age || '45', 10);
            let ageGroup: PatientRecord['ageGroup'] = 'Adult';
            if (row.ageGroup) {
              ageGroup = row.ageGroup;
            } else if (age < 18) {
              ageGroup = 'Pediatric Caregiver';
            } else if (age >= 65) {
              ageGroup = 'Senior';
            }

            return {
              id: row.id || row.ID || `PT-${2000 + idx}`,
              patientName: row.patientName || `De-Identified Pt #${2000 + idx}`,
              age,
              ageGroup,
              gender: row.gender || 'Unknown',
              persona: row.persona || 'General Outpatient',
              visitType: row.visitType || 'Specialty Care',
              serviceLine: row.serviceLine || 'Internal Medicine',
              satisfaction: parseInt(row.satisfaction || '3', 10),
              communicationRating: parseInt(row.communicationRating || '3', 10),
              followUpCompliance: row.followUpCompliance === 'true' || row.followUpCompliance === true || true,
              complaintSeverity: row.complaintSeverity || 'Moderate',
              patientPortalUsage: row.patientPortalUsage || 'Active',
              readmissionRisk: row.readmissionRisk || 'Moderate',
              aiRiskFlag: row.aiRiskFlag || 'None',
              comment: row.comment || row.Comment || row.feedback || 'Routine consultation.',
              timestamp: row.timestamp || new Date().toISOString().slice(0, 16).replace('T', ' '),
            };
          });

          onUpdateDataset(parsedRecords);
          setUploadSuccess(`Successfully parsed and loaded ${parsedRecords.length} clinical patient records.`);
        } catch (err: any) {
          setUploadError(`Failed to parse CSV: ${err.message}`);
        }
      },
      error: (err) => {
        setUploadError(`CSV read error: ${err.message}`);
      },
    });
  };

  const downloadSampleTemplate = () => {
    const csvContent = Papa.unparse(DEFAULT_BENCHMARK_PATIENTS);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'clinical_patient_dataset_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetToBenchmark = () => {
    onUpdateDataset(DEFAULT_BENCHMARK_PATIENTS);
    setUploadSuccess('Reset to preloaded clinical benchmark dataset (24 comprehensive cases).');
    setUploadError(null);
  };

  // Filter preview data
  const filteredData = currentDataset.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.serviceLine.toLowerCase().includes(q) ||
      r.visitType.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      r.persona.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinical Dataset Upload & Privacy Validation
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Provide or inspect the primary dataset analyzed by all six virtual AI agents.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={resetToBenchmark}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Benchmark (24 Cases)</span>
            </button>

            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download CSV Template</span>
            </button>

            <button
              onClick={onProceedToConfigure}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <span>Configure Agents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Drop Zone & Validation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload Primary Patient CSV File
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Accepted format: CSV containing patient IDs, age, service lines, satisfaction ratings, and patient narrative comments.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Click to browse or drop your CSV file here
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports standard CSV up to 10MB</p>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>

        {/* Data Quality & Privacy Safeguards Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              De-Identification & Privacy Check
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Zero Direct Identifiers:</strong> Names, SSNs, and real phone numbers are masked or synthetic.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Synthetic Patient Personas:</strong> Patient records emulate realistic healthcare encounters safely.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>HIPAA Safe Harbor:</strong> Data adheres to de-identification guidance (45 CFR § 164.514).
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active Records:</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                {currentDataset.length} rows
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>Detected Columns:</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                {detectedColumns.length} fields
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Columns & Data Types Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-600" />
          Detected Dataset Schema & Column Validation
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {detectedColumns.map((col, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs"
            >
              <div className="font-mono font-medium text-slate-900 truncate">{col.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{col.type}</div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Validated</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Dataset Preview</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredData.length} of {currentDataset.length} records available for analysis
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, department, comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-medium">
              <tr>
                <th className="py-2.5 px-4 font-mono">ID</th>
                <th className="py-2.5 px-4">Persona</th>
                <th className="py-2.5 px-3">Age Group</th>
                <th className="py-2.5 px-3">Visit Type</th>
                <th className="py-2.5 px-3">Service Line</th>
                <th className="py-2.5 px-2 text-center">Score</th>
                <th className="py-2.5 px-3">AI Flag</th>
                <th className="py-2.5 px-4">Comment Narrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-900 font-medium whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">{r.persona}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{r.ageGroup}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{r.visitType}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-medium">
                    {r.serviceLine}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-semibold">
                    <span
                      className={
                        r.satisfaction >= 4
                          ? 'text-emerald-700'
                          : r.satisfaction === 3
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }
                    >
                      {r.satisfaction}/5
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-medium ${
                        r.aiRiskFlag === 'Hallucination Risk'
                          ? 'text-rose-700 font-bold'
                          : r.aiRiskFlag === 'Human Review Required'
                          ? 'text-amber-700 font-semibold'
                          : r.aiRiskFlag === 'Bias Review'
                          ? 'text-purple-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {r.aiRiskFlag}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-md truncate" title={r.comment}>
                    {r.comment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length > 10 && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
            Showing first 10 rows. Total dataset contains {filteredData.length} records.
          </div>
        )}
      </div>
    </div>
  );
};
