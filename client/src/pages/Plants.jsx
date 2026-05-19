import CategoryProducts from "./CategoryProducts";

export default function Plants() {
  return (
    <CategoryProducts
      category="Plants"
      title="Plants"
      offerTitle="15% Off Sitewide"
      offerSubtitle="Minimum purchase of Rs. 1499"
      offerCode="SAVE15"
      accent="green"
      priceRanges={[
        { label: "Rs. 0 - Rs. 300", min: 0, max: 300 },
        { label: "Rs. 301 - Rs. 600", min: 301, max: 600 },
        { label: "Rs. 601+", min: 601, max: Number.MAX_SAFE_INTEGER },
      ]}
    />
  );
}
