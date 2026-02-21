import Link from 'next/link';
import { cormorant, lora } from '../fonts';

export default function SuccessPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-ivory px-4">
      <h1 className={`${cormorant.className} text-4xl font-bold text-brown mb-4`}>Payment Successful!</h1>
      <p className={`${lora.className} text-brown mb-8 text-center max-w-2xl`}>
        Thank you for your purchase! 🎨 Your payment has been processed successfully. 
        Please check the email address you entered at checkout for your confirmation, order details, and shipping information.
        I truly appreciate your support of my art! 🌟
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/" 
          className="bg-btn-brown text-paper px-6 py-3 rounded-md font-semibold hover:bg-btn-brown-hover transition-colors duration-300 text-center"
        >
          Return Home
        </Link>
        <Link 
          href="/originals" 
          className="border border-btn-brown text-btn-brown px-6 py-3 rounded-md font-semibold hover:bg-btn-brown hover:text-paper transition-colors duration-300 text-center"
        >
          View More Art
        </Link>
      </div>
    </section>
  );
}
