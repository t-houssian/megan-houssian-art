import Stripe from "stripe";

const stripe = new Stripe("your-stripe-secret-key");

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: req.body.items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: { name: item.title },
            unit_amount: item.price * 100,
          },
          quantity: 1,
        })),
        mode: "payment",
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/`,
      });

      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
