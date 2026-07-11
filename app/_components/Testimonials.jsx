'use client'
// components/Testimonials.jsx
const testimonials = [
    {
        id: 1,
        quote:
            'The craftsmanship of the tilla work is unparalleled. It\'s not just a suit; it\'s a piece of art.',
        name: 'Amina R.',
        location: 'London, UK',
    },
    {
        id: 2,
        quote:
            'Zaragems captures the essence of heritage with such modern grace. The fabric quality is exceptional.',
        name: 'Zahra K.',
        location: 'Dubai, UAE',
    },
    {
        id: 3,
        quote:
            'The attention to detail in the embroidery is breathtaking. Truly a luxury experience from order to delivery.',
        name: 'Mariam S.',
        location: 'Lahore, PK',
    },
];

export default function Testimonials() {
    return (
        <section className="py-stack-lg bg-surface">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                <div className="text-center mb-16">
                    <h2 className="text-display-lg-mobile md:text-headline-md font-headline-md text-primary mb-4">
                        Voices of Elegance
                    </h2>
                    <p className="text-label-md font-label-md text-secondary tracking-widest uppercase">
                        Client Reflections
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                    {testimonials.map((t) => (
                        <div
                            key={t.id}
                            className="bg-surface-container-low p-10 flex flex-col items-center text-center space-y-6 border border-secondary/10"
                        >
                            <div className="flex text-secondary">
                                <span className="material-symbols-outlined">star</span>
                                <span className="material-symbols-outlined">star</span>
                                <span className="material-symbols-outlined">star</span>
                                <span className="material-symbols-outlined">star</span>
                                <span className="material-symbols-outlined">star</span>
                            </div>
                            <p className="text-body-lg font-headline-sm italic text-on-surface-variant leading-relaxed">
                                &quot;{t.quote}&quot;
                            </p>
                            <div className="pt-4">
                                <p className="text-label-md font-label-md text-primary uppercase tracking-widest">
                                    {t.name}
                                </p>
                                <p className="text-label-sm font-label-sm text-on-tertiary-container mt-1">
                                    {t.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}