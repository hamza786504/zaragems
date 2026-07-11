'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '../../../../_components/Admin/Sidebar';
import Header from '../../../../_components/Admin/Header';
import { Upload, X, Save, ArrowLeft, Loader2, Image as ImageIcon, Link as LinkIcon, Trash } from 'lucide-react';
import Link from 'next/link';
import Button from '../../../../_components/Admin/Button';

const AddProductPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('General');
  const [collections, setCollections] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [SKU, setSKU] = useState('');
  const [barcode, setBarcode] = useState('');
  const [inventory, setInventory] = useState('0');
  const [status, setStatus] = useState('active'); // active, draft, archived
  const [collectionId, setCollectionId] = useState('');
  const [vendor, setVendor] = useState('');
  const [productType, setProductType] = useState('');
  const [variants, setVariants] = useState([]); // array of { size, color, inventory, price }
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');

  const tabs = ['General', 'Variants', 'Inventory'];

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/collections');
        const data = await res.json();
        if (data.success) {
          setCollections(data.collections);
        }
      } catch (err) {
        console.error('Error loading collections:', err);
      }
    };
    fetchCollections();
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [...images];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        } else {
          alert('Upload failed: ' + data.error);
        }
      }
      setImages(uploadedUrls);
    } catch (err) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddVariant = () => {
    setVariants([...variants, { size: '', color: '', inventory: 0, price: Number(price) || 0 }]);
  };

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = field === 'inventory' || field === 'price' ? Number(value) : value;
    setVariants(updated);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleSave = async (customStatus) => {
    if (!title) {
      alert('Product title is required.');
      return;
    }
    if (!price || isNaN(Number(price))) {
      alert('Valid product price is required.');
      return;
    }

    setSaving(true);
    const productStatus = customStatus || status;

    const parsedSizes = sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
    const parsedColors = colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : [];

    const productPayload = {
      title,
      description,
      images,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      costPerItem: costPerItem ? Number(costPerItem) : undefined,
      SKU,
      barcode,
      inventory: Number(inventory),
      status: productStatus,
      collectionId: collectionId || null,
      vendor,
      productType,
      variants,
      sizes: parsedSizes,
      colors: parsedColors
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Product created successfully!');
        router.push('/admin/products');
      } else {
        alert('Error creating product: ' + data.error);
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

      <main className="relative pb-0 min-h-screen bg-surface-container-lowest text-on-surface">
        {/* Header Section */}
        <div className="max-w-[1200px] mx-auto px-0 md:px-6 py-2 md:py-6 border-b border-outline-variant mb-6">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <Link className="text-label-md hover:text-primary transition-colors flex items-center gap-1" href="/admin/products">
              <ArrowLeft size={14} /> Products
            </Link>
            <span>/</span>
            <span className="text-label-md font-bold text-on-surface">Add Product</span>
          </div>
          <div className="flex justify-between items-center">
            <h2 className="text-headline-lg font-headline-lg font-bold">New Product</h2>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-label-md rounded-full font-bold uppercase ${status === 'active' ? 'bg-primary-container/20 text-primary' : 'bg-surface-variant text-on-surface-variant'
                }`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-[1200px] mx-auto px-0 md:px-6">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 font-label-md text-label-md transition-colors whitespace-nowrap ${activeTab === tab
                  ? 'border-b-2 border-primary text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Pages */}
          {activeTab === 'General' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Side */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Title & Description */}
                <section className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm space-y-4">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                      Title <span className="text-error">*</span>
                    </label>
                    <input
                      className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:ring-1 focus:ring-primary focus:outline-none bg-white text-on-surface"
                      type="text"
                      placeholder="Product Title (e.g. Premium Denim Jacket)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:ring-1 focus:ring-primary focus:outline-none bg-white text-on-surface"
                      rows="6"
                      placeholder="Product description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </section>

                {/* Media */}
                <section className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline-md text-headline-md font-bold">Media</h3>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="text-primary font-label-md hover:underline flex items-center gap-1"
                    >
                      <LinkIcon size={14} /> Add from URL
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Image Cards */}
                    {images.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg border border-outline-variant overflow-hidden group bg-surface-container-low">
                        <Image src={url} alt="product" className="w-full h-full object-cover" width={200} height={200} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Drag and Drop / Select Card */}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-outline-variant hover:border-primary flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-surface-container-low transition-all">
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin text-primary mb-2" size={24} />
                          <span className="text-label-md text-on-surface-variant">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="text-on-surface-variant mb-2" size={24} />
                          <span className="text-label-md text-on-surface font-bold text-center">Upload Image</span>
                          <span className="text-[10px] text-on-surface-variant mt-1">Sanity Storage</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </section>

                {/* Organization Extra (Sizes/Colors tags) */}
                <section className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm space-y-4">
                  <h3 className="font-headline-md text-headline-md font-bold">Product Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-md font-bold text-on-surface-variant mb-2">Sizes (comma separated)</label>
                      <input
                        type="text"
                        className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                        placeholder="e.g. S, M, L, XL"
                        value={sizes}
                        onChange={(e) => setSizes(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-label-md font-bold text-on-surface-variant mb-2">Colors (comma separated)</label>
                      <input
                        type="text"
                        className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                        placeholder="e.g. Black, White, Navy"
                        value={colors}
                        onChange={(e) => setColors(e.target.value)}
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Side */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Status Card */}
                <section className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm">
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Product Status</label>
                  <select
                    className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </section>

                {/* Organization */}
                <section className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm space-y-4">
                  <h3 className="font-headline-md text-headline-md font-bold">Organization</h3>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">Collection</label>
                    <select
                      className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                      value={collectionId}
                      onChange={(e) => setCollectionId(e.target.value)}
                    >
                      <option value="">Select collection...</option>
                      {collections.map(col => (
                        <option key={col._id} value={col._id}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">Product Type / Category</label>
                    <input
                      className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                      type="text"
                      placeholder="e.g. Footwear, Apparel"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">Vendor / Brand</label>
                    <input
                      className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                      type="text"
                      placeholder="e.g. Zaragems"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                    />
                  </div>
                </section>

                {/* Pricing Card */}
                <section className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm space-y-4">
                  <h3 className="font-headline-md text-headline-md font-bold">Pricing</h3>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                      Price ($) <span className="text-error">*</span>
                    </label>
                    <input
                      className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">Compare-at price ($)</label>
                    <input
                      className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                      type="number"
                      placeholder="0.00"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">Cost per item ($)</label>
                    <input
                      className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                      type="number"
                      placeholder="0.00"
                      value={costPerItem}
                      onChange={(e) => setCostPerItem(e.target.value)}
                    />
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'Variants' && (
            <section className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold">Product Variants</h3>
                  <p className="text-body-sm text-on-surface-variant mt-1">Specify sizes, colors, and stock for variations</p>
                </div>
                <Button
                  onClick={handleAddVariant}
                  size="sm"
                >
                  Add Variant
                </Button>
              </div>

              {variants.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">
                  No variants defined. The product will be sold as a single default option.
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-4 p-4 border border-outline-variant rounded-lg bg-surface-container-low">
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Size</label>
                        <input
                          type="text"
                          className="w-full border border-outline-variant rounded-lg p-2 bg-white text-on-surface"
                          placeholder="e.g. M"
                          value={variant.size}
                          onChange={(e) => handleUpdateVariant(index, 'size', e.target.value)}
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Color</label>
                        <input
                          type="text"
                          className="w-full border border-outline-variant rounded-lg p-2 bg-white text-on-surface"
                          placeholder="e.g. Red"
                          value={variant.color}
                          onChange={(e) => handleUpdateVariant(index, 'color', e.target.value)}
                        />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Price ($)</label>
                        <input
                          type="number"
                          className="w-full border border-outline-variant rounded-lg p-2 bg-white text-on-surface"
                          placeholder="Variant price"
                          value={variant.price}
                          onChange={(e) => handleUpdateVariant(index, 'price', e.target.value)}
                        />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Stock</label>
                        <input
                          type="number"
                          className="w-full border border-outline-variant rounded-lg p-2 bg-white text-on-surface"
                          placeholder="Stock count"
                          value={variant.inventory}
                          onChange={(e) => handleUpdateVariant(index, 'inventory', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="p-2 text-error hover:bg-error-container/10 rounded transition-colors"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'Inventory' && (
            <section className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="font-headline-md text-headline-md font-bold">Inventory Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">SKU (Stock Keeping Unit)</label>
                  <input
                    className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                    type="text"
                    placeholder="e.g. NAZ-DEN-JKT-01"
                    value={SKU}
                    onChange={(e) => setSKU(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Barcode (ISBN, UPC, GTIN)</label>
                  <input
                    className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                    type="text"
                    placeholder="e.g. 123456789012"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Quantity In Stock</label>
                  <input
                    className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-on-surface"
                    type="number"
                    placeholder="0"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="sticky bottom-0 w-full bg-surface-container border-t border-outline-variant py-2 px-2 sm:px-4 sm:pt-3 z-40 flex justify-between items-center shadow-lg mt-5">
          <Button
            href="/admin/products"
            variant="outline"
            className="text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Button
              disabled={saving}
              onClick={() => handleSave('draft')}
              variant="outline"
              className="text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2"
            >
              <span className="sm:hidden">Draft</span>
              <span className="hidden sm:inline">Save as Draft</span>
            </Button>
            <Button
              disabled={saving}
              onClick={() => handleSave()}
              icon={saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              className="text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2"
            >
              <span className="hidden sm:inline">Save Product</span>
            </Button>
          </div>
        </footer>
      </main>
    </>
  );
};

export default AddProductPage;