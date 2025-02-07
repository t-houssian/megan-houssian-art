import { sanityClient } from "../lib/sanity";
import Image from "next/image";

export async function getStaticProps() {
    const products = await sanityClient.fetch(`*[_type == "artProduct"]`);
    return { props: { products } };
}

export default function Home({ products }) {
    const handleCheckout = async (product) => {
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [product] }),
        });
        
        const data = await res.json();
        window.location.href = data.url;
    };
    
    return (
        <div className="grid grid-cols-3 gap-6 p-10">
            {products.map((product) => (
                <div key={product._id}>
                    <Image src={product.image.asset.url} width={300} height={300} />
                    <h2>{product.title}</h2>
                    <p>${product.price}</p>
                    <button 
                        onClick={() => handleCheckout(product)}
                        className="bg-blue-500 text-white px-4 py-2"
                    >
                        Buy Now
                    </button>
                </div>
            ))}
        </div>
    );
}
