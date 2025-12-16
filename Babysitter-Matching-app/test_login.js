import { login } from './login.js';

export default function () {
  console.log("--- Testing Parent Login ---");
  const parentToken = login('parent');
  
  if (parentToken) {
    console.log(`✅ PARENT SUCCESS! Token starts with: ${parentToken.substring(0, 15)}...`);
  } else {
    console.log("❌ PARENT FAILED");
  }

  console.log("\n--- Testing Sitter Login ---");
  const sitterToken = login('sitter');

  if (sitterToken) {
    console.log(`✅ SITTER SUCCESS! Token starts with: ${sitterToken.substring(0, 15)}...`);
  } else {
    console.log("❌ SITTER FAILED");
  }
}