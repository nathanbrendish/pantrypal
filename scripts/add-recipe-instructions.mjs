/**
 * Adds home-cooking instructions to every built-in recipe.
 * Run: node scripts/add-recipe-instructions.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const recipesPath = join(__dirname, "..", "src", "data", "recipes.ts");

function generateInstructions(recipe) {
  const { name, category, ingredients, difficulty, prep_time } = recipe;
  const main = ingredients[0] ?? "ingredients";
  const secondary = ingredients.slice(1, 4);
  const rest = ingredients.slice(4);
  const steps = [];

  steps.push(
    `Prep your ingredients: ${ingredients
      .slice(0, Math.min(ingredients.length, 5))
      .join(", ")}${ingredients.length > 5 ? ", and the rest" : ""}.`
  );

  const cat = String(category).toLowerCase();
  const lowerName = String(name).toLowerCase();

  if (
    cat.includes("salad") ||
    lowerName.includes("salad") ||
    lowerName.includes("hummus")
  ) {
    steps.push(`Wash and chop the fresh ingredients into bite-sized pieces.`);
    steps.push(
      `Combine everything in a large bowl${secondary.length ? `, adding ${secondary.join(", ")}` : ""}.`
    );
    steps.push(`Toss gently, taste for seasoning, and serve immediately.`);
  } else if (
    lowerName.includes("soup") ||
    lowerName.includes("stew") ||
    lowerName.includes("hotpot") ||
    lowerName.includes("curry") ||
    lowerName.includes("chilli")
  ) {
    steps.push(`Heat a splash of oil in a large pan over medium heat.`);
    steps.push(
      `Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.`
    );
    steps.push(
      `Add ${main} and remaining ingredients${rest.length ? ` including ${rest.slice(0, 2).join(" and ")}` : ""}. Pour in any stock, milk, or sauce.`
    );
    steps.push(
      `Simmer gently until everything is tender and flavours have developed (${Math.max(10, Math.round(prep_time * 0.4))}–${Math.max(15, Math.round(prep_time * 0.7))} minutes).`
    );
    steps.push(`Taste, adjust seasoning, and serve hot.`);
  } else if (
    lowerName.includes("pasta") ||
    lowerName.includes("spaghetti") ||
    lowerName.includes("carbonara") ||
    lowerName.includes("lasagne") ||
    lowerName.includes("penne") ||
    lowerName.includes("gnocchi") ||
    lowerName.includes("risotto") ||
    ingredients.some((i) => /pasta|spaghetti|penne|macaroni|lasagne|risotto|arborio|gnocchi/i.test(i))
  ) {
    steps.push(`Bring a large pan of salted water to the boil (or warm stock for risotto).`);
    steps.push(
      `Cook the pasta or rice according to pack instructions until just tender.`
    );
    steps.push(
      `Meanwhile, prepare the sauce: cook ${secondary[0] ?? "the aromatics"} and remaining ingredients in a separate pan.`
    );
    steps.push(
      `Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.`
    );
    steps.push(`Serve immediately while hot.`);
  } else if (
    lowerName.includes("stir fry") ||
    lowerName.includes("fried rice") ||
    lowerName.includes("fajita") ||
    lowerName.includes("pad thai") ||
    cat.includes("asian") ||
    cat.includes("thai") ||
    cat.includes("chinese") ||
    cat.includes("japanese")
  ) {
    steps.push(`Heat a wok or large frying pan over high heat with a little oil.`);
    steps.push(
      `Cook ${main} until sealed and nearly cooked through, then set aside if needed.`
    );
    steps.push(
      `Stir-fry vegetables and aromatics until tender-crisp, then return ${main} to the pan.`
    );
    steps.push(
      `Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed.`
    );
  } else if (
    lowerName.includes("bake") ||
    lowerName.includes("pie") ||
    lowerName.includes("roast") ||
    lowerName.includes("pizza") ||
    lowerName.includes("jacket") ||
    lowerName.includes("enchilada") ||
    lowerName.includes("parmesan") ||
    difficulty === "Hard"
  ) {
    steps.push(`Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.`);
    steps.push(
      `Prepare the filling or base using ${main}${secondary.length ? ` with ${secondary.slice(0, 2).join(" and ")}` : ""}.`
    );
    steps.push(
      `Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.`
    );
    steps.push(
      `Bake until golden and cooked through (${Math.max(15, Math.round(prep_time * 0.5))}–${Math.max(25, prep_time)} minutes). Rest briefly before serving.`
    );
  } else if (
    lowerName.includes("omelette") ||
    lowerName.includes("egg") ||
    lowerName.includes("breakfast") ||
    lowerName.includes("full english") ||
    lowerName.includes("shakshuka")
  ) {
    steps.push(`Heat a frying pan over medium heat with a little butter or oil.`);
    steps.push(
      `Cook any fillings (meat, vegetables) until ready, then add eggs or pour in beaten eggs.`
    );
    steps.push(
      `Cook until set to your liking, folding if making an omelette, or simmer gently for shakshuka-style dishes.`
    );
    steps.push(`Season well and serve straight away with bread if desired.`);
  } else if (
    lowerName.includes("burger") ||
    lowerName.includes("taco") ||
    lowerName.includes("wrap") ||
    lowerName.includes("burrito") ||
    lowerName.includes("quesadilla") ||
    lowerName.includes("nacho")
  ) {
    steps.push(
      `Cook ${main} in a pan until browned and cooked through, seasoning as you go.`
    );
    steps.push(`Warm tortillas, buns, or chips and prepare fresh toppings.`);
    steps.push(
      `Assemble with ${secondary.slice(0, 3).join(", ") || "your toppings"}, add sauces, and serve immediately.`
    );
  } else if (
    lowerName.includes("grill") ||
    lowerName.includes("chop") ||
    lowerName.includes("steak") ||
    lowerName.includes("salmon") ||
    lowerName.includes("kiev") ||
    lowerName.includes("satay")
  ) {
    steps.push(`Pat ${main} dry and season generously.`);
    steps.push(
      `Cook in a hot pan, under the grill, or in the oven until cooked through and nicely browned.`
    );
    steps.push(
      `Meanwhile prepare sides such as ${secondary.slice(0, 2).join(" and ") || "vegetables or rice"}.`
    );
    steps.push(`Rest the protein briefly, plate with sides, and serve.`);
  } else {
    steps.push(`Heat a suitable pan or pot over medium heat with a little oil or butter.`);
    steps.push(
      `Cook ${main} until sealed or softened, then add ${secondary.slice(0, 2).join(" and ") || "the remaining ingredients"}.`
    );
    if (rest.length) {
      steps.push(`Stir in ${rest.slice(0, 3).join(", ")} and cook until everything is tender and well combined.`);
    } else {
      steps.push(`Continue cooking until everything is tender and well combined.`);
    }
    steps.push(
      `Taste and adjust seasoning. Serve hot${prep_time <= 20 ? " straight from the pan" : ""}.`
    );
  }

  return steps;
}

const source = readFileSync(recipesPath, "utf8");
const match = source.match(/export const BUILTIN_RECIPES: Recipe\[\] = (\[[\s\S]*\]);/);
if (!match) {
  console.error("Could not parse BUILTIN_RECIPES array");
  process.exit(1);
}

const recipes = JSON.parse(match[1]);
let updated = 0;

for (const recipe of recipes) {
  recipe.instructions = generateInstructions(recipe);
  updated++;
}

const header = `import type { Recipe } from "@/types/recipes";\n\nexport const BUILTIN_RECIPES: Recipe[] = `;
const output = `${header}${JSON.stringify(recipes, null, 2)};\n`;
writeFileSync(recipesPath, output);
console.log(`Updated ${updated} recipes with instructions.`);
