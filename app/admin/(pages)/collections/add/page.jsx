'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '../../../../_components/Admin/Sidebar';
import Header from '../../../../_components/Admin/Header';
import { Save, ArrowLeft, Loader2, Upload, X } from 'lucide-react';

const AddCollectionPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setImage(data.url);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert('Collection name is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          slug: slug || undefined, // API auto-slugifies the name if not provided
          image
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Collection created successfully!');
        router.push('/admin/collections');
      } else {
        alert('Error creating collection: ' + data.error);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Sidebar />
      <Header />

      <main className="p-lg bg-surface-container-lowest min-h-screen text-on-surface">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/admin/collections" className="text-label-md hover:text-primary transition-colors flex items-center gap-1 mb-2">
              <ArrowLeft size={14} /> Back to Collections
            </Link>
            <h2 className="text-headline-lg font-headline-lg font-bold">Add New Collection</h2>
            <p className="text-body-md text-on-surface-variant">Create a collection group to organize your apparel products</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Details Card */}
            <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="font-headline-md text-headline-md font-bold mb-2">Collection details</h3>
              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                  Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Summer Collection"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                  Slug (Optional - auto-generated if left blank)
                </label>
                <input
                  type="text"
                  className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. summer-collection"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-2">Description</label>
                <textarea
                  className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  rows="4"
                  placeholder="Describe the items in this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Image Card */}
            <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="font-headline-md text-headline-md font-bold mb-2">Collection Image</h3>
              
              <div className="max-w-[170px]">
                {image ? (
                  <div className="relative aspect-video rounded-lg border border-outline-variant overflow-hidden group bg-surface-container-low">
                    <Image src={image} alt="Collection Cover" className="w-full h-full object-cover" width={400} height={300} />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-video rounded-lg text-center  border-2 border-dashed border-outline-variant hover:border-primary flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-surface-container-low transition-all">
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin text-primary mb-2" size={28} />
                        <span className="text-label-md text-on-surface-variant">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="text-center  text-on-surface-variant mb-2" size={28} />
                        <span className="text-label-md text-on-surface font-bold">Upload Cover Image</span>
                        <span className="text-[11px] text-on-surface-variant mt-1">Recommended aspect ratio: 16:9</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <Link
                href="/admin/collections"
                className="px-6 py-2.5 border border-outline text-on-surface font-bold text-label-md hover:bg-surface-container-high transition-colors rounded-lg"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-8 py-2.5 bg-primary text-on-primary font-bold text-label-md hover:opacity-90 transition-all rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Collection
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default AddCollectionPage;
