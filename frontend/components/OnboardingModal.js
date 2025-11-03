import { useState } from 'react';

export default function OnboardingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to XFundDex!',
      content: 'Fund DEXScreener updates by tweeting. Your wallet has been created and is ready to use.',
      icon: '👋'
    },
    {
      title: 'Fund via Tweet',
      content: 'Tweet @XFundDex fund [AMOUNT] [TOKEN_CA] to contribute SOL to any campaign. Your funds are deducted from this wallet.',
      icon: '💰'
    },
    {
      title: 'Create Campaigns',
      content: 'Tweet @XFundDex create [TOKEN_CA] to start a $300 campaign for a token. Browse active campaigns to see what needs funding.',
      icon: '🚀'
    },
    {
      title: 'Get Started',
      content: 'Deposit SOL to your wallet address below, then start funding campaigns via Twitter!',
      icon: '✨'
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
      <div className="bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
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
          <div className="text-6xl mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {currentStep.title}
          </h2>
          <p className="text-neutral-300 text-lg leading-relaxed">
            {currentStep.content}
          </p>
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
