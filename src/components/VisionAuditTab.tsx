import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Clock,
  Sun,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UploadCloud,
  Loader2,
  ImageIcon,
  Snowflake,
} from 'lucide-react';
import {
  fetchVisionForensics,
  uploadMilestonePhoto,
  triggerAIPipeline,
} from '@/services/auditService';
import type { VisionForensics } from '@/services/auditService';

interface VisionAuditTabProps {
  workId: string;
  aiBaselineImage: string;
  onFundsFrozen?: (workId: string) => void;
}

interface MetadataItem {
  icon: typeof MapPin;
  label: string;
  value: string;
  status: 'match' | 'mismatch' | 'warning';
}

const statusConfig = {
  match: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Verified' },
  mismatch: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Mismatch' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Suspicious' },
};

export function VisionAuditTab({ workId, aiBaselineImage, onFundsFrozen }: VisionAuditTabProps) {
  const [forensics, setForensics] = useState<VisionForensics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [frozenStatus, setFrozenStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadForensics = useCallback(async () => {
    try {
      const data = await fetchVisionForensics(workId);
      setForensics(data);
      if (data?.ai_status === 'funds_frozen') setFrozenStatus(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vision data');
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => {
    loadForensics();
  }, [loadForensics]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await uploadMilestonePhoto(file, workId);
      setUploading(false);
      setAnalyzing(true);
      const result = await triggerAIPipeline(workId, 'vision');
      setAnalyzing(false);

      // Reload forensics data to get the updated results
      await loadForensics();

      if (result.funds_frozen) {
        setFrozenStatus(true);
        onFundsFrozen?.(workId);
      }
    } catch (err) {
      setUploading(false);
      setAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Upload or analysis failed');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const contractorPhotoUrl = forensics?.contractor_photo_url;
  const shadowScore = forensics ? Number(forensics.shadow_geometry_score) : null;
  const isFrozen = frozenStatus || forensics?.ai_status === 'funds_frozen';

  const metadata: MetadataItem[] = forensics
    ? [
        {
          icon: MapPin,
          label: 'GPS Coordinates',
          value: forensics.gps_coordinates,
          status: forensics.gps_verified ? 'match' : 'mismatch',
        },
        {
          icon: Clock,
          label: 'Timestamp Verification',
          value: forensics.timestamp_verified
            ? 'EXIF verified · Timestamp matched'
            : 'EXIF mismatch · Timestamp anomaly',
          status: forensics.timestamp_verified ? 'match' : 'mismatch',
        },
        {
          icon: Sun,
          label: 'Shadow/Geometry Match',
          value: `${shadowScore?.toFixed(1)}% — Threshold 85%`,
          status: shadowScore !== null && shadowScore >= 85 ? 'match' : shadowScore !== null && shadowScore >= 70 ? 'warning' : 'mismatch',
        },
        {
          icon: AlertCircle,
          label: 'Duplicate Image Detection',
          value: forensics.duplicate_detected
            ? 'Found in prior work orders'
            : 'No duplicates found',
          status: forensics.duplicate_detected ? 'warning' : 'match',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading vision forensics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* AI Vision Analysis Loading Overlay */}
      {analyzing && (
        <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur rounded-xl flex flex-col items-center justify-center py-16">
          <div className="relative">
            <Loader2 className="w-14 h-14 text-amber-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-300" />
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold text-white">AI Vision Agent: Analyzing Exif Geo-Spatial Perimeter & Geometric Alignment...</p>
          <p className="mt-1.5 text-xs text-slate-400">Processing work order {workId}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Shadow analysis · GPS verification · Duplicate check
          </div>
        </div>
      )}

      {/* Image comparison / upload area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Contractor upload area */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Contractor Uploaded Image</span>
              <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Source Evidence</span>
            </div>
          </div>

          {contractorPhotoUrl ? (
            <div className="relative aspect-video bg-slate-950">
              <img src={contractorPhotoUrl} alt="Contractor evidence" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400">
                {workId}_progress.jpg · Uploaded
              </div>
              {isFrozen && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/20 border border-red-500/40 px-2 py-1 rounded text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  <Snowflake className="w-3 h-3" />
                  Funds Frozen
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || analyzing}
                className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur px-2.5 py-1.5 rounded-lg text-[11px] text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors disabled:opacity-40"
              >
                Replace Photo
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`aspect-video flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'bg-amber-500/10 border-2 border-dashed border-amber-500/50'
                  : 'bg-slate-950 border-2 border-dashed border-slate-700 hover:border-slate-600'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-3" />
                  <p className="text-sm font-medium text-slate-300">Uploading photo...</p>
                  <p className="text-xs text-slate-500 mt-1">Saving to storage bucket</p>
                </>
              ) : (
                <>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${isDragging ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                    <UploadCloud className={`w-7 h-7 ${isDragging ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">Upload Construction Progress Photo</p>
                  <p className="text-xs text-slate-500 mt-1">Drag &amp; drop or click to browse</p>
                  <p className="text-[10px] text-slate-600 mt-2">JPG, PNG · Max 10MB</p>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Right: AI baseline */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">AI Generative Simulation / Baseline</span>
              <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">AI Reconstructed</span>
            </div>
          </div>
          <div className="relative aspect-video bg-slate-950">
            <img src={aiBaselineImage} alt="AI baseline" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400">
              sim_drain_varthur_v3.png · Generated
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2.5 border border-red-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-slate-500 hover:text-slate-300">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metadata analysis */}
      {forensics && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Spatial-Temporal Metadata Analysis</h3>
            {isFrozen && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-1 rounded uppercase tracking-wider">
                <Snowflake className="w-3 h-3" />
                Funds_Frozen
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metadata.map((item, idx) => {
              const Icon = item.icon;
              const sc = statusConfig[item.status];
              const StatusIcon = sc.icon;
              return (
                <div key={idx} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 border border-slate-800">
                  <div className={`w-9 h-9 rounded-lg ${sc.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${sc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
                    <p className="text-xs text-slate-300 truncate">{item.value}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${sc.color} ${sc.bg} px-2 py-1 rounded shrink-0`}>
                    <StatusIcon className="w-3 h-3" />
                    {sc.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Match score visual */}
      {forensics && shadowScore !== null && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Shadow / Geometry Match Score</span>
            <span className={`text-lg font-bold ${shadowScore >= 85 ? 'text-emerald-400' : shadowScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
              {shadowScore.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                shadowScore >= 85
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : shadowScore >= 70
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-red-500 to-amber-500'
              }`}
              style={{ width: `${shadowScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-slate-600">
            <span>0%</span>
            <span className="text-amber-400">Threshold: 85%</span>
            <span>100%</span>
          </div>
          {shadowScore < 70 ? (
            <p className="text-xs text-red-400/80 mt-2">
              Score below verification threshold. Shadow angles and structural geometry do not match baseline reconstruction.
              Funds have been frozen pending physical site inspection.
            </p>
          ) : shadowScore < 85 ? (
            <p className="text-xs text-amber-400/80 mt-2">
              Score below 85% threshold. Moderate anomaly detected. Manual physical audit recommended.
            </p>
          ) : (
            <p className="text-xs text-emerald-400/80 mt-2">
              Score above verification threshold. Shadow angles and geometry align with baseline reconstruction.
            </p>
          )}
        </div>
      )}

      {/* Empty state hint */}
      {!forensics && !loading && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-center">
          <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No vision data yet. Upload a construction photo to begin AI analysis.</p>
        </div>
      )}
    </div>
  );
}
