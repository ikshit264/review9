import React from 'react';

export const OrganizationJsonLd = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inverv.entrext.in';

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'IntervAI',
        url: baseUrl,
        logo: `${baseUrl}/logo-full.png`,
        sameAs: [
            'https://twitter.com/intervai',
            'https://linkedin.com/company/intervai',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export const FAQJsonLd = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'How accurate is the AI evaluation?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our Gemini-backed models achieve a 94% correlation with senior human technical reviewers across 12+ role categories.',
                },
            },
            {
                '@type': 'Question',
                name: 'Is the proctoring invasive?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. Everything is processed locally. We never record your video or store biometric signatures on our servers.',
                },
            },
            {
                '@type': 'Question',
                name: 'Can I customize the interview questions?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. In the PRO and ULTRA plans, you can feed specific role requirements and the AI will adapt its reasoning accordingly.',
                },
            },
            {
                '@type': 'Question',
                name: 'What frameworks and languages does the AI assessment support?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The AI assessment supports all major programming languages and frameworks including JavaScript, Python, Java, C++, and more.',
                },
            },
            {
                '@type': 'Question',
                name: 'How does IntervAI compare to traditional human-led screenings?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'IntervAI offers consistent, unbiased, and instant evaluations at scale, saving hundreds of hours of engineering time per month.',
                },
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
