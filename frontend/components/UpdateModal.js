import { useState, useEffect } from 'react';
import { requestUpdate, checkUpdateStatus, updateMetadata, uploadImage } from '../lib/api';

/**
 * Update Campaign Metadata Modal
 * Handles tweet verification + metadata editing
 */
export default function UpdateModal({ campaign, xHandle, onClose, onSuccess }) {
  const [step, setStep] = useState('loading'); // loading, show-code, waiting, edit-metadata, saving, success
  const [verificationCode, setVerificationCode] = useState('');
  const [secretPath, setSecretPath] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    main_image_url: campaign.metadata?.main_image_url || '',
    header_image_url: campaign.metadata?.header_image_url || '',
    description: campaign.metadata?.description || '',
    twitter_url: campaign.metadata?.twitter_url || '',
    telegram_url: campaign.metadata?.telegram_url || '',
    website_url: campaign.metadata?.website_url || ''
  });

  // Image upload state
  const [mainImageFile, setMainImageFile] = useState(null);
  const [headerImageFile, setHeaderImageFile] = useState(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);

  // Request update on mount
  useEffect(() => {
    async function initUpdate() {
      try {
        const result = await requestUpdate(campaign.id, xHandle);
        setVerificationCode(result.verification_code);
        setSecretPath(result.secret_path);
        setStep('show-code');
      } catch (err) {
        console.error('Update request error:', err);
        setError('Failed to initialize update. Please try again.');
        setStep('error');
      }
    }

    initUpdate();
  }, [campaign.id, xHandle]);

  // Poll for verification
  useEffect(() => {
    if (step !== 'waiting' || !secretPath) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkUpdateStatus(secretPath);

        if (result.verified) {
          setStep('edit-metadata');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [step, secretPath]);

  const handleTweetClick = () => {
    const tweetText = `@XFundDex update ${verificationCode}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
    setStep('waiting');
  };

  const handleImageUpload = async (file, type) => {
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Validate aspect ratio
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => { img.onload = resolve; });

    const aspectRatio = img.width / img.height;

    if (type === 'main') {
      // Square (1:1) - allow 0.9 to 1.1 ratio
      if (aspectRatio < 0.9 || aspectRatio > 1.1) {
        setError('Main image must be square (1:1 aspect ratio)');
        return;
      }
    } else if (type === 'header') {
      // 3:1 ratio - allow 2.8 to 3.2
      if (aspectRatio < 2.8 || aspectRatio > 3.2) {
        setError('Header image must be 3:1 aspect ratio (e.g., 1500x500px)');
        return;
      }
    }

    try {
      if (type === 'main') {
        setUploadingMain(true);
      } else {
        setUploadingHeader(true);
      }

      const result = await uploadImage(file, type);

      setFormData({
        ...formData,
        [`${type}_image_url`]: result.image_url
      });

      setError('');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      if (type === 'main') {
        setUploadingMain(false);
      } else {
        setUploadingHeader(false);
      }
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      handleImageUpload(file, 'main');
    }
  };

  const handleHeaderImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeaderImageFile(file);
      handleImageUpload(file, 'header');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = async () => {
    setStep('saving');
    setError('');

    try {
      await updateMetadata(secretPath, formData);
      setStep('success');

      // Call onSuccess callback after 2 seconds
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes. Please try again.');
      setStep('edit-metadata');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="card max-w-2xl w-full my-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-white">Update Campaign</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600/30 rounded p-3 mb-4">
            <p className="text-sm text-red-300">{error}</p>
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
            <div className="bg-blue-600/20 border border-blue-600/30 rounded p-3 mb-4">
              <p className="text-sm text-blue-300 font-medium">Step 1: Verify ownership</p>
            </div>

            <p className="text-neutral-300 mb-3 text-sm">
              Tweet this code to verify you own this campaign:
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
            <p className="mt-4 text-neutral-400 text-sm">Waiting for tweet verification...</p>
          </div>
        )}

        {step === 'edit-metadata' && (
          <div>
            <div className="bg-green-600/20 border border-green-600/30 rounded p-3 mb-6">
              <p className="text-sm text-green-300 font-medium">✓ Verified - Edit your campaign</p>
            </div>

            <div className="space-y-6">
              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Main Image (Square - 1:1)
                </label>
                {formData.main_image_url && (
                  <div className="mb-3">
                    <img
                      src={formData.main_image_url}
                      alt="Main"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-neutral-700"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    disabled={uploadingMain}
                    id="main-image-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="main-image-input"
                    className={`flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-center cursor-pointer transition-colors text-sm ${uploadingMain ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingMain ? 'Uploading...' : formData.main_image_url ? 'Change Main Image' : 'Upload Main Image'}
                  </label>
                </div>
                <p className="text-xs text-neutral-500 mt-2">Square (1:1 ratio) - Max 5MB</p>
              </div>

              {/* Header Image */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Header Image (3:1 - e.g., 1500x500px)
                </label>
                {formData.header_image_url && (
                  <div className="mb-3">
                    <img
                      src={formData.header_image_url}
                      alt="Header"
                      className="w-full h-24 object-cover rounded-lg border-2 border-neutral-700"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderImageChange}
                    disabled={uploadingHeader}
                    id="header-image-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="header-image-input"
                    className={`flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-center cursor-pointer transition-colors text-sm ${uploadingHeader ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingHeader ? 'Uploading...' : formData.header_image_url ? 'Change Header Image' : 'Upload Header Image'}
                  </label>
                </div>
                <p className="text-xs text-neutral-500 mt-2">Wide (3:1 ratio) - Max 5MB</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Describe your campaign..."
                />
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Telegram URL
                </label>
                <input
                  type="url"
                  value={formData.telegram_url}
                  onChange={(e) => handleInputChange('telegram_url', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="btn btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploadingMain || uploadingHeader}
                className="btn btn-primary flex-1 text-sm disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {step === 'saving' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-neutral-400 text-sm">Saving changes...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-white font-medium">Campaign updated successfully</p>
            <p className="text-neutral-400 text-sm mt-2">Closing...</p>
          </div>
        )}

        {step === 'error' && (
          <button onClick={onClose} className="btn btn-secondary w-full text-sm">
            Close
          </button>
        )}
      </div>
    </div>
  );
}
