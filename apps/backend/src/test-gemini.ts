import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!,
);

async function main() {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-001",
  });

  const result = await model.embedContent(
    "What is your refund policy?",
  );

  const embedding =
    result.embedding.values;

  console.log(
    "Dimensions:",
    embedding.length,
  );

  console.log(
    "First 5 values:",
    embedding.slice(0, 5),
  );
}

main().catch(console.error);