'use client';

import { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { X, Upload, Video, Image as ImageIcon } from 'lucide-react';

interface CreatePulseProps {
  onClose: () => void;
}

export default function CreatePulse({ onClose }: CreatePulseProps) {
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !user) return;

    setUploading(true);
    try {
      // Upload video to Cloudinary
      const videoUrl = await uploadToCloudinary(videoFile);

      // Create Pulse document
      await addDoc(collection(db, 'pulses'), {
        userId: user.uid,
        username: user.username,
        userPhoto: user.photoURL || '',
        videoUrl,
        caption,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        resonance: 0,
        echoes: [],
        ripples: 0,
        views: 0,
        duration: 0,
        createdAt: serverTimestamp(),
        isWave: false,
      });

      setUploading(false);
      onClose();
    } catch (error) {
      console.error('Error creating pulse:', error);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-500">Create Pulse</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Video
            </label>
            {videoPreview ? (
              <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden max-w-xs mx-auto">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500 transition-colors"
              >
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">Click to upload video</p>
                <p className="text-sm text-gray-600">MP4, MOV, AVI up to 100MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's this Pulse about?"
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm text-gray-900"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="vibes, trending, fun"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-900"
            />
          </div>

          {/* Upload Status */}
          {uploading && (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-sm font-medium text-gray-900">Uploading to Cloudinary...</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 text-gray-500 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!videoFile || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Create Pulse'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}