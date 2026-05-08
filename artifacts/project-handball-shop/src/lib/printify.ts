export type PrintifyColorValue = {
  id: number;
  title: string;
  colors: string[];
};

export type PrintifyOption = {
  name: string;
  type: string;
  values: PrintifyColorValue[];
};

export type PrintifyVariant = {
  id: number;
  title: string;
  price: number;
  is_enabled: boolean;
  options: number[];
};

export type PrintifyImage = {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
  is_selected_for_publishing: boolean;
};

export type PrintifyProduct = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: PrintifyImage[];
  variants: PrintifyVariant[];
  options: PrintifyOption[];
  visible: boolean;
};

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  colorImages: Record<string, number>;
  sizes: string[];
  colors: ProductColor[];
  category: string;
  isNew?: boolean;
};

function inferCategory(tags: string[]): string {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.some((t) => t.includes("hoodie") || t.includes("sweatshirt")))
    return "Hoodies";
  if (
    lower.some(
      (t) => t.includes("t-shirt") || t.includes("tee") || t.includes("jersey")
    )
  )
    return "Tees";
  if (lower.some((t) => t.includes("tank"))) return "Tanks";
  return "Accessories";
}

export function adaptPrintifyProduct(p: PrintifyProduct): Product {
  const colorOption = p.options.find((o) => o.name === "Colors");
  const sizeOption = p.options.find((o) => o.name === "Sizes");

  const enabledVariants = p.variants.filter((v) => v.is_enabled);

  const enabledColorIds = new Set<number>();
  const enabledSizeIds = new Set<number>();
  for (const v of enabledVariants) {
    for (const optId of v.options) {
      if (colorOption?.values.some((cv) => cv.id === optId))
        enabledColorIds.add(optId);
      if (sizeOption?.values.some((sv) => sv.id === optId))
        enabledSizeIds.add(optId);
    }
  }

  const colors: ProductColor[] = (colorOption?.values ?? [])
    .filter((cv) => enabledColorIds.has(cv.id))
    .map((cv) => ({ name: cv.title, hex: cv.colors[0] ?? "#000000" }));

  const sizes = (sizeOption?.values ?? [])
    .filter((sv) => enabledSizeIds.has(sv.id))
    .map((sv) => sv.title);

  const price =
    enabledVariants.length > 0
      ? Math.min(...enabledVariants.map((v) => v.price)) / 100
      : 0;

  const publishedImages = p.images.filter(
    (img) => img.is_selected_for_publishing
  );
  const images = publishedImages.map((img) => img.src);
  const defaultImage =
    p.images.find((img) => img.is_default)?.src ?? images[0] ?? "";

  const variantColorMap = new Map<number, string>();
  for (const v of enabledVariants) {
    for (const colorVal of colorOption?.values ?? []) {
      if (v.options.includes(colorVal.id)) {
        variantColorMap.set(v.id, colorVal.title);
        break;
      }
    }
  }

  const colorImages: Record<string, number> = {};
  for (let i = 0; i < publishedImages.length; i++) {
    const img = publishedImages[i];
    for (const variantId of img.variant_ids) {
      const colorName = variantColorMap.get(variantId);
      if (colorName && !(colorName in colorImages)) {
        colorImages[colorName] = i;
        break;
      }
    }
  }

  return {
    id: p.id,
    name: p.title,
    price,
    description: p.description?.replace(/<[^>]+>/g, " ").trim() ?? "",
    image: defaultImage,
    images,
    colorImages,
    sizes,
    colors,
    category: inferCategory(p.tags),
  };
}
