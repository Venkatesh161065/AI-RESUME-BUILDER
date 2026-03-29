import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';

const Premium = () => {
    const { token, isPremium, setPremiumStatus } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Load Razorpay script dynamically
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        const res = await loadRazorpayScript();

        if (!res) {
            alert('Failed to load Razorpay SDK. Check your connection.');
            setLoading(false);
            return;
        }

        try {
            // 1. Create order on backend
            const orderResponse = await axios.post('http://localhost:5000/api/payment/create-order', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const order = orderResponse.data;

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key', // This is safe to expose on frontend
                amount: order.amount,
                currency: order.currency,
                name: 'AI Resume Builder',
                description: 'Upgrade to Premium Plan',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify on backend
                        const verifyRes = await axios.post('http://localhost:5000/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (verifyRes.data.success) {
                            setPremiumStatus(true);
                            alert('Payment successful! You are now a Premium user.');
                            navigate('/dashboard');
                        }
                    } catch (err) {
                        alert('Payment verification failed.');
                    }
                },
                theme: { color: '#4F46E5' }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment Error:', error);
            alert('Could not initiate payment. Are backend keys configured?');
        } finally {
            setLoading(false);
        }
    };

    if (isPremium) {
        return (
            <div className="h-screen bg-background text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-green-400 mb-4">You are already a Premium Member!</h1>
                <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-card rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                <div className="p-8 text-center bg-gray-900 border-b border-gray-700">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
                        Premium Plan
                    </h2>
                    <p className="text-gray-400 text-sm">Elevate your career with AI</p>
                </div>
                
                <div className="p-8">
                    <div className="text-center mb-8">
                        <span className="text-5xl font-black text-white">₹299</span>
                        <span className="text-gray-500 font-medium">/lifetime</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {['Unlimited AI Generation', 'Unlock All Premium Templates', 'Priority Support', 'ATS Optimization Scoring'].map((feature, i) => (
                            <li key={i} className="flex items-center text-gray-300">
                                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <button 
                        onClick={handlePayment} 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading ? 'Processing...' : 'Upgrade Now'}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Premium;
