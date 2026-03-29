const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

router.post('/create-order', verifyToken, async (req, res) => {
    try {
        // Amount for premium plan (e.g., ₹299 INR)
        const amount = 29900; // in paise (₹299.00 * 100)
        
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            return res.status(500).json({ error: 'Failed to create Razorpay order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({ error: 'Could not create order' });
    }
});

router.post('/verify', verifyToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
             // Payment successful, update user premium status
             const user = await User.findOneAndUpdate(
                 { email: req.user.email },
                 { isPremium: true },
                 { new: true }
             );
             res.json({ success: true, message: 'Payment verified, User upgraded to Premium!' });
        } else {
             res.status(400).json({ success: false, error: 'Invalid signature. Payment verification failed.' });
        }
    } catch (error) {
        console.error('Razorpay Verify Error:', error);
        res.status(500).json({ error: 'Could not verify payment' });
    }
});

module.exports = router;
