import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

async function main() {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
  });

  const result = await model.generateContent(
    "Explain what RAG is in simple terms"
  );


  console.log(result.response.text());
}

main();