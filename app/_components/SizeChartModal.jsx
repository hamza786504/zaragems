'use client';

import { useEffect } from 'react';

const SIZE_CHART = [
    { size: 'S', chest: '34-36', waist: '28-30', hip: '36-38', length: '40' },
    { size: 'M', chest: '38-40', waist: '32-34', hip: '40-42', length: '41' },
    { size: 'L', chest: '42-44', waist: '36-38', hip: '44-46', length: '42' },
    { size: 'XL', chest: '46-48', waist: '40-42', hip: '48-50', length: '43' },
];

export default function SizeChartModal({ isOpen, onClose }) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-surface w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between border-b border-outline-variant px-6 py-5 sticky top-0 bg-surface z-10">
                    <h3 className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">Size Chart</h3>
                    <button
                        onClick={onClose}
                        className="text-primary hover:text-secondary transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
                        aria-label="Close size chart"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-body-sm text-on-surface-variant mb-6">
                        All measurements are in inches. For the best fit, compare these to a similar garment you already own.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-secondary/30">
                                    <th className="py-3 pr-4 font-label-md text-label-md text-primary uppercase tracking-wider">Size</th>
                                    <th className="py-3 pr-4 font-label-md text-label-md text-primary uppercase tracking-wider">Chest</th>
                                    <th className="py-3 pr-4 font-label-md text-label-md text-primary uppercase tracking-wider">Waist</th>
                                    <th className="py-3 pr-4 font-label-md text-label-md text-primary uppercase tracking-wider">Hip</th>
                                    <th className="py-3 font-label-md text-label-md text-primary uppercase tracking-wider">Length</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {SIZE_CHART.map((row) => (
                                    <tr key={row.size}>
                                        <td className="py-3 pr-4 font-bold text-primary">{row.size}</td>
                                        <td className="py-3 pr-4 text-on-surface-variant">{row.chest}&quot;</td>
                                        <td className="py-3 pr-4 text-on-surface-variant">{row.waist}&quot;</td>
                                        <td className="py-3 pr-4 text-on-surface-variant">{row.hip}&quot;</td>
                                        <td className="py-3 text-on-surface-variant">{row.length}&quot;</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 pt-6 border-t border-outline-variant">
                        <h4 className="font-label-md text-primary uppercase tracking-widest mb-3">How to Measure</h4>
                        <ul className="text-body-sm text-on-surface-variant flex flex-col gap-2 list-disc pl-5">
                            <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape level.</li>
                            <li><strong>Waist:</strong> Measure around your natural waistline, at its narrowest point.</li>
                            <li><strong>Hip:</strong> Measure around the fullest part of your hips.</li>
                            <li><strong>Length:</strong> Measured from the shoulder seam to the hem.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
