import { useState } from 'react';
import Image from 'next/image';

export default function OnboardingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Your Wallet is Ready',
      content: 'Deposit SOL to the wallet address shown below. This wallet holds your funds for creating and funding campaigns.',
      images: ['/onboarding/WalletPage.png']
    },
    {
      title: 'Browse Active Campaigns',
      content: 'View all active campaigns to see what tokens need funding. Click any campaign for full details.',
      images: ['/onboarding/AllCampaigns.png']
    },
    {
      title: 'Create a Campaign',
      content: 'Tweet @XFundDex create TOKEN_ADDRESS to start a $300 campaign. Include logo and banner images in your tweet, or upload them later on the site.',
      images: ['/onboarding/CreateTweet.png']
    },
    {
      title: 'Update Your Existing Campaign',
      content: 'Navigate to your campaign page and click "Update Campaign". Tweet the verification code shown in the modal to verify ownership, then add images, description, and social links.',
      images: ['/onboarding/UpdateModal.png', '/onboarding/UpdatePage.png']
    },
    {
      title: 'Fund a Campaign',
      content: 'Tweet @XFundDex fund AMOUNT TOKEN_ADDRESS to contribute SOL from your wallet. Funds are pooled together to pay for DEXScreener updates.',
      images: ['/onboarding/FundTweet.png']
    },
    {
      title: 'Export Your Keys',
      content: 'Tweet the verification code to securely export your private key and import into any Solana wallet.',
      images: ['/onboarding/ExportKey.png', '/onboarding/ExportedKey.png']
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

  // Render images - custom layouts per step
  const renderImages = () => {
    const images = currentStep.images;

    // Step 4 (Update Campaign): Tweet on top, 2 modals below
    if (step === 3 && images.length === 3) {
      return (
        <div className="mb-6 space-y-4">
          {/* Top row: UpdateDex tweet full width */}
          <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950">
            <img src={images[2]} alt="Update Tweet" className="w-full h-auto" />
          </div>

          {/* Bottom row: UpdateModal + UpdatePage side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950">
              <img src={images[0]} alt="Update Modal" className="w-full h-auto" />
            </div>
            <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950">
              <img src={images[1]} alt="Update Page" className="w-full h-auto" />
            </div>
          </div>
        </div>
      );
    }

    // 2 images side by side
    if (images.length === 2) {
      return (
        <div className="mb-6 grid grid-cols-2 gap-4 h-96">
          {images.map((img, idx) => (
            <div key={idx} className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 h-full flex items-center justify-center">
              <img src={img} alt={`${currentStep.title} - ${idx + 1}`} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      );
    }

    // Single image
    return (
      <div className="mb-6">
        <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950">
          <img src={images[0]} alt={currentStep.title} className="w-full h-auto" />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
      <div className="bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">

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

        {/* Screenshots */}
        {renderImages()}

        {/* Text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">
            {currentStep.title}
          </h2>
          <p className="text-neutral-300 text-base leading-relaxed max-w-2xl mx-auto">
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
