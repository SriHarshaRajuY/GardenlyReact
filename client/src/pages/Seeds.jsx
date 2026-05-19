import CategoryProducts from "./CategoryProducts";

export default function Seeds() {
  return (
    <CategoryProducts
      category="Seeds"
      title="Seeds"
      offerTitle="20% Off on Seeds"
      offerSubtitle="Minimum purchase of Rs. 999"
      offerCode="SEED20"
      accent="amber"
      priceRanges={[
        { label: "Rs. 0 - Rs. 100", min: 0, max: 100 },
        { label: "Rs. 101 - Rs. 300", min: 101, max: 300 },
        { label: "Rs. 301+", min: 301, max: Number.MAX_SAFE_INTEGER },
      ]}
    />
  );
}
