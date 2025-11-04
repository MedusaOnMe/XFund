import { useState, useEffect } from 'react';
import { requestWithdraw, checkWithdrawStatus } from '../lib/api';

/**
 * Withdraw SOL Modal
 * Handles tweet verification flow for withdrawals
 * Similar to ExportModal but processes SOL transfer instead
 */
export default function WithdrawModal({ userId, xHandle, balance, onClose, onSuccess }) {
  const [step, setStep] = useState('input'); // input, loading, show-code, waiting, success
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [withdrawalPath, setWithdrawalPath] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [error, setError] = useState('');

  // Poll for withdrawal completion when waiting (every 2 seconds)
  useEffect(() => {
    if (step !== 'waiting' || !withdrawalPath) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkWithdrawStatus(withdrawalPath);

        if (result.completed && result.signature) {
          setTxSignature(result.signature);
          setStep('success');
          clearInterval(pollInterval);
          // Notify parent to refresh balance
          if (onSuccess) onSuccess();
        } else if (result.error) {
          setError(result.error);
          setStep('error');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [step, withdrawalPath, onSuccess]);

  const handleInitiateWithdraw = async () => {
    setError('');

    // Validation
    if (!destinationAddress.trim()) {
      setError('Please enter a destination address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      setError('Insufficient balance');
      return;
    }

    // Basic Solana address validation (44 chars, base58)
    if (destinationAddress.length < 32 || destinationAddress.length > 44) {
      setError('Invalid Solana address format');
      return;
    }

    setStep('loading');

    try {
      const result = await requestWithdraw(userId, xHandle, destinationAddress, amountNum);
      setVerificationCode(result.verification_code);
      setWithdrawalPath(result.withdrawal_path);
      setStep('show-code');
    } catch (err) {
      console.error('Withdraw request error:', err);
      setError(err.response?.data?.error || 'Failed to initialize withdrawal. Please try again.');
      setStep('input');
    }
  };

  const handleTweetClick = () => {
    const tweetText = `@XFundDex withdraw ${verificationCode}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
    setStep('waiting');
  };

  const handleMaxClick = () => {
    // Leave a small buffer for transaction fees (0.001 SOL)
    const maxAmount = Math.max(0, balance - 0.001);
    setAmount(maxAmount.toFixed(4));
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-white">Withdraw SOL</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {step === 'input' && (
          <div>
            <p className="text-neutral-300 mb-4 text-sm">
              Withdraw SOL from your XFundDex wallet to any external address.
            </p>

            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">
                Destination Address <span className="text-yellow-400">(ENSURE THIS IS CORRECT)</span>
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                placeholder="Solana wallet address"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-neutral-400">
                  Amount (SOL)
                </label>
                <button
                  onClick={handleMaxClick}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Max
                </button>
              </div>
              <input
                type="number"
                step="0.0001"
                min="0"
                className="input w-full text-sm"
                placeholder="0.0000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Available: {balance.toFixed(4)} SOL (fees apply)
              </p>
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-600/30 rounded p-3 mb-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleInitiateWithdraw}
              className="btn btn-primary w-full text-sm"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-neutral-400 text-sm">Generating code...</p>
          </div>
        )}

        {step === 'show-code' && (
          <div>
            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded p-3 mb-4">
              <p className="text-sm text-yellow-300 font-medium">⚠ Verify withdrawal via tweet</p>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded p-3 mb-4">
              <p className="text-xs text-neutral-400 mb-1">Withdrawing to:</p>
              <p className="text-xs font-mono break-all text-white mb-3">{destinationAddress}</p>
              <p className="text-xs text-neutral-400 mb-1">Amount:</p>
              <p className="text-sm font-bold text-white">{amount} SOL</p>
            </div>

            <p className="text-neutral-300 mb-3 text-sm">
              Tweet verification code to prove ownership and to send SOL to destination:
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
            <p className="mt-2 text-neutral-500 text-xs">Processing withdrawal...</p>
          </div>
        )}

        {step === 'success' && (
          <div>
            <div className="bg-green-600/20 border border-green-600/30 rounded p-3 mb-4">
              <p className="text-sm text-green-300 font-medium">
                ✓ Withdrawal successful!
              </p>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded p-3 mb-4">
              <p className="text-xs text-neutral-400 mb-1">Transaction:</p>
              <a
                href={`https://solscan.io/tx/${txSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono break-all text-blue-400 hover:text-blue-300"
              >
                {txSignature}
              </a>
            </div>

            <button
              onClick={onClose}
              className="btn btn-primary w-full text-sm"
            >
              Done
            </button>
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
