import { useState } from 'react';
import Image from 'next/image';

export default function OnboardingModal({ isOpen, onClose, isManualOpen = false }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Your Wallet is Ready',
      content: 'Deposit SOL to your wallet address. This wallet holds your funds for creating and funding campaigns.',
      images: ['/onboarding/WalletPage.png']
    },
    {
      title: 'Browse Active Campaigns',
      content: 'Click "Browse Campaigns" in the top bar to view all active campaigns. See what tokens need funding and click any campaign for full details.',
      images: ['/onboarding/AllCampaigns.png']
    },
    {
      title: 'Create a Campaign',
      content: 'Tweet @XFundDex create TOKEN_ADDRESS to start a $300 campaign. Include logo and banner images in your tweet, or upload them later on the site.',
      images: ['/onboarding/CreateTweet.png']
    },
    {
      title: 'Update Your Existing Campaign',
      content: 'Navigate to your campaign page and click "Update Campaign". Tweet the verification code shown in the pop up in order to prove you are the owner of the Twitter account, then add images, description, and social links.',
      images: ['/onboarding/UpdateModal.png', '/onboarding/UpdatePage.png']
    },
    {
      title: 'Fund a Campaign',
      content: 'Tweet @XFundDex fund AMOUNT TOKEN_ADDRESS to contribute SOL from your wallet. Funds are pooled together to pay for DEXScreener updates.',
      images: ['/onboarding/FundTweet.png']
    },
    {
      title: 'Export Your Keys',
      content: 'Tweet the verification code in order to prove you are the owner of the Twitter account. This securely exports your private key to import into any Solana wallet.',
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
        <div className="mb-4 space-y-3 max-h-[45vh]">
          {/* Top row: UpdateDex tweet full width */}
          <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 max-h-[18vh] flex items-center justify-center">
            <img src={images[2]} alt="Update Tweet" className="w-full h-full object-contain" />
          </div>

          {/* Bottom row: UpdateModal + UpdatePage side by side */}
          <div className="grid grid-cols-2 gap-3 max-h-[25vh]">
            <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 h-full flex items-center justify-center">
              <img src={images[0]} alt="Update Modal" className="w-full h-full object-contain" />
            </div>
            <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 h-full flex items-center justify-center">
              <img src={images[1]} alt="Update Page" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      );
    }

    // 2 images
    if (images.length === 2) {
      // Export Keys (step 5): stack vertically on mobile
      if (step === 5) {
        return (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-h-[50vh] md:h-96">
            {images.map((img, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 h-48 md:h-full flex items-center justify-center">
                <img src={img} alt={`${currentStep.title} - ${idx + 1}`} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        );
      }

      // Other 2-image layouts: side by side with limited height on mobile
      return (
        <div className="mb-4 grid grid-cols-2 gap-3 md:gap-4 max-h-[35vh] md:h-96">
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
      <div className="mb-4 max-h-[45vh] flex items-center justify-center">
        <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 max-h-full flex items-center justify-center">
          <img src={images[0]} alt={currentStep.title} className="max-h-[45vh] w-auto object-contain" />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
      <div className="bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-6 max-w-4xl w-full shadow-2xl max-h-[95vh] flex flex-col relative">

        {/* Close button (X) in top right - only show when manually opened */}
        {isManualOpen && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors z-10"
            title="Close tutorial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-4 flex-shrink-0">
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
        <div className="text-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-white mb-2">
            {currentStep.title}
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl mx-auto">
            {currentStep.content}
          </p>
        </div>

        {/* Full guide link */}
        <div className="text-center mb-4 flex-shrink-0">
          <a
            href="/how-it-works"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View full guide in How it Works →
          </a>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 flex-shrink-0">
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

          <div className="flex flex-col items-center gap-1">
            <div className="text-neutral-500 text-sm">
              {step + 1} / {steps.length}
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors"
            >
              {isManualOpen ? 'Close tutorial' : 'Skip tutorial'}
            </button>
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            {step === steps.length - 1 ? "Let's Go!" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
