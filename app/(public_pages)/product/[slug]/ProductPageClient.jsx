'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../../store/cartContext';
import ProductCard from '../../../_components/ProductCard';
import SizeChartModal from '../../../_components/SizeChartModal';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductPageClient({ initialProduct }) {
    const { addToCart } = useCart();
    const [product] = useState(initialProduct);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Fetch related products on client mount — prefer other products from the
    // same collection; fall back to matching product type if it has no collection.
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product) return;
            try {
                const collectionId = product.collectionId?._id || product.collectionId;
                const query = collectionId
                    ? `collectionId=${collectionId}`
                    : `type=${product.productType}`;
                const res = await fetch(`/api/products?${query}&status=active`);
                const data = await res.json();
                if (data.success) {
                    const filtered = data.products
                        .filter(p => p._id !== product._id)
                        .slice(0, 4);
                    setRelatedProducts(filtered);
                }
            } catch (error) {
                console.error('Error fetching related products:', error);
            }
        };

        fetchRelatedProducts();
    }, [product]);

    const [mainImage, setMainImage] = useState(product.images?.[0] || product.image || product.primaryImage || '');
    const [activeThumb, setActiveThumb] = useState(0);
    const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);
    const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : 'S');
    const [quantity, setQuantity] = useState(1);
    const [accordionOpen, setAccordionOpen] = useState(null);
    const [sizeChartOpen, setSizeChartOpen] = useState(false);
    const [isAddingToBag, setIsAddingToBag] = useState(false);
    const [bagAdded, setBagAdded] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    // Review form state
    const [reviewForm, setReviewForm] = useState({
        customerName: '',
        customerEmail: '',
        rating: 0,
        hoverRating: 0,
        reviewText: '',
    });
    const [reviewImage, setReviewImage] = useState(null);
    const [reviewImagePreview, setReviewImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSubmitMsg, setReviewSubmitMsg] = useState('');
    const fileInputRef = useRef(null);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            if (!product?._id) return;
            setReviewsLoading(true);
            try {
                const res = await fetch(`/api/reviews?productId=${product._id}`);
                const data = await res.json();
                if (data.success) {
                    setReviews(data.reviews);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [product?._id]);

    const handleThumbClick = (src, index) => {
        setMainImage(src);
        setActiveThumb(index);
    };

    const toggleAccordion = (index) => {
        setAccordionOpen(accordionOpen === index ? null : index);
    };

    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
    const increaseQuantity = () => setQuantity(prev => Math.min(10, prev + 1));

    const handleAddToBag = () => {
        setIsAddingToBag(true);
        addToCart(product.slug, selectedSize, selectedColor, quantity, product);
        setTimeout(() => {
            setIsAddingToBag(false);
            setBagAdded(true);
            setTimeout(() => setBagAdded(false), 2000);
        }, 1000);
    };

    // Review form handlers
    const handleReviewFormChange = (e) => {
        const { name, value } = e.target;
        setReviewForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setReviewImage(file);
        setReviewImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setReviewImage(null);
        setReviewImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.customerName.trim()) return setReviewSubmitMsg('Please enter your name.');
        if (!reviewForm.customerEmail.trim()) return setReviewSubmitMsg('Please enter your email.');
        if (reviewForm.rating < 1) return setReviewSubmitMsg('Please select a star rating.');
        if (!reviewForm.reviewText.trim()) return setReviewSubmitMsg('Please write a review.');

        setSubmittingReview(true);
        setReviewSubmitMsg('');
        try {
            let imageUrl = '';

            if (reviewImage) {
                setUploadingImage(true);
                const fd = new FormData();
                fd.append('file', reviewImage);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
                const uploadData = await uploadRes.json();
                if (uploadData.success) imageUrl = uploadData.url;
                setUploadingImage(false);
            }

            const reviewPayload = {
                productId: product._id,
                customerName: reviewForm.customerName.trim(),
                customerEmail: reviewForm.customerEmail.trim(),
                rating: reviewForm.rating,
                reviewText: reviewForm.reviewText.trim(),
                image: imageUrl,
                status: 'pending',
            };

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewPayload),
            });
            const data = await res.json();

            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to submit review.');

            setReviewSubmitMsg('✓ Thank you! Your review has been submitted for approval.');
            setReviewForm({ customerName: '', customerEmail: '', rating: 0, hoverRating: 0, reviewText: '' });
            handleRemoveImage();
            setAccordionOpen(null);
        } catch (err) {
            setReviewSubmitMsg(`Error: ${err.message}`);
        } finally {
            setSubmittingReview(false);
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md md:py-stack-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                {/* Image Gallery Section */}
                <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
                    <div className="flex-1 relative aspect-[3/4] overflow-hidden group image-zoom">
                        <Image
                            height={580}
                            width={720}
                            src={mainImage}
                            alt="Main Product View"
                            className="w-full h-[580px] object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-label-sm text-primary uppercase tracking-widest">New Arrival</span>
                        </div>
                    </div>
                    <div className="flex md:flex-col gap-4 overflow-x-auto no-scrollbar md:w-24 shrink-0">
                        {(product.images && product.images.length > 0 ? product.images : [product.images?.[0] || '']).map((thumb, idx) => (
                            thumb && (
                                <button
                                    key={idx}
                                    className={`aspect-[3/4] w-20 md:w-full shrink-0 overflow-hidden bg-surface-container transition-colors ${activeThumb === idx ? 'border-2 border-secondary' : 'border border-outline-variant hover:border-secondary'}`}
                                    onClick={() => handleThumbClick(thumb, idx)}
                                >
                                    <Image height={100} width={100} src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            )
                        ))}
                    </div>
                </div>

                {/* Product Information Section */}
                <div className="lg:col-span-5 flex flex-col gap-8 fade-in">
                    <header className="flex flex-col gap-2">
                        <p className="text-label-md text-secondary uppercase tracking-[0.2em]">{product.productType || 'General'}</p>
                        <h1 className="font-headline-lg text-display-lg-mobile md:text-headline-lg text-primary leading-tight">{product.title}</h1>
                        <p className="text-headline-sm font-headline-sm text-secondary">{product.price} Pkr</p>
                    </header>

                    <div className="flex flex-col gap-6">
                        {/* Color */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <span className="text-label-md text-primary uppercase">
                                    Select Color: <span className="font-normal text-on-surface-variant">Default Color</span>
                                </span>
                                <div className="flex gap-4">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-secondary ring-2 ring-offset-2 ring-transparent' : 'border-outline-variant hover:border-secondary'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-label-md text-primary uppercase">Select Size</span>
                                {/* <button
                                    type="button"
                                    className="text-label-sm text-secondary underline underline-offset-4 uppercase bg-transparent border-none cursor-pointer"
                                    onClick={() => setSizeChartOpen(true)}
                                >
                                    Size Guide
                                </button> */}
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {(product.sizes || ['One Size']).map((size) => (
                                    <button
                                        key={size}
                                        className={`py-3 text-label-md text-primary transition-all ${selectedSize === size ? 'border-2 border-secondary bg-surface-container font-bold' : 'border border-outline-variant hover:border-secondary hover:bg-surface-container'}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex flex-col gap-3">
                            <span className="text-label-md text-primary uppercase">Quantity</span>
                            <div className="flex items-center gap-0">
                                <button
                                    className="w-12 h-12 flex items-center justify-center border border-outline-variant hover:border-secondary hover:bg-surface-container transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    onClick={decreaseQuantity}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    <span className="material-symbols-outlined text-lg">remove</span>
                                </button>
                                <div className="w-16 h-12 flex items-center justify-center border-t border-b border-outline-variant bg-transparent">
                                    <span className="text-body-md text-primary font-medium">{quantity}</span>
                                </div>
                                <button
                                    className="w-12 h-12 flex items-center justify-center border border-outline-variant hover:border-secondary hover:bg-surface-container transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    onClick={increaseQuantity}
                                    disabled={quantity >= 10}
                                    aria-label="Increase quantity"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                </button>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                className={`cursor-pointer w-full py-3.5 text-white font-label-md uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 border border-secondary ${bagAdded ? 'bg-secondary' : 'bg-primary hover:scale-[1.02] active:scale-[0.98]'}`}
                                onClick={handleAddToBag}
                                disabled={isAddingToBag}
                            >
                                {isAddingToBag ? (
                                    <>Adding...</>
                                ) : bagAdded ? (
                                    <>Added to Cart</>
                                ) : (
                                    <>Add to Cart</>
                                )}
                            </button>
                            <button className="cursor-pointer w-full py-3.5 border border-secondary text-primary font-label-md uppercase tracking-widest hover:bg-surface-container-low transition-all">
                                Buy Now
                            </button>
                        </div>

                        {/* Accordion Specs */}
                        <div className="flex flex-col border-t border-outline-variant mt-8">
                            {['Product Details', 'Care Instructions', 'Shipping & Returns'].map((label, idx) => {
                                // Hide the Product Details accordion when there's no real description.
                                if (idx === 0 && (!product.description || product.description.trim().length <= 1)) return null;
                                const content = [
                                    <div key="details" className="pb-6 text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </div>,
                                    <div key="care" className="pb-6 text-body-md text-on-surface-variant">
                                        Store in the provided suede pouch or a lined jewellery box. Avoid contact with perfume, lotions, and harsh chemicals. Clean gently with a soft, dry cloth to preserve the gemstone’s brilliance.
                                    </div>,
                                    <div key="shipping" className="pb-6 text-body-md text-on-surface-variant">
                                        Complimentary shipping on all domestic orders above PKR 10,000. Returns accepted within 7 days in original condition.
                                    </div>,
                                ];
                                return (
                                    <div key={idx} className="accordion-item border-b border-outline-variant">
                                        <button className="w-full py-6 flex justify-between items-center group" onClick={() => toggleAccordion(idx)}>
                                            <span className="font-label-md text-primary uppercase">{label}</span>
                                            <span className={`material-symbols-outlined transition-transform duration-300 ${accordionOpen === idx ? 'rotate-180' : ''}`}>expand_more</span>
                                        </button>
                                        <div className={`overflow-hidden transition-max-height duration-300 ease-out ${accordionOpen === idx ? 'max-h-96' : 'max-h-0'}`}>
                                            {content[idx]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section className="mt-stack-lg border-t border-secondary/30 pt-stack-md">
                <div className="flex flex-col gap-12">
                    {/* Reviews Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-headline-md text-headline-md text-primary">Voices of our Community</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex text-secondary">
                                    {[1,2,3,4,5].map(s => (
                                        <span key={s} className="material-symbols-outlined">
                                            {avgRating && s <= Math.round(parseFloat(avgRating)) ? 'star' : avgRating ? 'star_outline' : 'star'}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-body-md text-on-surface-variant">
                                    {reviews.length > 0 ? `${avgRating}/5 based on ${reviews.length} review${reviews.length > 1 ? 's' : ''}` : 'No reviews yet'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Write a Review Form */}
                    <div className="accordion-item border border-outline-variant/30 rounded-lg overflow-hidden">
                        <button
                            className="w-full py-6 px-6 flex justify-between items-center bg-surface-container-low group"
                            onClick={() => toggleAccordion('review-form')}
                        >
                            <span className="font-label-md text-primary uppercase tracking-widest">Share Your Experience</span>
                            <span className={`material-symbols-outlined transition-transform duration-300 ${accordionOpen === 'review-form' ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        <div className={`overflow-hidden transition-[max-height] duration-500 ease-out ${accordionOpen === 'review-form' ? 'max-h-[800px]' : 'max-h-0'}`}>
                            <form onSubmit={handleSubmitReview} className="p-6 flex flex-col gap-6">
                                {/* Name & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-label-sm text-primary uppercase">Your Name</label>
                                        <input
                                            className="w-full bg-transparent border border-outline-variant p-3 focus:border-secondary focus:ring-0 text-body-md"
                                            name="customerName"
                                            placeholder="Ayesha Khan"
                                            value={reviewForm.customerName}
                                            onChange={handleReviewFormChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-label-sm text-primary uppercase">Your Email</label>
                                        <input
                                            className="w-full bg-transparent border border-outline-variant p-3 focus:border-secondary focus:ring-0 text-body-md"
                                            name="customerEmail"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={reviewForm.customerEmail}
                                            onChange={handleReviewFormChange}
                                        />
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-label-sm text-primary uppercase">Your Rating</label>
                                    <div className="flex gap-1 text-secondary">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="material-symbols-outlined text-2xl transition-transform hover:scale-110"
                                                style={{ fontVariationSettings: `'FILL' ${star <= (reviewForm.hoverRating || reviewForm.rating) ? 1 : 0}, 'wght' 300, 'GRAD' 0, 'opsz' 24` }}
                                                onMouseEnter={() => setReviewForm(p => ({ ...p, hoverRating: star }))}
                                                onMouseLeave={() => setReviewForm(p => ({ ...p, hoverRating: 0 }))}
                                                onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                                            >
                                                star
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Review Text */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-label-sm text-primary uppercase">Your Review</label>
                                    <textarea
                                        className="w-full bg-transparent border border-outline-variant p-4 focus:border-secondary focus:ring-0 text-body-md min-h-[120px]"
                                        name="reviewText"
                                        placeholder="Tell us about the fit, fabric, and feel..."
                                        value={reviewForm.reviewText}
                                        onChange={handleReviewFormChange}
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-label-sm text-primary uppercase">Upload Photo (Optional)</label>
                                    {reviewImagePreview ? (
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-24 h-24 rounded overflow-hidden bg-surface-container flex-shrink-0">
                                                <Image src={reviewImagePreview} alt="Preview of the photo you're uploading" className="object-cover" fill sizes="96px" unoptimized />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="flex items-center gap-1 text-label-sm text-error hover:underline"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed border-outline-variant rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:border-secondary transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <span className="material-symbols-outlined text-on-surface-variant">add_a_photo</span>
                                            <span className="text-label-sm text-on-surface-variant">Click to upload a photo</span>
                                            <span className="text-[11px] text-on-surface-variant">PNG, JPG up to 5MB</span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageSelect}
                                    />
                                </div>

                                {/* Submit message */}
                                {reviewSubmitMsg && (
                                    <p className={`text-label-sm px-3 py-2 rounded ${reviewSubmitMsg.startsWith('✓') ? 'bg-secondary/10 text-secondary' : 'bg-error-container/20 text-error'}`}>
                                        {reviewSubmitMsg}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={submittingReview || uploadingImage}
                                    className="w-full md:w-auto px-12 py-4 bg-primary text-white font-label-md uppercase tracking-widest hover:scale-[1.02] transition-all border border-secondary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submittingReview ? (
                                        <><span className="material-symbols-outlined animate-spin">progress_activity</span>{uploadingImage ? 'Uploading photo...' : 'Submitting...'}</>
                                    ) : (
                                        'Submit Review'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="flex flex-col gap-8">
                        {reviewsLoading ? (
                            <div className="flex items-center gap-3 text-on-surface-variant py-4">
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Loading reviews...
                            </div>
                        ) : reviews.length === 0 ? (
                            <p className="text-body-md text-on-surface-variant italic">Be the first to review this product!</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review._id} className="flex flex-col gap-4 pb-8 border-b border-outline-variant/30">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-label-md text-primary">{review.customerName}</span>
                                                <span className="flex items-center gap-1 text-[10px] bg-surface-container px-2 py-0.5 rounded-full text-secondary uppercase font-bold tracking-tighter">
                                                    <span className="material-symbols-outlined text-[12px]">verified</span>
                                                    Verified Purchase
                                                </span>
                                            </div>
                                            <div className="flex text-secondary scale-75 origin-left">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className="material-symbols-outlined">
                                                        {i < review.rating ? 'star' : 'star_outline'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-label-sm text-on-tertiary-container">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-body-md text-on-surface-variant leading-relaxed">{review.reviewText}</p>
                                    {review.image && (
                                        <div className="flex gap-3">
                                            <div className="relative w-20 h-20 rounded overflow-hidden bg-surface-container">
                                                <Image src={review.image} alt={`Photo submitted by ${review.customerName || 'a customer'}`} className="object-cover" fill sizes="80px" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="mt-stack-lg border-t border-secondary/30 pt-stack-md">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-primary">Complete the Look</h2>
                            <p className="text-body-md text-on-surface-variant">Elevate your ensemble with these essentials.</p>
                        </div>
                        <Link className="text-label-md text-secondary border-b border-secondary pb-1 hidden md:block" href={`/collection/${product.collectionId?.slug || 'all'}`}>
                            View Collection
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 gap-y-6">
                        {relatedProducts.map((item) => (
                            <ProductCard
                                key={item._id}
                                id={item._id}
                                title={item.title}
                                price={`PKR ${Number(item.price).toLocaleString()}`}
                                priceNumeric={item.price}
                                image={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=700&fit=crop'}
                                slug={item.slug}
                                type={item.productType}
                                sizes={item.sizes}
                                colors={item.colors}
                            />
                        ))}
                    </div>
                </section>
            )}

            <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
        </main>
    );
}
