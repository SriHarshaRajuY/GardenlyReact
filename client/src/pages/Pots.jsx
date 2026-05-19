import CategoryProducts from "./CategoryProducts";

export default function Pots() {
  return (
    <CategoryProducts
      category="Pots"
      title="Pots & Planters"
      offerTitle="Buy 2 Pots, Get 1 Free"
      offerSubtitle="Limited time offer"
      offerCode="POT3"
      accent="blue"
      priceRanges={[
        { label: "Rs. 0 - Rs. 500", min: 0, max: 500 },
        { label: "Rs. 501 - Rs. 1000", min: 501, max: 1000 },
        { label: "Rs. 1001+", min: 1001, max: Number.MAX_SAFE_INTEGER },
      ]}
    />
  );
}
