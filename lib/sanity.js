import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: "wbr93909",
  dataset: "production",
  apiVersion: "2025-02-05",
  useCdn: true,
});
