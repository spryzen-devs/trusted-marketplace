import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  sellerVerified: boolean;
  category: string;
  sizes: string[];
};

export const products: Product[] = [
  { id: "p1", name: "Oversized Linen Shirt", price: 128, image: product1, seller: "Atelier Nord", sellerVerified: true, category: "Tops", sizes: ["XS","S","M","L","XL"] },
  { id: "p2", name: "Tailored Wool Trouser", price: 215, image: product2, seller: "Maison Reve", sellerVerified: true, category: "Bottoms", sizes: ["28","30","32","34"] },
  { id: "p3", name: "Structured Leather Tote", price: 340, image: product3, seller: "Câline Studio", sellerVerified: true, category: "Bags", sizes: ["One Size"] },
  { id: "p4", name: "Lug-Sole Court Sneaker", price: 189, image: product4, seller: "Form & Foot", sellerVerified: true, category: "Shoes", sizes: ["38","39","40","41","42"] },
];

export const categories = ["All", "Tops", "Bottoms", "Bags", "Shoes"];
export const sellers = ["All Sellers", "Atelier Nord", "Maison Reve", "Câline Studio", "Form & Foot"];

export const sampleOrders = [
  { id: "ORD-2841", buyer: "Sara K.", product: products[0], status: "new", time: "2 min ago" },
  { id: "ORD-2839", buyer: "James L.", product: products[3], status: "preparing", time: "1 hr ago" },
  { id: "ORD-2832", buyer: "Mira P.", product: products[2], status: "dispatched", time: "Yesterday" },
];
