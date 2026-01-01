'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/UI';
import { SubscriptionPlan } from '@/types';
import { useStore } from '@/store/useStore';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useStore();

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const plans = [
    {
      type: SubscriptionPlan.FREE,
      price: '$0',
      features: ['Up to 30 candidates', 'Static interview flow', 'Basic proctoring', 'Standard analytics'],
      color: 'gray'
    },
    {
      type: SubscriptionPlan.PRO,
      price: '$99',
      features: ['Unlimited candidates', 'Interactive AI flow', 'Advanced proctoring (Eye/Tab)', 'Resume-based dynamic logic'],
      color: 'blue'
    },
    {
      type: SubscriptionPlan.ULTRA,
      price: '$249',
      features: ['Full Proctoring Suite', 'Multi-face detection', 'Custom AI personas', 'Priority API access'],
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex justify-between items-center px-10 py-6">
        <div className="text-2xl font-bold text-blue-600">HireAI</div>
        <div className="space-x-4">
          <Button variant="ghost" onClick={() => router.push('/login')}>Login</Button>
          <Button onClick={() => router.push('/login')}>Get Started</Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          The Future of Hiring is <span className="text-blue-600">Intelligent</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Scale your recruitment with AI-led technical and behavioral interviews. Google Meet UI, advanced proctoring, and Gemini-powered reasoning.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          {plans.map((plan) => (
            <Card key={plan.type} className="flex flex-col border-2 hover:border-blue-500 transition-colors">
              <h3 className="text-2xl font-bold mb-2">{plan.type}</h3>
              <div className="text-4xl font-black mb-6">{plan.price}<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => router.push('/login')} className="w-full">Choose Plan</Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

