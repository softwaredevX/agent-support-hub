import { readFile } from "fs/promises";
import path from "path";

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

let cachedFaq: FaqEntry[] | null = null;

export const getFaqEntries = async () => {
  if (cachedFaq) return cachedFaq;

  const filePath = path.join(process.cwd(), "src", "data", "faq.json");
  const raw = await readFile(filePath, "utf-8");
  cachedFaq = JSON.parse(raw) as FaqEntry[];

  return cachedFaq;
};

export const searchFaq = async (query: string) => {
  const list = await getFaqEntries();
  const normalized = query.toLowerCase();

  return list.filter(item =>
    item.question.toLowerCase().includes(normalized)
  );
};
