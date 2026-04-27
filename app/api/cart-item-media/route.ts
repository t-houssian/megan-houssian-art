import { NextResponse } from "next/server";
import { sanityClient } from "../../../lib/sanity";
import { urlFor } from "../../../sanity/lib/image";

type CartMediaRequestItem = {
  id?: string;
  type?: string;
  originalSlug?: string;
  printSlug?: string;
};

type CartMediaItem = {
  id: string;
  imageUrl?: string;
};

type SanityImage = {
  asset?: {
    _ref?: string;
  };
};

type OriginalMediaResult = {
  _id: string;
  slug?: string;
  mainImage?: SanityImage;
};

type PrintMediaResult = {
  slug?: string;
  mainImage?: SanityImage;
};

const CART_MEDIA_QUERY = `{
  "originals": *[
    _type == "original" &&
    !(_id in path("drafts.**")) &&
    (slug.current in $originalSlugs || _id in $originalSlugs)
  ]{
    _id,
    "slug": coalesce(slug.current, _id),
    mainImage
  },
  "prints": *[
    _type == "print" &&
    !(_id in path("drafts.**")) &&
    slug.current in $printSlugs
  ]{
    "slug": slug.current,
    mainImage
  }
}`;

const normalizeString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const imageUrlFromSanityImage = (image?: SanityImage) =>
  image?.asset ? urlFor(image).width(240).height(240).fit("max").quality(92).url() : undefined;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? (body.items as CartMediaRequestItem[]) : [];
    const originalSlugs = Array.from(
      new Set(items.map((item) => normalizeString(item.originalSlug)).filter(Boolean))
    );
    const printSlugs = Array.from(
      new Set(items.map((item) => normalizeString(item.printSlug)).filter(Boolean))
    );

    if (originalSlugs.length === 0 && printSlugs.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const result = await sanityClient.withConfig({ useCdn: false }).fetch<{
      originals?: OriginalMediaResult[];
      prints?: PrintMediaResult[];
    }>(CART_MEDIA_QUERY, { originalSlugs, printSlugs }, { cache: "no-store" });

    const originalImagesBySlug = new Map<string, string>();
    for (const original of result.originals ?? []) {
      const imageUrl = imageUrlFromSanityImage(original.mainImage);
      if (!imageUrl) continue;
      originalImagesBySlug.set(original._id, imageUrl);
      if (original.slug) originalImagesBySlug.set(original.slug, imageUrl);
    }

    const printImagesBySlug = new Map<string, string>();
    for (const print of result.prints ?? []) {
      const imageUrl = imageUrlFromSanityImage(print.mainImage);
      if (print.slug && imageUrl) printImagesBySlug.set(print.slug, imageUrl);
    }

    const responseItems = items.reduce<CartMediaItem[]>((mediaItems, item) => {
        const id = normalizeString(item.id);
        if (!id) return mediaItems;

        const imageUrl =
          item.type === "original"
            ? originalImagesBySlug.get(normalizeString(item.originalSlug))
            : item.type === "print"
              ? printImagesBySlug.get(normalizeString(item.printSlug))
              : undefined;

        if (imageUrl) {
          mediaItems.push({ id, imageUrl });
        }

        return mediaItems;
      }, []);

    return NextResponse.json({ items: responseItems });
  } catch (error) {
    console.error("Failed to resolve cart item media", error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
