'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components/UI';
import { authApi } from '@/services/api';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'COMPANY' as 'COMPANY' | 'CANDIDATE',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: formData.role,
            });

            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <div className="mb-8 text-center">
                    <div className="inline-block p-3 bg-green-100 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 mt-2">Join HireAI and transform your hiring process</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm font-medium border border-green-100">
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <Input
                        label="Full Name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        disabled={isLoading}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. john@company.com"
                        disabled={isLoading}
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        disabled={isLoading}
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        disabled={isLoading}
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">I am a</label>
                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="COMPANY"
                                    checked={formData.role === 'COMPANY'}
                                    onChange={handleChange}
                                    className="text-blue-600 mr-2"
                                    disabled={isLoading}
                                />
                                <span className="text-gray-700">Company/Recruiter</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="CANDIDATE"
                                    checked={formData.role === 'CANDIDATE'}
                                    onChange={handleChange}
                                    className="text-blue-600 mr-2"
                                    disabled={isLoading}
                                />
                                <span className="text-gray-700">Candidate</span>
                            </label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full py-3" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <a href="/login" className="text-blue-600 font-bold hover:underline">
                            Sign In
                        </a>
                    </p>
                </div>
            </Card>
        </div>
    );
}
