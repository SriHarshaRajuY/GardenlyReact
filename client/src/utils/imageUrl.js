const FALLBACK_IMAGE = "/images/fallback.png";

export const getImageUrl = (value, fallback = FALLBACK_IMAGE) => {
  if (!value) return fallback;

  const image = String(value).trim();
  if (!image) return fallback;
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  if (image.startsWith("/")) return image;

  return `/images/${image.replace(/^\.?\/?public\/images\/?/, "")}`;
};

export { FALLBACK_IMAGE };
