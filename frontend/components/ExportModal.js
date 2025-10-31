import { useState, useEffect } from 'react';
import { requestExport, checkExportStatus } from '../lib/api';

/**
 * Export Private Key Modal
 * Handles tweet verification flow
 * Uses simple API polling (no Firebase Realtime DB needed!)
 */
export default function ExportModal({ userId, xHandle, onClose }) {
  const [step, setStep] = useState('loading'); // loading, show-code, waiting, show-key
  const [verificationCode, setVerificationCode] = useState('');
  const [secretPath, setSecretPath] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Request export on mount
  useEffect(() => {
    async function initExport() {
      try {
        const result = await requestExport(userId, xHandle);
        setVerificationCode(result.verification_code);
        setSecretPath(result.secret_path);
        setStep('show-code');
      } catch (err) {
        console.error('Export request error:', err);
        setError('Failed to initialize export. Please try again.');
        setStep('error');
      }
    }

    initExport();
  }, [userId, xHandle]);

  // Poll for key when waiting (every 2 seconds)
  useEffect(() => {
    if (step !== 'waiting' || !secretPath) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkExportStatus(secretPath);

        if (result.ready && result.privkey) {
          setPrivateKey(result.privkey);
          setStep('show-key');
          setCountdown(30);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [step, secretPath]);

  // Countdown timer when showing key
  useEffect(() => {
    if (step !== 'show-key') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, onClose]);

  const handleTweetClick = () => {
    const tweetText = `@XFundDex export ${verificationCode}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
    setStep('waiting');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(privateKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-white">Export Key</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {step === 'loading' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-neutral-400 text-sm">Generating code...</p>
          </div>
        )}

        {step === 'show-code' && (
          <div>
            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded p-3 mb-4">
              <p className="text-sm text-yellow-300 font-medium">⚠ Key visible for 30s only</p>
            </div>

            <p className="text-neutral-300 mb-3 text-sm">
              Tweet this code:
            </p>

            <div className="bg-neutral-950 border border-neutral-800 rounded p-4 mb-4 text-center">
              <p className="text-2xl font-mono font-bold text-white">
                {verificationCode}
              </p>
            </div>

            <button
              onClick={handleTweetClick}
              className="btn btn-primary w-full mb-2 text-sm"
            >
              Tweet Code
            </button>

            <p className="text-xs text-neutral-500 text-center">
              Waits for your tweet automatically
            </p>
          </div>
        )}

        {step === 'waiting' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-neutral-400 text-sm">Waiting for tweet...</p>
          </div>
        )}

        {step === 'show-key' && (
          <div>
            <div className="bg-green-600/20 border border-green-600/30 rounded p-3 mb-4">
              <p className="text-sm text-green-300 font-medium">
                ✓ Verified - Expires in {countdown}s
              </p>
            </div>

            <p className="text-neutral-300 mb-3 text-sm font-medium">
              Your Private Key:
            </p>

            <div className="bg-neutral-950 border border-neutral-800 rounded p-3 mb-4">
              <p className="text-xs font-mono break-all text-white">
                {privateKey}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="btn btn-primary w-full text-sm"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>

            <p className="text-xs text-red-400 text-center mt-3">
              Never share this key
            </p>
          </div>
        )}

        {step === 'error' && (
          <div>
            <div className="bg-red-600/20 border border-red-600/30 rounded p-3 mb-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>

            <button onClick={onClose} className="btn btn-secondary w-full text-sm">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
