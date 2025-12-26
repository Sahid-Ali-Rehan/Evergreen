const express = require("express");
const router = express.Router();
const Order = require("../models/orderModal");
const Product = require("../models/Product");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// New route for creating payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { 
        integration_check: 'accept_a_payment',
        amount_in_bdt: amount
      }
    });
    
    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await Order.updateOne(
        { paymentIntentId: paymentIntent.id },
        { $set: { status: 'PaymentSucceeded' } }
      );
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await Order.updateOne(
        { paymentIntentId: failedIntent.id },
        { $set: { status: 'PaymentFailed' } }
      );
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// CHECKOUT ROUTE - FIXED
router.post("/checkout", async (req, res) => {
  try {
    const { 
      items,
      deliveryCharge,
      totalAmount,
      status = "Pending",
      estimatedDeliveryDate,
      name,
      phone,
      jela,
      upazela,  // THIS WAS COMMENTED OUT - NOW IT'S DEFINED!
      address,
      paymentMethod,
      paymentIntentId,
      userId,
      postalCode
    } = req.body;

    console.log('Received checkout request:', { name, phone, jela, upazela, address });

    // Validate required fields - upazela is NOT required here
    const requiredFields = ['items', 'deliveryCharge', 'totalAmount', 'name', 'phone', 'jela', 'address', 'paymentMethod'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Handle Stripe payment validation
    if (paymentMethod === "Stripe") {
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID required for Stripe payments" });
      }
      
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== "succeeded") {
          return res.status(400).json({ error: "Payment not completed. Status: " + paymentIntent.status });
        }
      } catch (stripeError) {
        console.error('Stripe validation error:', stripeError);
        return res.status(400).json({ error: "Invalid payment intent" });
      }
    }

    // Stock validation and reduction
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.productName}. Available: ${product.stock}`
        });
      }

      if (product.images && product.images.length > 0) {
        item.productImage = product.images[0];
      } else {
        item.productImage = '';
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // Create order - NOW upazela is defined!
    const order = new Order({
      userId: userId || null,
      items,
      deliveryCharge,
      totalAmount,
      status: paymentMethod === "Stripe" ? "Processing" : status,
      estimatedDeliveryDate: estimatedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      name,
      phone,
      jela,
      upazela: upazela || "Not Provided",  // Now this variable EXISTS!
      address,
      paymentMethod,
      paymentIntentId: paymentMethod === "Stripe" ? paymentIntentId : undefined
    });

    await order.save();
    console.log('Order created successfully:', order._id);
    
    res.status(201).json({ 
      message: "Order placed successfully", 
      order: order.toObject(),
      orderId: order._id
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// Get all orders for admin
router.get("/all-orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.productId', 'productName images')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('All orders error:', error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update order status
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'CancellationRequested'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (status === 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();
    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user orders
router.get('/user-orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Get guest orders by phone
router.get('/guest-orders/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;
    const orders = await Order.find({ 
      phone: phone,
      userId: { $exists: false } 
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Get order count
router.get('/count', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order by ID
router.get("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId)
      .populate("items.productId", "productName images price");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Request cancellation
router.put('/request-cancel/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    if (!['Pending', 'Processing', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel order in current status' });
    }
    
    order.status = 'CancellationRequested';
    await order.save();
    
    res.json({ message: 'Cancellation requested', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel and delete order
router.delete('/cancel/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await Promise.all(order.items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }));

    await Order.findByIdAndDelete(req.params.orderId);
    
    res.json({ message: 'Order cancelled and deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;