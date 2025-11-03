import { useState } from 'react';
import { IoWallet, IoRocket, IoCash, IoEye, IoKey } from 'react-icons/io5';

export default function OnboardingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Your Wallet is Ready',
      content: 'Deposit SOL to your wallet address shown below to get started. This wallet holds your funds for creating and contributing to campaigns.',
      Icon: IoWallet,
      iconColor: 'text-blue-400'
    },
    {
      title: 'Create a Campaign',
      content: 'Tweet @XFundDex create [TOKEN_CA] to start a $300 campaign. As the creator, you can add images, description, and links by editing the campaign page.',
      Icon: IoRocket,
      iconColor: 'text-green-400'
    },
    {
      title: 'Contribute to Campaigns',
      content: 'Tweet @XFundDex fund [AMOUNT] [TOKEN_CA] to contribute SOL from your wallet to any active campaign.',
      Icon: IoCash,
      iconColor: 'text-yellow-400'
    },
    {
      title: 'View & Manage',
      content: 'Browse active campaigns to track progress. Export your private key anytime to import your wallet elsewhere.',
      Icon: IoEye,
      iconColor: 'text-purple-400'
    }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-8 max-w-xl w-full shadow-2xl">

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === step
                  ? 'w-8 bg-blue-500'
                  : 'w-2 bg-neutral-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <currentStep.Icon className={`text-7xl ${currentStep.iconColor}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {currentStep.title}
          </h2>
          <p className="text-neutral-300 text-base leading-relaxed max-w-md mx-auto">
            {currentStep.content}
          </p>
        </div>

        {/* Full guide link */}
        <div className="text-center mb-6">
          <a
            href="/how-it-works"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View full guide in How it Works →
          </a>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              step === 0
                ? 'text-neutral-600 cursor-not-allowed'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            ← Back
          </button>

          <div className="text-neutral-500 text-sm">
            {step + 1} / {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            {step === steps.length - 1 ? "Let's Go!" : 'Next →'}
          </button>
        </div>

        {/* Skip button */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
        >
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
