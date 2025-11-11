'use client';

import { SecurityReport as SecurityReportType } from '@/store/useProjectStore';
import { getRiskColor } from '@/utils/openai-analyzer';
import { Shield, AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityReportProps {
  report: SecurityReportType;
  onContinue: () => void;
  onFix: () => void;
}

export default function SecurityReport({ report, onContinue, onFix }: SecurityReportProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="text-red-500" size={20} />;
      case 'medium':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'low':
        return <Info className="text-blue-500" size={20} />;
      default:
        return <CheckCircle2 className="text-green-500" size={20} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-500/10';
      case 'high':
        return 'border-orange-500 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const allIssues = [
    ...(report.criticalIssues || []),
    ...(report.warnings || []),
    ...(report.suggestions || []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-lg border border-dark-border p-6 space-y-6"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Shield className="text-primary" size={32} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">Security Analysis Report</h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Overall Risk:</span>
            <span className={`font-bold text-lg ${getRiskColor(report.overallRisk)}`}>
              {report.overallRisk.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
        <h3 className="text-white font-semibold mb-2">Summary</h3>
        <p className="text-gray-300 leading-relaxed">{report.summary}</p>
      </div>

      {allIssues.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg">Issues Found ({allIssues.length})</h3>
          <div className="space-y-3">
            {allIssues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">{issue.title}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-dark-bg text-gray-300 uppercase">
                        {issue.severity}
                      </span>
                      {issue.line && (
                        <span className="text-xs px-2 py-1 rounded-full bg-dark-bg text-gray-400">
                          Line {issue.line}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-3">{issue.description}</p>
                    <div className="bg-dark-bg rounded p-3 border border-dark-border">
                      <p className="text-sm text-gray-400 mb-1">Recommendation:</p>
                      <p className="text-sm text-green-400">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-green-500" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">No Issues Found</h3>
          <p className="text-gray-300">Your smart contract passed the security analysis!</p>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t border-dark-border">
        <button
          onClick={onFix}
          className="flex-1 px-6 py-3 bg-dark-hover hover:bg-dark-border text-white rounded-lg transition-all duration-200 border border-dark-border font-medium"
        >
          Fix Issues
        </button>
        <button
          onClick={onContinue}
          className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 font-medium"
        >
          Continue to Deploy
        </button>
      </div>
    </motion.div>
  );
}
