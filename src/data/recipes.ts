import type { Recipe } from "@/types/recipes";

export const BUILTIN_RECIPES: Recipe[] = [
  {
    "id": "recipe-001",
    "name": "Spaghetti Bolognese",
    "description": "Classic Italian pasta with rich meat sauce.",
    "category": "Italian",
    "difficulty": "Easy",
    "prep_time": 35,
    "ingredients": [
      "Spaghetti",
      "Beef Mince",
      "Tomatoes",
      "Onion",
      "Garlic",
      "Olive Oil"
    ],
    "typical_quantities": [
      "400g",
      "500g",
      "400g",
      "1",
      "2 cloves",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Spaghetti, Beef Mince, Tomatoes, Onion, Garlic, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Beef Mince and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-002",
    "name": "Lasagne",
    "description": "Layered pasta bake with meat and cheese.",
    "category": "Italian",
    "difficulty": "Medium",
    "prep_time": 60,
    "ingredients": [
      "Lasagne Sheets",
      "Beef Mince",
      "Tomatoes",
      "Milk",
      "Butter",
      "Flour",
      "Cheese"
    ],
    "typical_quantities": [
      "250g",
      "500g",
      "400g",
      "500ml",
      "50g",
      "50g",
      "200g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Lasagne Sheets, Beef Mince, Tomatoes, Milk, Butter, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Beef Mince and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-003",
    "name": "Carbonara",
    "description": "Creamy pasta with bacon and egg.",
    "category": "Italian",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Spaghetti",
      "Bacon",
      "Eggs",
      "Parmesan",
      "Black Pepper"
    ],
    "typical_quantities": [
      "400g",
      "200g",
      "3",
      "100g",
      "1 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Spaghetti, Bacon, Eggs, Parmesan, Black Pepper.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Bacon and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-004",
    "name": "Chicken Curry",
    "description": "Mild chicken curry with rice.",
    "category": "Indian",
    "difficulty": "Easy",
    "prep_time": 40,
    "ingredients": [
      "Chicken Breast",
      "Rice",
      "Onion",
      "Curry Powder",
      "Coconut Milk",
      "Tomatoes"
    ],
    "typical_quantities": [
      "500g",
      "300g",
      "1",
      "2 tbsp",
      "400ml",
      "200g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Rice, Onion, Curry Powder, Coconut Milk, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Chicken Breast and remaining ingredients including Coconut Milk and Tomatoes. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (16–28 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-005",
    "name": "Chicken Stir Fry",
    "description": "Quick Asian-style stir fry.",
    "category": "Asian",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Chicken Breast",
      "Peppers",
      "Soy Sauce",
      "Rice",
      "Garlic",
      "Ginger"
    ],
    "typical_quantities": [
      "400g",
      "2",
      "3 tbsp",
      "300g",
      "2 cloves",
      "1 inch"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Peppers, Soy Sauce, Rice, Garlic, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Chicken Breast until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Chicken Breast to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-006",
    "name": "Chilli Con Carne",
    "description": "Hearty beef and bean chilli.",
    "category": "Mexican",
    "difficulty": "Easy",
    "prep_time": 45,
    "ingredients": [
      "Beef Mince",
      "Kidney Beans",
      "Tomatoes",
      "Onion",
      "Rice",
      "Cumin"
    ],
    "typical_quantities": [
      "500g",
      "400g",
      "400g",
      "1",
      "300g",
      "1 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef Mince, Kidney Beans, Tomatoes, Onion, Rice, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Beef Mince and remaining ingredients including Rice and Cumin. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (18–31 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-007",
    "name": "Shepherd's Pie",
    "description": "Lamb mince topped with mashed potato.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 50,
    "ingredients": [
      "Lamb Mince",
      "Potatoes",
      "Onion",
      "Carrots",
      "Stock",
      "Butter"
    ],
    "typical_quantities": [
      "500g",
      "1kg",
      "1",
      "2",
      "500ml",
      "50g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Lamb Mince, Potatoes, Onion, Carrots, Stock, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Lamb Mince with Potatoes and Onion.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (25–50 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-008",
    "name": "Cottage Pie",
    "description": "Beef mince topped with mashed potato.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 50,
    "ingredients": [
      "Beef Mince",
      "Potatoes",
      "Onion",
      "Carrots",
      "Stock",
      "Butter"
    ],
    "typical_quantities": [
      "500g",
      "1kg",
      "1",
      "2",
      "500ml",
      "50g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef Mince, Potatoes, Onion, Carrots, Stock, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Beef Mince with Potatoes and Onion.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (25–50 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-009",
    "name": "Fish Pie",
    "description": "Creamy fish and prawn pie with mash.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 55,
    "ingredients": [
      "White Fish",
      "Prawns",
      "Potatoes",
      "Milk",
      "Butter",
      "Peas"
    ],
    "typical_quantities": [
      "400g",
      "200g",
      "1kg",
      "300ml",
      "50g",
      "150g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: White Fish, Prawns, Potatoes, Milk, Butter, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using White Fish with Prawns and Potatoes.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (28–55 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-010",
    "name": "Roast Chicken",
    "description": "Sunday roast with vegetables.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 90,
    "ingredients": [
      "Whole Chicken",
      "Potatoes",
      "Carrots",
      "Onion",
      "Oil",
      "Herbs"
    ],
    "typical_quantities": [
      "1.5kg",
      "1kg",
      "4",
      "2",
      "3 tbsp",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Whole Chicken, Potatoes, Carrots, Onion, Oil, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Whole Chicken with Potatoes and Carrots.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (45–90 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-011",
    "name": "Chicken Alfredo",
    "description": "Creamy pasta with chicken.",
    "category": "Italian",
    "difficulty": "Easy",
    "prep_time": 30,
    "ingredients": [
      "Pasta",
      "Chicken Breast",
      "Cream",
      "Parmesan",
      "Garlic",
      "Butter"
    ],
    "typical_quantities": [
      "400g",
      "400g",
      "200ml",
      "100g",
      "2 cloves",
      "30g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pasta, Chicken Breast, Cream, Parmesan, Garlic, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Chicken Breast and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-012",
    "name": "Tacos",
    "description": "Mexican tacos with seasoned beef.",
    "category": "Mexican",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Tortillas",
      "Beef Mince",
      "Lettuce",
      "Tomatoes",
      "Cheese",
      "Sour Cream"
    ],
    "typical_quantities": [
      "8",
      "400g",
      "1 head",
      "2",
      "150g",
      "100ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Tortillas, Beef Mince, Lettuce, Tomatoes, Cheese, and the rest.",
      "Cook Tortillas in a pan until browned and cooked through, seasoning as you go.",
      "Warm tortillas, buns, or chips and prepare fresh toppings.",
      "Assemble with Beef Mince, Lettuce, Tomatoes, add sauces, and serve immediately."
    ]
  },
  {
    "id": "recipe-013",
    "name": "Burritos",
    "description": "Filled flour tortillas with rice and beans.",
    "category": "Mexican",
    "difficulty": "Easy",
    "prep_time": 30,
    "ingredients": [
      "Tortillas",
      "Rice",
      "Kidney Beans",
      "Chicken Breast",
      "Cheese",
      "Salsa"
    ],
    "typical_quantities": [
      "4",
      "200g",
      "400g",
      "300g",
      "100g",
      "100ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Tortillas, Rice, Kidney Beans, Chicken Breast, Cheese, and the rest.",
      "Cook Tortillas in a pan until browned and cooked through, seasoning as you go.",
      "Warm tortillas, buns, or chips and prepare fresh toppings.",
      "Assemble with Rice, Kidney Beans, Chicken Breast, add sauces, and serve immediately."
    ]
  },
  {
    "id": "recipe-014",
    "name": "Fajitas",
    "description": "Sizzling chicken fajitas with peppers.",
    "category": "Mexican",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Chicken Breast",
      "Peppers",
      "Onion",
      "Tortillas",
      "Spices",
      "Lime"
    ],
    "typical_quantities": [
      "400g",
      "3",
      "2",
      "6",
      "2 tbsp",
      "1"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Peppers, Onion, Tortillas, Spices, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Chicken Breast until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Chicken Breast to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-015",
    "name": "Mac & Cheese",
    "description": "Creamy macaroni cheese bake.",
    "category": "American",
    "difficulty": "Easy",
    "prep_time": 30,
    "ingredients": [
      "Macaroni",
      "Cheddar Cheese",
      "Milk",
      "Butter",
      "Flour"
    ],
    "typical_quantities": [
      "400g",
      "300g",
      "500ml",
      "50g",
      "50g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Macaroni, Cheddar Cheese, Milk, Butter, Flour.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Cheddar Cheese and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-016",
    "name": "Omelette",
    "description": "Quick cheese and ham omelette.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 10,
    "ingredients": [
      "Eggs",
      "Cheese",
      "Ham",
      "Butter",
      "Milk"
    ],
    "typical_quantities": [
      "3",
      "50g",
      "50g",
      "15g",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Eggs, Cheese, Ham, Butter, Milk.",
      "Heat a frying pan over medium heat with a little butter or oil.",
      "Cook any fillings (meat, vegetables) until ready, then add eggs or pour in beaten eggs.",
      "Cook until set to your liking, folding if making an omelette, or simmer gently for shakshuka-style dishes.",
      "Season well and serve straight away with bread if desired."
    ]
  },
  {
    "id": "recipe-017",
    "name": "Full English",
    "description": "Traditional cooked breakfast.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Eggs",
      "Bacon",
      "Sausages",
      "Baked Beans",
      "Tomatoes",
      "Mushrooms",
      "Bread"
    ],
    "typical_quantities": [
      "2",
      "4 rashers",
      "2",
      "200g",
      "2",
      "100g",
      "2 slices"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Eggs, Bacon, Sausages, Baked Beans, Tomatoes, and the rest.",
      "Heat a frying pan over medium heat with a little butter or oil.",
      "Cook any fillings (meat, vegetables) until ready, then add eggs or pour in beaten eggs.",
      "Cook until set to your liking, folding if making an omelette, or simmer gently for shakshuka-style dishes.",
      "Season well and serve straight away with bread if desired."
    ]
  },
  {
    "id": "recipe-018",
    "name": "Tuna Pasta Bake",
    "description": "Cheesy tuna pasta bake.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 35,
    "ingredients": [
      "Pasta",
      "Tuna",
      "Sweetcorn",
      "Milk",
      "Cheese",
      "Flour"
    ],
    "typical_quantities": [
      "400g",
      "2 tins",
      "150g",
      "400ml",
      "200g",
      "50g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pasta, Tuna, Sweetcorn, Milk, Cheese, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Tuna and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-019",
    "name": "Fried Rice",
    "description": "Chinese-style egg fried rice.",
    "category": "Asian",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Rice",
      "Eggs",
      "Peas",
      "Soy Sauce",
      "Spring Onion",
      "Oil"
    ],
    "typical_quantities": [
      "300g",
      "2",
      "100g",
      "3 tbsp",
      "3",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Rice, Eggs, Peas, Soy Sauce, Spring Onion, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Rice until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Rice to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-020",
    "name": "Sweet & Sour Chicken",
    "description": "Crispy chicken in sweet and sour sauce.",
    "category": "Chinese",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Chicken Breast",
      "Peppers",
      "Pineapple",
      "Rice",
      "Soy Sauce",
      "Vinegar"
    ],
    "typical_quantities": [
      "500g",
      "2",
      "200g",
      "300g",
      "3 tbsp",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Peppers, Pineapple, Rice, Soy Sauce, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Chicken Breast until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Chicken Breast to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-021",
    "name": "Thai Green Curry",
    "description": "Fragrant Thai curry with coconut milk.",
    "category": "Thai",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Chicken Breast",
      "Green Curry Paste",
      "Coconut Milk",
      "Rice",
      "Aubergine",
      "Basil"
    ],
    "typical_quantities": [
      "400g",
      "3 tbsp",
      "400ml",
      "300g",
      "1",
      "handful"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Green Curry Paste, Coconut Milk, Rice, Aubergine, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Chicken Breast and remaining ingredients including Aubergine and Basil. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (14–25 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-022",
    "name": "Beef Stew",
    "description": "Slow-cooked beef with vegetables.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 120,
    "ingredients": [
      "Beef",
      "Potatoes",
      "Carrots",
      "Onion",
      "Stock",
      "Flour"
    ],
    "typical_quantities": [
      "600g",
      "500g",
      "3",
      "2",
      "500ml",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef, Potatoes, Carrots, Onion, Stock, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Beef and remaining ingredients including Stock and Flour. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (48–84 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-023",
    "name": "Lamb Hotpot",
    "description": "Layered lamb and potato hotpot.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 90,
    "ingredients": [
      "Lamb",
      "Potatoes",
      "Onion",
      "Stock",
      "Carrots",
      "Thyme"
    ],
    "typical_quantities": [
      "500g",
      "800g",
      "2",
      "400ml",
      "2",
      "1 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Lamb, Potatoes, Onion, Stock, Carrots, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Lamb and remaining ingredients including Carrots and Thyme. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (36–63 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-024",
    "name": "Toad in the Hole",
    "description": "Sausages in Yorkshire pudding batter.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 45,
    "ingredients": [
      "Sausages",
      "Flour",
      "Eggs",
      "Milk",
      "Oil",
      "Onion Gravy"
    ],
    "typical_quantities": [
      "8",
      "150g",
      "3",
      "300ml",
      "2 tbsp",
      "300ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Sausages, Flour, Eggs, Milk, Oil, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Sausages until sealed or softened, then add Flour and Eggs.",
      "Stir in Oil, Onion Gravy and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-025",
    "name": "Chicken Kiev",
    "description": "Breaded chicken with garlic butter.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "Chicken Breast",
      "Butter",
      "Garlic",
      "Breadcrumbs",
      "Parsley",
      "Oil"
    ],
    "typical_quantities": [
      "4",
      "100g",
      "3 cloves",
      "150g",
      "2 tbsp",
      "for frying"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Butter, Garlic, Breadcrumbs, Parsley, and the rest.",
      "Pat Chicken Breast dry and season generously.",
      "Cook in a hot pan, under the grill, or in the oven until cooked through and nicely browned.",
      "Meanwhile prepare sides such as Butter and Garlic.",
      "Rest the protein briefly, plate with sides, and serve."
    ]
  },
  {
    "id": "recipe-026",
    "name": "Hunters Chicken",
    "description": "Chicken with bacon, cheese and BBQ sauce.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 35,
    "ingredients": [
      "Chicken Breast",
      "Bacon",
      "Cheese",
      "BBQ Sauce",
      "Potatoes"
    ],
    "typical_quantities": [
      "4",
      "8 rashers",
      "150g",
      "200ml",
      "600g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Bacon, Cheese, BBQ Sauce, Potatoes.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Chicken Breast until sealed or softened, then add Bacon and Cheese.",
      "Stir in Potatoes and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-027",
    "name": "Jacket Potato",
    "description": "Baked potato with fillings.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 60,
    "ingredients": [
      "Potatoes",
      "Butter",
      "Cheese",
      "Baked Beans",
      "Sour Cream"
    ],
    "typical_quantities": [
      "4 large",
      "50g",
      "100g",
      "400g",
      "100ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Potatoes, Butter, Cheese, Baked Beans, Sour Cream.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Potatoes with Butter and Cheese.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (30–60 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-028",
    "name": "Caesar Salad",
    "description": "Classic romaine salad with dressing.",
    "category": "Salad",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Lettuce",
      "Chicken Breast",
      "Parmesan",
      "Croutons",
      "Caesar Dressing"
    ],
    "typical_quantities": [
      "1 head",
      "200g",
      "50g",
      "100g",
      "4 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Lettuce, Chicken Breast, Parmesan, Croutons, Caesar Dressing.",
      "Wash and chop the fresh ingredients into bite-sized pieces.",
      "Combine everything in a large bowl, adding Chicken Breast, Parmesan, Croutons.",
      "Toss gently, taste for seasoning, and serve immediately."
    ]
  },
  {
    "id": "recipe-029",
    "name": "Greek Salad",
    "description": "Fresh Mediterranean salad.",
    "category": "Salad",
    "difficulty": "Easy",
    "prep_time": 10,
    "ingredients": [
      "Cucumber",
      "Tomatoes",
      "Feta Cheese",
      "Olives",
      "Olive Oil",
      "Oregano"
    ],
    "typical_quantities": [
      "1",
      "3",
      "150g",
      "100g",
      "3 tbsp",
      "1 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Cucumber, Tomatoes, Feta Cheese, Olives, Olive Oil, and the rest.",
      "Wash and chop the fresh ingredients into bite-sized pieces.",
      "Combine everything in a large bowl, adding Tomatoes, Feta Cheese, Olives.",
      "Toss gently, taste for seasoning, and serve immediately."
    ]
  },
  {
    "id": "recipe-030",
    "name": "Pizza",
    "description": "Homemade margherita pizza.",
    "category": "Italian",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "Pizza Dough",
      "Tomatoes",
      "Mozzarella",
      "Basil",
      "Olive Oil"
    ],
    "typical_quantities": [
      "1 base",
      "200g",
      "200g",
      "handful",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pizza Dough, Tomatoes, Mozzarella, Basil, Olive Oil.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Pizza Dough with Tomatoes and Mozzarella.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (20–40 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-031",
    "name": "Risotto",
    "description": "Creamy mushroom risotto.",
    "category": "Italian",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Arborio Rice",
      "Mushrooms",
      "Stock",
      "Onion",
      "Parmesan",
      "White Wine"
    ],
    "typical_quantities": [
      "300g",
      "300g",
      "1L",
      "1",
      "100g",
      "150ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Arborio Rice, Mushrooms, Stock, Onion, Parmesan, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Mushrooms and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-032",
    "name": "Beef Tacos",
    "description": "Seasoned beef tacos with fresh toppings.",
    "category": "Mexican",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Beef Mince",
      "Tortillas",
      "Lettuce",
      "Tomatoes",
      "Cheese"
    ],
    "typical_quantities": [
      "400g",
      "8",
      "1 head",
      "2",
      "100g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef Mince, Tortillas, Lettuce, Tomatoes, Cheese.",
      "Cook Beef Mince in a pan until browned and cooked through, seasoning as you go.",
      "Warm tortillas, buns, or chips and prepare fresh toppings.",
      "Assemble with Tortillas, Lettuce, Tomatoes, add sauces, and serve immediately."
    ]
  },
  {
    "id": "recipe-033",
    "name": "Pork Stir Fry",
    "description": "Quick pork and vegetable stir fry.",
    "category": "Asian",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Pork",
      "Peppers",
      "Soy Sauce",
      "Ginger",
      "Garlic",
      "Rice"
    ],
    "typical_quantities": [
      "400g",
      "2",
      "3 tbsp",
      "1 inch",
      "2 cloves",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pork, Peppers, Soy Sauce, Ginger, Garlic, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Pork until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Pork to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-034",
    "name": "Salmon Teriyaki",
    "description": "Glazed salmon with rice.",
    "category": "Asian",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Salmon",
      "Soy Sauce",
      "Honey",
      "Rice",
      "Broccoli",
      "Sesame Seeds"
    ],
    "typical_quantities": [
      "4 fillets",
      "4 tbsp",
      "2 tbsp",
      "300g",
      "200g",
      "1 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Salmon, Soy Sauce, Honey, Rice, Broccoli, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Salmon until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Salmon to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-035",
    "name": "Vegetable Curry",
    "description": "Mild mixed vegetable curry.",
    "category": "Indian",
    "difficulty": "Easy",
    "prep_time": 30,
    "ingredients": [
      "Potatoes",
      "Cauliflower",
      "Peas",
      "Coconut Milk",
      "Curry Powder",
      "Rice"
    ],
    "typical_quantities": [
      "2",
      "1 head",
      "150g",
      "400ml",
      "2 tbsp",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Potatoes, Cauliflower, Peas, Coconut Milk, Curry Powder, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Potatoes and remaining ingredients including Curry Powder and Rice. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (12–21 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-036",
    "name": "Mushroom Risotto",
    "description": "Earthy mushroom risotto.",
    "category": "Italian",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Arborio Rice",
      "Mushrooms",
      "Stock",
      "Onion",
      "Parmesan",
      "Butter"
    ],
    "typical_quantities": [
      "300g",
      "400g",
      "1L",
      "1",
      "100g",
      "50g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Arborio Rice, Mushrooms, Stock, Onion, Parmesan, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Mushrooms and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-037",
    "name": "Chicken Noodle Soup",
    "description": "Comforting chicken soup.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 40,
    "ingredients": [
      "Chicken",
      "Noodles",
      "Carrots",
      "Celery",
      "Onion",
      "Stock"
    ],
    "typical_quantities": [
      "300g",
      "200g",
      "2",
      "2 sticks",
      "1",
      "1L"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken, Noodles, Carrots, Celery, Onion, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Chicken and remaining ingredients including Onion and Stock. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (16–28 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-038",
    "name": "Beef Burgers",
    "description": "Homemade beef burgers with buns.",
    "category": "American",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Beef Mince",
      "Burger Buns",
      "Lettuce",
      "Tomatoes",
      "Cheese",
      "Onion"
    ],
    "typical_quantities": [
      "500g",
      "4",
      "4 leaves",
      "2",
      "4 slices",
      "1"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef Mince, Burger Buns, Lettuce, Tomatoes, Cheese, and the rest.",
      "Cook Beef Mince in a pan until browned and cooked through, seasoning as you go.",
      "Warm tortillas, buns, or chips and prepare fresh toppings.",
      "Assemble with Burger Buns, Lettuce, Tomatoes, add sauces, and serve immediately."
    ]
  },
  {
    "id": "recipe-039",
    "name": "Chicken Wraps",
    "description": "Grilled chicken wraps with salad.",
    "category": "American",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Chicken Breast",
      "Wraps",
      "Lettuce",
      "Tomatoes",
      "Mayonnaise"
    ],
    "typical_quantities": [
      "400g",
      "4",
      "1 head",
      "2",
      "3 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Wraps, Lettuce, Tomatoes, Mayonnaise.",
      "Cook Chicken Breast in a pan until browned and cooked through, seasoning as you go.",
      "Warm tortillas, buns, or chips and prepare fresh toppings.",
      "Assemble with Wraps, Lettuce, Tomatoes, add sauces, and serve immediately."
    ]
  },
  {
    "id": "recipe-040",
    "name": "Prawn Cocktail",
    "description": "Classic starter with Marie Rose sauce.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Prawns",
      "Lettuce",
      "Mayonnaise",
      "Ketchup",
      "Lemon"
    ],
    "typical_quantities": [
      "300g",
      "1 head",
      "3 tbsp",
      "1 tbsp",
      "1"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Prawns, Lettuce, Mayonnaise, Ketchup, Lemon.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Prawns until sealed or softened, then add Lettuce and Mayonnaise.",
      "Stir in Lemon and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-041",
    "name": "Scampi and Chips",
    "description": "Breaded scampi with chips.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Scampi",
      "Potatoes",
      "Peas",
      "Tartare Sauce",
      "Oil"
    ],
    "typical_quantities": [
      "400g",
      "600g",
      "150g",
      "4 tbsp",
      "for frying"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Scampi, Potatoes, Peas, Tartare Sauce, Oil.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Scampi until sealed or softened, then add Potatoes and Peas.",
      "Stir in Oil and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-042",
    "name": "Sausage and Mash",
    "description": "Bangers and mash with onion gravy.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 30,
    "ingredients": [
      "Sausages",
      "Potatoes",
      "Onion",
      "Stock",
      "Butter",
      "Milk"
    ],
    "typical_quantities": [
      "8",
      "1kg",
      "2",
      "300ml",
      "50g",
      "100ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Sausages, Potatoes, Onion, Stock, Butter, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Sausages until sealed or softened, then add Potatoes and Onion.",
      "Stir in Butter, Milk and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-043",
    "name": "Corned Beef Hash",
    "description": "Pan-fried corned beef and potato.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Corned Beef",
      "Potatoes",
      "Onion",
      "Eggs",
      "Oil"
    ],
    "typical_quantities": [
      "340g",
      "500g",
      "1",
      "2",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Corned Beef, Potatoes, Onion, Eggs, Oil.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Corned Beef until sealed or softened, then add Potatoes and Onion.",
      "Stir in Oil and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-044",
    "name": "Ham and Pea Soup",
    "description": "Thick split pea soup with ham.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 45,
    "ingredients": [
      "Split Peas",
      "Ham",
      "Onion",
      "Carrots",
      "Stock"
    ],
    "typical_quantities": [
      "300g",
      "200g",
      "1",
      "2",
      "1L"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Split Peas, Ham, Onion, Carrots, Stock.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Split Peas and remaining ingredients including Stock. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (18–31 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-045",
    "name": "Leek and Potato Soup",
    "description": "Creamy leek and potato soup.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 35,
    "ingredients": [
      "Leeks",
      "Potatoes",
      "Stock",
      "Cream",
      "Butter",
      "Onion"
    ],
    "typical_quantities": [
      "4",
      "500g",
      "1L",
      "100ml",
      "30g",
      "1"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Leeks, Potatoes, Stock, Cream, Butter, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Leeks and remaining ingredients including Butter and Onion. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (14–25 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-046",
    "name": "Minestrone",
    "description": "Italian vegetable soup.",
    "category": "Italian",
    "difficulty": "Easy",
    "prep_time": 40,
    "ingredients": [
      "Pasta",
      "Tomatoes",
      "Beans",
      "Carrots",
      "Celery",
      "Stock"
    ],
    "typical_quantities": [
      "150g",
      "400g",
      "400g",
      "2",
      "2 sticks",
      "1L"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pasta, Tomatoes, Beans, Carrots, Celery, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Tomatoes and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-047",
    "name": "Tomato Soup",
    "description": "Simple homemade tomato soup.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Tomatoes",
      "Onion",
      "Stock",
      "Cream",
      "Basil",
      "Garlic"
    ],
    "typical_quantities": [
      "800g",
      "1",
      "500ml",
      "100ml",
      "handful",
      "2 cloves"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Tomatoes, Onion, Stock, Cream, Basil, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Tomatoes and remaining ingredients including Basil and Garlic. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (10–18 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-048",
    "name": "French Onion Soup",
    "description": "Caramelised onion soup with cheese.",
    "category": "French",
    "difficulty": "Medium",
    "prep_time": 50,
    "ingredients": [
      "Onions",
      "Beef Stock",
      "Bread",
      "Gruyere Cheese",
      "Butter",
      "Thyme"
    ],
    "typical_quantities": [
      "6",
      "1L",
      "4 slices",
      "150g",
      "50g",
      "1 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Onions, Beef Stock, Bread, Gruyere Cheese, Butter, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Onions and remaining ingredients including Butter and Thyme. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (20–35 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-049",
    "name": "Beef Stir Fry",
    "description": "Quick beef and vegetable stir fry.",
    "category": "Asian",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Beef",
      "Peppers",
      "Soy Sauce",
      "Garlic",
      "Ginger",
      "Rice"
    ],
    "typical_quantities": [
      "400g",
      "2",
      "3 tbsp",
      "2 cloves",
      "1 inch",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef, Peppers, Soy Sauce, Garlic, Ginger, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Beef until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Beef to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-050",
    "name": "Pork Chops",
    "description": "Pan-fried pork chops with apple.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Pork Chops",
      "Apples",
      "Onion",
      "Thyme",
      "Butter",
      "Potatoes"
    ],
    "typical_quantities": [
      "4",
      "2",
      "1",
      "1 tsp",
      "30g",
      "600g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pork Chops, Apples, Onion, Thyme, Butter, and the rest.",
      "Pat Pork Chops dry and season generously.",
      "Cook in a hot pan, under the grill, or in the oven until cooked through and nicely browned.",
      "Meanwhile prepare sides such as Apples and Onion.",
      "Rest the protein briefly, plate with sides, and serve."
    ]
  },
  {
    "id": "recipe-051",
    "name": "Lamb Chops",
    "description": "Grilled lamb chops with mint.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 30,
    "ingredients": [
      "Lamb Chops",
      "Mint",
      "Potatoes",
      "Peas",
      "Garlic",
      "Oil"
    ],
    "typical_quantities": [
      "4",
      "handful",
      "600g",
      "150g",
      "2 cloves",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Lamb Chops, Mint, Potatoes, Peas, Garlic, and the rest.",
      "Pat Lamb Chops dry and season generously.",
      "Cook in a hot pan, under the grill, or in the oven until cooked through and nicely browned.",
      "Meanwhile prepare sides such as Mint and Potatoes.",
      "Rest the protein briefly, plate with sides, and serve."
    ]
  },
  {
    "id": "recipe-052",
    "name": "Steak and Chips",
    "description": "Pan-seared steak with homemade chips.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 35,
    "ingredients": [
      "Steak",
      "Potatoes",
      "Butter",
      "Garlic",
      "Oil",
      "Pepper"
    ],
    "typical_quantities": [
      "2",
      "600g",
      "30g",
      "2 cloves",
      "for frying",
      "to taste"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Steak, Potatoes, Butter, Garlic, Oil, and the rest.",
      "Pat Steak dry and season generously.",
      "Cook in a hot pan, under the grill, or in the oven until cooked through and nicely browned.",
      "Meanwhile prepare sides such as Potatoes and Butter.",
      "Rest the protein briefly, plate with sides, and serve."
    ]
  },
  {
    "id": "recipe-053",
    "name": "Chicken Parmesan",
    "description": "Breaded chicken with tomato and cheese.",
    "category": "Italian",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "Chicken Breast",
      "Tomatoes",
      "Mozzarella",
      "Parmesan",
      "Breadcrumbs",
      "Pasta"
    ],
    "typical_quantities": [
      "4",
      "400g",
      "200g",
      "100g",
      "150g",
      "400g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Tomatoes, Mozzarella, Parmesan, Breadcrumbs, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Tomatoes and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-054",
    "name": "Penne Arrabiata",
    "description": "Spicy tomato pasta.",
    "category": "Italian",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Penne",
      "Tomatoes",
      "Garlic",
      "Chilli",
      "Olive Oil",
      "Parsley"
    ],
    "typical_quantities": [
      "400g",
      "400g",
      "3 cloves",
      "1",
      "2 tbsp",
      "handful"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Penne, Tomatoes, Garlic, Chilli, Olive Oil, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Tomatoes and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-055",
    "name": "Pesto Pasta",
    "description": "Basil pesto pasta with pine nuts.",
    "category": "Italian",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Pasta",
      "Pesto",
      "Parmesan",
      "Pine Nuts",
      "Olive Oil"
    ],
    "typical_quantities": [
      "400g",
      "4 tbsp",
      "50g",
      "30g",
      "1 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pasta, Pesto, Parmesan, Pine Nuts, Olive Oil.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Pesto and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-056",
    "name": "Gnocchi Bake",
    "description": "Baked gnocchi in tomato sauce.",
    "category": "Italian",
    "difficulty": "Easy",
    "prep_time": 30,
    "ingredients": [
      "Gnocchi",
      "Tomatoes",
      "Mozzarella",
      "Basil",
      "Cream"
    ],
    "typical_quantities": [
      "500g",
      "400g",
      "200g",
      "handful",
      "100ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Gnocchi, Tomatoes, Mozzarella, Basil, Cream.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Tomatoes and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-057",
    "name": "Seafood Paella",
    "description": "Spanish rice with seafood.",
    "category": "Spanish",
    "difficulty": "Hard",
    "prep_time": 50,
    "ingredients": [
      "Rice",
      "Prawns",
      "Mussels",
      "Peppers",
      "Saffron",
      "Stock"
    ],
    "typical_quantities": [
      "300g",
      "200g",
      "300g",
      "2",
      "pinch",
      "600ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Rice, Prawns, Mussels, Peppers, Saffron, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Rice with Prawns and Mussels.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (25–50 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-058",
    "name": "Chicken Paella",
    "description": "Spanish chicken and rice dish.",
    "category": "Spanish",
    "difficulty": "Medium",
    "prep_time": 45,
    "ingredients": [
      "Rice",
      "Chicken Thighs",
      "Peppers",
      "Peas",
      "Saffron",
      "Stock"
    ],
    "typical_quantities": [
      "300g",
      "500g",
      "2",
      "150g",
      "pinch",
      "600ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Rice, Chicken Thighs, Peppers, Peas, Saffron, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Rice until sealed or softened, then add Chicken Thighs and Peppers.",
      "Stir in Saffron, Stock and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-059",
    "name": "Beef Enchiladas",
    "description": "Baked tortillas with beef and sauce.",
    "category": "Mexican",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "Tortillas",
      "Beef Mince",
      "Enchilada Sauce",
      "Cheese",
      "Onion",
      "Sour Cream"
    ],
    "typical_quantities": [
      "6",
      "400g",
      "400ml",
      "200g",
      "1",
      "100ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Tortillas, Beef Mince, Enchilada Sauce, Cheese, Onion, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Tortillas with Beef Mince and Enchilada Sauce.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (20–40 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-060",
    "name": "Chicken Quesadillas",
    "description": "Cheesy chicken folded tortillas.",
    "category": "Mexican",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Tortillas",
      "Chicken Breast",
      "Cheese",
      "Peppers",
      "Salsa"
    ],
    "typical_quantities": [
      "4",
      "300g",
      "200g",
      "2",
      "100ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Tortillas, Chicken Breast, Cheese, Peppers, Salsa.",
      "Cook Tortillas in a pan until browned and cooked through, seasoning as you go.",
      "Warm tortillas, buns, or chips and prepare fresh toppings.",
      "Assemble with Chicken Breast, Cheese, Peppers, add sauces, and serve immediately."
    ]
  },
  {
    "id": "recipe-061",
    "name": "Nachos",
    "description": "Loaded nachos with cheese and salsa.",
    "category": "Mexican",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Tortilla Chips",
      "Cheese",
      "Salsa",
      "Sour Cream",
      "Jalapenos",
      "Beef Mince"
    ],
    "typical_quantities": [
      "200g",
      "200g",
      "150ml",
      "100ml",
      "50g",
      "200g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Tortilla Chips, Cheese, Salsa, Sour Cream, Jalapenos, and the rest.",
      "Cook Tortilla Chips in a pan until browned and cooked through, seasoning as you go.",
      "Warm tortillas, buns, or chips and prepare fresh toppings.",
      "Assemble with Cheese, Salsa, Sour Cream, add sauces, and serve immediately."
    ]
  },
  {
    "id": "recipe-062",
    "name": "Pulled Pork",
    "description": "Slow-cooked shredded pork.",
    "category": "American",
    "difficulty": "Hard",
    "prep_time": 240,
    "ingredients": [
      "Pork Shoulder",
      "BBQ Sauce",
      "Onion",
      "Garlic",
      "Coleslaw",
      "Burger Buns"
    ],
    "typical_quantities": [
      "1kg",
      "300ml",
      "2",
      "4 cloves",
      "200g",
      "6"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pork Shoulder, BBQ Sauce, Onion, Garlic, Coleslaw, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Pork Shoulder with BBQ Sauce and Onion.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (120–240 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-063",
    "name": "BBQ Ribs",
    "description": "Sticky barbecue pork ribs.",
    "category": "American",
    "difficulty": "Hard",
    "prep_time": 180,
    "ingredients": [
      "Pork Ribs",
      "BBQ Sauce",
      "Brown Sugar",
      "Garlic",
      "Paprika",
      "Coleslaw"
    ],
    "typical_quantities": [
      "1kg",
      "300ml",
      "2 tbsp",
      "3 cloves",
      "1 tbsp",
      "200g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pork Ribs, BBQ Sauce, Brown Sugar, Garlic, Paprika, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Pork Ribs with BBQ Sauce and Brown Sugar.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (90–180 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-064",
    "name": "Meatballs",
    "description": "Italian meatballs in tomato sauce.",
    "category": "Italian",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "Beef Mince",
      "Breadcrumbs",
      "Egg",
      "Tomatoes",
      "Pasta",
      "Parmesan"
    ],
    "typical_quantities": [
      "500g",
      "100g",
      "1",
      "400g",
      "400g",
      "50g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef Mince, Breadcrumbs, Egg, Tomatoes, Pasta, and the rest.",
      "Bring a large pan of salted water to the boil (or warm stock for risotto).",
      "Cook the pasta or rice according to pack instructions until just tender.",
      "Meanwhile, prepare the sauce: cook Breadcrumbs and remaining ingredients in a separate pan.",
      "Combine pasta/rice with the sauce, loosen with a splash of cooking water if needed, and finish with cheese or herbs if using.",
      "Serve immediately while hot."
    ]
  },
  {
    "id": "recipe-065",
    "name": "Stuffed Peppers",
    "description": "Rice and mince stuffed peppers.",
    "category": "Mediterranean",
    "difficulty": "Medium",
    "prep_time": 45,
    "ingredients": [
      "Peppers",
      "Beef Mince",
      "Rice",
      "Tomatoes",
      "Onion",
      "Cheese"
    ],
    "typical_quantities": [
      "4",
      "400g",
      "200g",
      "200g",
      "1",
      "100g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Peppers, Beef Mince, Rice, Tomatoes, Onion, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Peppers until sealed or softened, then add Beef Mince and Rice.",
      "Stir in Onion, Cheese and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-066",
    "name": "Stuffed Aubergine",
    "description": "Mediterranean stuffed aubergine.",
    "category": "Mediterranean",
    "difficulty": "Medium",
    "prep_time": 50,
    "ingredients": [
      "Aubergine",
      "Lamb Mince",
      "Tomatoes",
      "Onion",
      "Couscous",
      "Feta Cheese"
    ],
    "typical_quantities": [
      "2",
      "300g",
      "200g",
      "1",
      "150g",
      "100g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Aubergine, Lamb Mince, Tomatoes, Onion, Couscous, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Aubergine until sealed or softened, then add Lamb Mince and Tomatoes.",
      "Stir in Couscous, Feta Cheese and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-067",
    "name": "Shakshuka",
    "description": "Eggs poached in spiced tomato sauce.",
    "category": "Middle Eastern",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Eggs",
      "Tomatoes",
      "Peppers",
      "Onion",
      "Cumin",
      "Bread"
    ],
    "typical_quantities": [
      "4",
      "400g",
      "2",
      "1",
      "1 tsp",
      "4 slices"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Eggs, Tomatoes, Peppers, Onion, Cumin, and the rest.",
      "Heat a frying pan over medium heat with a little butter or oil.",
      "Cook any fillings (meat, vegetables) until ready, then add eggs or pour in beaten eggs.",
      "Cook until set to your liking, folding if making an omelette, or simmer gently for shakshuka-style dishes.",
      "Season well and serve straight away with bread if desired."
    ]
  },
  {
    "id": "recipe-068",
    "name": "Falafel Wrap",
    "description": "Crispy falafel in flatbread.",
    "category": "Middle Eastern",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Chickpeas",
      "Flatbread",
      "Lettuce",
      "Tomatoes",
      "Tahini",
      "Cumin"
    ],
    "typical_quantities": [
      "400g",
      "4",
      "1 head",
      "2",
      "3 tbsp",
      "1 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chickpeas, Flatbread, Lettuce, Tomatoes, Tahini, and the rest.",
      "Cook Chickpeas in a pan until browned and cooked through, seasoning as you go.",
      "Warm tortillas, buns, or chips and prepare fresh toppings.",
      "Assemble with Flatbread, Lettuce, Tomatoes, add sauces, and serve immediately."
    ]
  },
  {
    "id": "recipe-069",
    "name": "Hummus Bowl",
    "description": "Chickpea hummus with vegetables.",
    "category": "Middle Eastern",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Chickpeas",
      "Tahini",
      "Lemon",
      "Garlic",
      "Olive Oil",
      "Pitta Bread"
    ],
    "typical_quantities": [
      "400g",
      "3 tbsp",
      "1",
      "2 cloves",
      "3 tbsp",
      "4"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chickpeas, Tahini, Lemon, Garlic, Olive Oil, and the rest.",
      "Wash and chop the fresh ingredients into bite-sized pieces.",
      "Combine everything in a large bowl, adding Tahini, Lemon, Garlic.",
      "Toss gently, taste for seasoning, and serve immediately."
    ]
  },
  {
    "id": "recipe-070",
    "name": "Butter Chicken",
    "description": "Creamy Indian butter chicken.",
    "category": "Indian",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "Chicken Breast",
      "Tomatoes",
      "Cream",
      "Butter",
      "Garam Masala",
      "Rice"
    ],
    "typical_quantities": [
      "500g",
      "400g",
      "200ml",
      "50g",
      "2 tbsp",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Tomatoes, Cream, Butter, Garam Masala, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Chicken Breast until sealed or softened, then add Tomatoes and Cream.",
      "Stir in Garam Masala, Rice and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-071",
    "name": "Chicken Tikka Masala",
    "description": "Popular creamy tikka masala.",
    "category": "Indian",
    "difficulty": "Medium",
    "prep_time": 45,
    "ingredients": [
      "Chicken Breast",
      "Yogurt",
      "Tomatoes",
      "Cream",
      "Spices",
      "Rice"
    ],
    "typical_quantities": [
      "500g",
      "150ml",
      "400g",
      "200ml",
      "2 tbsp",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Yogurt, Tomatoes, Cream, Spices, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Chicken Breast until sealed or softened, then add Yogurt and Tomatoes.",
      "Stir in Spices, Rice and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-072",
    "name": "Lamb Rogan Josh",
    "description": "Aromatic Kashmiri lamb curry.",
    "category": "Indian",
    "difficulty": "Hard",
    "prep_time": 90,
    "ingredients": [
      "Lamb",
      "Yogurt",
      "Tomatoes",
      "Onion",
      "Spices",
      "Rice"
    ],
    "typical_quantities": [
      "600g",
      "150ml",
      "400g",
      "2",
      "2 tbsp",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Lamb, Yogurt, Tomatoes, Onion, Spices, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Lamb with Yogurt and Tomatoes.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (45–90 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-073",
    "name": "Vegetable Biryani",
    "description": "Fragrant spiced rice with vegetables.",
    "category": "Indian",
    "difficulty": "Medium",
    "prep_time": 50,
    "ingredients": [
      "Rice",
      "Mixed Vegetables",
      "Yogurt",
      "Spices",
      "Onion",
      "Stock"
    ],
    "typical_quantities": [
      "300g",
      "400g",
      "100ml",
      "2 tbsp",
      "2",
      "500ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Rice, Mixed Vegetables, Yogurt, Spices, Onion, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Rice until sealed or softened, then add Mixed Vegetables and Yogurt.",
      "Stir in Onion, Stock and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-074",
    "name": "Pad Thai",
    "description": "Thai stir-fried noodles.",
    "category": "Thai",
    "difficulty": "Medium",
    "prep_time": 30,
    "ingredients": [
      "Rice Noodles",
      "Prawns",
      "Eggs",
      "Bean Sprouts",
      "Peanuts",
      "Lime"
    ],
    "typical_quantities": [
      "200g",
      "200g",
      "2",
      "150g",
      "50g",
      "1"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Rice Noodles, Prawns, Eggs, Bean Sprouts, Peanuts, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Rice Noodles until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Rice Noodles to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-075",
    "name": "Chicken Satay",
    "description": "Grilled chicken with peanut sauce.",
    "category": "Thai",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Chicken Breast",
      "Peanut Butter",
      "Soy Sauce",
      "Lime",
      "Coconut Milk",
      "Rice"
    ],
    "typical_quantities": [
      "400g",
      "3 tbsp",
      "2 tbsp",
      "1",
      "100ml",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Peanut Butter, Soy Sauce, Lime, Coconut Milk, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Chicken Breast until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Chicken Breast to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-076",
    "name": "Tom Yum Soup",
    "description": "Hot and sour Thai soup.",
    "category": "Thai",
    "difficulty": "Medium",
    "prep_time": 25,
    "ingredients": [
      "Prawns",
      "Lemongrass",
      "Lime",
      "Mushrooms",
      "Chilli",
      "Stock"
    ],
    "typical_quantities": [
      "200g",
      "2 stalks",
      "1",
      "150g",
      "2",
      "600ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Prawns, Lemongrass, Lime, Mushrooms, Chilli, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Prawns and remaining ingredients including Chilli and Stock. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (10–18 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-077",
    "name": "Katsu Curry",
    "description": "Japanese breaded chicken curry.",
    "category": "Japanese",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "Chicken Breast",
      "Rice",
      "Curry Sauce",
      "Breadcrumbs",
      "Flour",
      "Eggs"
    ],
    "typical_quantities": [
      "400g",
      "300g",
      "1 pack",
      "150g",
      "50g",
      "2"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Rice, Curry Sauce, Breadcrumbs, Flour, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Chicken Breast and remaining ingredients including Flour and Eggs. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (16–28 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-078",
    "name": "Teriyaki Salmon Bowl",
    "description": "Salmon rice bowl with vegetables.",
    "category": "Japanese",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Salmon",
      "Rice",
      "Broccoli",
      "Soy Sauce",
      "Sesame Seeds",
      "Spring Onion"
    ],
    "typical_quantities": [
      "2 fillets",
      "300g",
      "200g",
      "3 tbsp",
      "1 tbsp",
      "3"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Salmon, Rice, Broccoli, Soy Sauce, Sesame Seeds, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Salmon until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Salmon to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-079",
    "name": "Ramen",
    "description": "Japanese noodle soup.",
    "category": "Japanese",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Ramen Noodles",
      "Pork",
      "Eggs",
      "Spring Onion",
      "Soy Sauce",
      "Stock"
    ],
    "typical_quantities": [
      "2 packs",
      "200g",
      "2",
      "4",
      "3 tbsp",
      "800ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Ramen Noodles, Pork, Eggs, Spring Onion, Soy Sauce, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Ramen Noodles until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Ramen Noodles to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-080",
    "name": "Bibimbap",
    "description": "Korean rice bowl with vegetables.",
    "category": "Korean",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Rice",
      "Beef",
      "Eggs",
      "Spinach",
      "Carrots",
      "Soy Sauce"
    ],
    "typical_quantities": [
      "300g",
      "200g",
      "2",
      "100g",
      "2",
      "3 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Rice, Beef, Eggs, Spinach, Carrots, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Rice until sealed or softened, then add Beef and Eggs.",
      "Stir in Carrots, Soy Sauce and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-081",
    "name": "Bulgogi",
    "description": "Korean marinated beef.",
    "category": "Korean",
    "difficulty": "Medium",
    "prep_time": 30,
    "ingredients": [
      "Beef",
      "Soy Sauce",
      "Sugar",
      "Garlic",
      "Sesame Oil",
      "Rice"
    ],
    "typical_quantities": [
      "400g",
      "4 tbsp",
      "2 tbsp",
      "3 cloves",
      "1 tbsp",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef, Soy Sauce, Sugar, Garlic, Sesame Oil, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Beef until sealed or softened, then add Soy Sauce and Sugar.",
      "Stir in Sesame Oil, Rice and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-082",
    "name": "Dumplings",
    "description": "Pan-fried pork dumplings.",
    "category": "Chinese",
    "difficulty": "Hard",
    "prep_time": 60,
    "ingredients": [
      "Pork Mince",
      "Dumpling Wrappers",
      "Cabbage",
      "Soy Sauce",
      "Ginger",
      "Garlic"
    ],
    "typical_quantities": [
      "300g",
      "30",
      "200g",
      "3 tbsp",
      "1 inch",
      "2 cloves"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pork Mince, Dumpling Wrappers, Cabbage, Soy Sauce, Ginger, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Pork Mince until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Pork Mince to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-083",
    "name": "Kung Pao Chicken",
    "description": "Spicy Sichuan chicken stir fry.",
    "category": "Chinese",
    "difficulty": "Medium",
    "prep_time": 30,
    "ingredients": [
      "Chicken Breast",
      "Peanuts",
      "Peppers",
      "Soy Sauce",
      "Chilli",
      "Rice"
    ],
    "typical_quantities": [
      "400g",
      "50g",
      "2",
      "3 tbsp",
      "2",
      "300g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Breast, Peanuts, Peppers, Soy Sauce, Chilli, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Chicken Breast until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Chicken Breast to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-084",
    "name": "Beef Chow Mein",
    "description": "Stir-fried noodles with beef.",
    "category": "Chinese",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Egg Noodles",
      "Beef",
      "Cabbage",
      "Soy Sauce",
      "Spring Onion",
      "Oil"
    ],
    "typical_quantities": [
      "300g",
      "300g",
      "200g",
      "3 tbsp",
      "4",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Egg Noodles, Beef, Cabbage, Soy Sauce, Spring Onion, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Egg Noodles until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Egg Noodles to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-085",
    "name": "Egg Fried Noodles",
    "description": "Quick egg noodle stir fry.",
    "category": "Chinese",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Egg Noodles",
      "Eggs",
      "Soy Sauce",
      "Spring Onion",
      "Oil",
      "Vegetables"
    ],
    "typical_quantities": [
      "300g",
      "2",
      "3 tbsp",
      "3",
      "2 tbsp",
      "200g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Egg Noodles, Eggs, Soy Sauce, Spring Onion, Oil, and the rest.",
      "Heat a wok or large frying pan over high heat with a little oil.",
      "Cook Egg Noodles until sealed and nearly cooked through, then set aside if needed.",
      "Stir-fry vegetables and aromatics until tender-crisp, then return Egg Noodles to the pan.",
      "Add sauces and seasonings, toss everything together for 1–2 minutes, and serve with rice or noodles if listed."
    ]
  },
  {
    "id": "recipe-086",
    "name": "Quiche Lorraine",
    "description": "Bacon and cheese quiche.",
    "category": "French",
    "difficulty": "Medium",
    "prep_time": 50,
    "ingredients": [
      "Shortcrust Pastry",
      "Bacon",
      "Eggs",
      "Cream",
      "Cheese",
      "Nutmeg"
    ],
    "typical_quantities": [
      "1 sheet",
      "200g",
      "4",
      "200ml",
      "100g",
      "pinch"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Shortcrust Pastry, Bacon, Eggs, Cream, Cheese, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Shortcrust Pastry until sealed or softened, then add Bacon and Eggs.",
      "Stir in Cheese, Nutmeg and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-087",
    "name": "Croque Monsieur",
    "description": "French ham and cheese sandwich.",
    "category": "French",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Bread",
      "Ham",
      "Gruyere Cheese",
      "Butter",
      "Flour",
      "Milk"
    ],
    "typical_quantities": [
      "4 slices",
      "8 slices",
      "150g",
      "30g",
      "20g",
      "200ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bread, Ham, Gruyere Cheese, Butter, Flour, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Bread until sealed or softened, then add Ham and Gruyere Cheese.",
      "Stir in Flour, Milk and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-088",
    "name": "Ratatouille",
    "description": "Provençal vegetable stew.",
    "category": "French",
    "difficulty": "Medium",
    "prep_time": 45,
    "ingredients": [
      "Aubergine",
      "Courgette",
      "Tomatoes",
      "Peppers",
      "Onion",
      "Garlic"
    ],
    "typical_quantities": [
      "1",
      "2",
      "400g",
      "2",
      "1",
      "3 cloves"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Aubergine, Courgette, Tomatoes, Peppers, Onion, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Aubergine until sealed or softened, then add Courgette and Tomatoes.",
      "Stir in Onion, Garlic and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-089",
    "name": "Coq au Vin",
    "description": "Chicken braised in wine.",
    "category": "French",
    "difficulty": "Hard",
    "prep_time": 90,
    "ingredients": [
      "Chicken Thighs",
      "Red Wine",
      "Bacon",
      "Mushrooms",
      "Onion",
      "Stock"
    ],
    "typical_quantities": [
      "6",
      "500ml",
      "150g",
      "200g",
      "2",
      "400ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Thighs, Red Wine, Bacon, Mushrooms, Onion, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Chicken Thighs with Red Wine and Bacon.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (45–90 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-090",
    "name": "Beef Bourguignon",
    "description": "Slow-cooked beef in red wine.",
    "category": "French",
    "difficulty": "Hard",
    "prep_time": 180,
    "ingredients": [
      "Beef",
      "Red Wine",
      "Bacon",
      "Mushrooms",
      "Onion",
      "Stock"
    ],
    "typical_quantities": [
      "800g",
      "500ml",
      "150g",
      "200g",
      "2",
      "500ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef, Red Wine, Bacon, Mushrooms, Onion, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Beef with Red Wine and Bacon.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (90–180 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-091",
    "name": "Crepes",
    "description": "Thin French pancakes.",
    "category": "French",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Flour",
      "Eggs",
      "Milk",
      "Butter",
      "Sugar",
      "Lemon"
    ],
    "typical_quantities": [
      "150g",
      "3",
      "300ml",
      "30g",
      "2 tbsp",
      "1"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Flour, Eggs, Milk, Butter, Sugar, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Flour until sealed or softened, then add Eggs and Milk.",
      "Stir in Sugar, Lemon and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-092",
    "name": "Waffles",
    "description": "Crispy breakfast waffles.",
    "category": "American",
    "difficulty": "Easy",
    "prep_time": 20,
    "ingredients": [
      "Flour",
      "Eggs",
      "Milk",
      "Butter",
      "Sugar",
      "Baking Powder"
    ],
    "typical_quantities": [
      "200g",
      "2",
      "300ml",
      "50g",
      "2 tbsp",
      "2 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Flour, Eggs, Milk, Butter, Sugar, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Flour until sealed or softened, then add Eggs and Milk.",
      "Stir in Sugar, Baking Powder and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-093",
    "name": "Pancakes",
    "description": "Fluffy American pancakes.",
    "category": "American",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Flour",
      "Eggs",
      "Milk",
      "Butter",
      "Sugar",
      "Baking Powder"
    ],
    "typical_quantities": [
      "200g",
      "2",
      "300ml",
      "30g",
      "2 tbsp",
      "2 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Flour, Eggs, Milk, Butter, Sugar, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Flour until sealed or softened, then add Eggs and Milk.",
      "Stir in Sugar, Baking Powder and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-094",
    "name": "French Toast",
    "description": "Cinnamon eggy bread.",
    "category": "American",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Bread",
      "Eggs",
      "Milk",
      "Cinnamon",
      "Butter",
      "Maple Syrup"
    ],
    "typical_quantities": [
      "6 slices",
      "3",
      "200ml",
      "1 tsp",
      "30g",
      "4 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bread, Eggs, Milk, Cinnamon, Butter, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Bread until sealed or softened, then add Eggs and Milk.",
      "Stir in Butter, Maple Syrup and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-095",
    "name": "Club Sandwich",
    "description": "Triple-decker chicken sandwich.",
    "category": "American",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Bread",
      "Chicken Breast",
      "Bacon",
      "Lettuce",
      "Tomatoes",
      "Mayonnaise"
    ],
    "typical_quantities": [
      "6 slices",
      "200g",
      "4 rashers",
      "4 leaves",
      "2",
      "3 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bread, Chicken Breast, Bacon, Lettuce, Tomatoes, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Bread until sealed or softened, then add Chicken Breast and Bacon.",
      "Stir in Tomatoes, Mayonnaise and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-096",
    "name": "BLT Sandwich",
    "description": "Bacon lettuce and tomato sandwich.",
    "category": "American",
    "difficulty": "Easy",
    "prep_time": 10,
    "ingredients": [
      "Bread",
      "Bacon",
      "Lettuce",
      "Tomatoes",
      "Mayonnaise"
    ],
    "typical_quantities": [
      "4 slices",
      "6 rashers",
      "4 leaves",
      "2",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bread, Bacon, Lettuce, Tomatoes, Mayonnaise.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Bread until sealed or softened, then add Bacon and Lettuce.",
      "Stir in Mayonnaise and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-097",
    "name": "Tuna Sandwich",
    "description": "Classic tuna mayo sandwich.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 10,
    "ingredients": [
      "Bread",
      "Tuna",
      "Mayonnaise",
      "Sweetcorn",
      "Lettuce"
    ],
    "typical_quantities": [
      "4 slices",
      "2 tins",
      "3 tbsp",
      "50g",
      "4 leaves"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bread, Tuna, Mayonnaise, Sweetcorn, Lettuce.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Bread until sealed or softened, then add Tuna and Mayonnaise.",
      "Stir in Lettuce and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-098",
    "name": "Egg Mayo Sandwich",
    "description": "Simple egg mayonnaise sandwich.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 10,
    "ingredients": [
      "Bread",
      "Eggs",
      "Mayonnaise",
      "Cress",
      "Butter"
    ],
    "typical_quantities": [
      "4 slices",
      "4",
      "3 tbsp",
      "handful",
      "20g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bread, Eggs, Mayonnaise, Cress, Butter.",
      "Heat a frying pan over medium heat with a little butter or oil.",
      "Cook any fillings (meat, vegetables) until ready, then add eggs or pour in beaten eggs.",
      "Cook until set to your liking, folding if making an omelette, or simmer gently for shakshuka-style dishes.",
      "Season well and serve straight away with bread if desired."
    ]
  },
  {
    "id": "recipe-099",
    "name": "Chicken Salad Sandwich",
    "description": "Light chicken salad sandwich.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 10,
    "ingredients": [
      "Bread",
      "Chicken Breast",
      "Mayonnaise",
      "Celery",
      "Lettuce"
    ],
    "typical_quantities": [
      "4 slices",
      "200g",
      "3 tbsp",
      "2 sticks",
      "4 leaves"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bread, Chicken Breast, Mayonnaise, Celery, Lettuce.",
      "Wash and chop the fresh ingredients into bite-sized pieces.",
      "Combine everything in a large bowl, adding Chicken Breast, Mayonnaise, Celery.",
      "Toss gently, taste for seasoning, and serve immediately."
    ]
  },
  {
    "id": "recipe-100",
    "name": "Vegetable Soup",
    "description": "Hearty mixed vegetable soup.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 35,
    "ingredients": [
      "Carrots",
      "Potatoes",
      "Celery",
      "Onion",
      "Stock",
      "Tomatoes"
    ],
    "typical_quantities": [
      "3",
      "2",
      "3 sticks",
      "1",
      "1L",
      "200g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Carrots, Potatoes, Celery, Onion, Stock, and the rest.",
      "Heat a splash of oil in a large pan over medium heat.",
      "Cook the aromatic base (onion, garlic, or spices) until fragrant, about 3–5 minutes.",
      "Add Carrots and remaining ingredients including Stock and Tomatoes. Pour in any stock, milk, or sauce.",
      "Simmer gently until everything is tender and flavours have developed (14–25 minutes).",
      "Taste, adjust seasoning, and serve hot."
    ]
  },
  {
    "id": "recipe-101",
    "name": "Chicken Casserole",
    "description": "One-pot chicken and vegetable bake.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 60,
    "ingredients": [
      "Chicken Thighs",
      "Potatoes",
      "Carrots",
      "Onion",
      "Stock",
      "Thyme"
    ],
    "typical_quantities": [
      "6",
      "500g",
      "3",
      "2",
      "500ml",
      "1 tsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Chicken Thighs, Potatoes, Carrots, Onion, Stock, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Chicken Thighs until sealed or softened, then add Potatoes and Carrots.",
      "Stir in Stock, Thyme and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-102",
    "name": "Sausage Casserole",
    "description": "Sausage and bean casserole.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 45,
    "ingredients": [
      "Sausages",
      "Baked Beans",
      "Onion",
      "Tomatoes",
      "Peppers",
      "Stock"
    ],
    "typical_quantities": [
      "8",
      "400g",
      "2",
      "200g",
      "2",
      "300ml"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Sausages, Baked Beans, Onion, Tomatoes, Peppers, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Sausages until sealed or softened, then add Baked Beans and Onion.",
      "Stir in Peppers, Stock and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-103",
    "name": "Beef Casserole",
    "description": "Slow-cooked beef casserole.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 90,
    "ingredients": [
      "Beef",
      "Potatoes",
      "Carrots",
      "Onion",
      "Stock",
      "Flour"
    ],
    "typical_quantities": [
      "600g",
      "500g",
      "3",
      "2",
      "500ml",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef, Potatoes, Carrots, Onion, Stock, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Beef until sealed or softened, then add Potatoes and Carrots.",
      "Stir in Stock, Flour and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-104",
    "name": "Fish and Chips",
    "description": "Classic battered fish with chips.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "White Fish",
      "Potatoes",
      "Flour",
      "Beer",
      "Peas",
      "Oil"
    ],
    "typical_quantities": [
      "600g",
      "800g",
      "200g",
      "200ml",
      "150g",
      "for frying"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: White Fish, Potatoes, Flour, Beer, Peas, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook White Fish until sealed or softened, then add Potatoes and Flour.",
      "Stir in Peas, Oil and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-105",
    "name": "Kedgeree",
    "description": "Smoked fish rice with eggs.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 35,
    "ingredients": [
      "Smoked Haddock",
      "Rice",
      "Eggs",
      "Butter",
      "Curry Powder",
      "Parsley"
    ],
    "typical_quantities": [
      "400g",
      "300g",
      "3",
      "50g",
      "1 tsp",
      "handful"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Smoked Haddock, Rice, Eggs, Butter, Curry Powder, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Smoked Haddock until sealed or softened, then add Rice and Eggs.",
      "Stir in Curry Powder, Parsley and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-106",
    "name": "Bubble and Squeak",
    "description": "Fried potato and cabbage cakes.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 25,
    "ingredients": [
      "Potatoes",
      "Cabbage",
      "Bacon",
      "Butter",
      "Onion"
    ],
    "typical_quantities": [
      "500g",
      "300g",
      "100g",
      "30g",
      "1"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Potatoes, Cabbage, Bacon, Butter, Onion.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Potatoes until sealed or softened, then add Cabbage and Bacon.",
      "Stir in Onion and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-107",
    "name": "Cornish Pasty",
    "description": "Traditional meat and potato pasty.",
    "category": "British",
    "difficulty": "Hard",
    "prep_time": 60,
    "ingredients": [
      "Shortcrust Pastry",
      "Beef",
      "Potatoes",
      "Swede",
      "Onion",
      "Egg"
    ],
    "typical_quantities": [
      "500g",
      "300g",
      "200g",
      "150g",
      "1",
      "1 for wash"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Shortcrust Pastry, Beef, Potatoes, Swede, Onion, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Shortcrust Pastry with Beef and Potatoes.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (30–60 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-108",
    "name": "Ploughman's Lunch",
    "description": "Cheese, pickle and bread platter.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 10,
    "ingredients": [
      "Cheddar Cheese",
      "Bread",
      "Pickle",
      "Apple",
      "Ham",
      "Lettuce"
    ],
    "typical_quantities": [
      "200g",
      "4 slices",
      "3 tbsp",
      "1",
      "100g",
      "4 leaves"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Cheddar Cheese, Bread, Pickle, Apple, Ham, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Cheddar Cheese until sealed or softened, then add Bread and Pickle.",
      "Stir in Ham, Lettuce and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-109",
    "name": "Scotch Eggs",
    "description": "Sausage-wrapped boiled eggs.",
    "category": "British",
    "difficulty": "Hard",
    "prep_time": 45,
    "ingredients": [
      "Eggs",
      "Sausage Meat",
      "Breadcrumbs",
      "Flour",
      "Oil"
    ],
    "typical_quantities": [
      "6",
      "400g",
      "150g",
      "50g",
      "for frying"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Eggs, Sausage Meat, Breadcrumbs, Flour, Oil.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Eggs with Sausage Meat and Breadcrumbs.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (23–45 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-110",
    "name": "Pork Pie",
    "description": "Traditional British pork pie.",
    "category": "British",
    "difficulty": "Hard",
    "prep_time": 120,
    "ingredients": [
      "Pork",
      "Hot Water Crust Pastry",
      "Stock",
      "Egg",
      "Pepper"
    ],
    "typical_quantities": [
      "500g",
      "400g",
      "200ml",
      "1",
      "to taste"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Pork, Hot Water Crust Pastry, Stock, Egg, Pepper.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Pork with Hot Water Crust Pastry and Stock.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (60–120 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-111",
    "name": "Beef Wellington",
    "description": "Beef fillet in puff pastry.",
    "category": "British",
    "difficulty": "Hard",
    "prep_time": 90,
    "ingredients": [
      "Beef Fillet",
      "Puff Pastry",
      "Mushrooms",
      "Prosciutto",
      "Eggs",
      "Mustard"
    ],
    "typical_quantities": [
      "600g",
      "500g",
      "300g",
      "6 slices",
      "1",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Beef Fillet, Puff Pastry, Mushrooms, Prosciutto, Eggs, and the rest.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Beef Fillet with Puff Pastry and Mushrooms.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (45–90 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-112",
    "name": "Yorkshire Puddings",
    "description": "Classic roast dinner yorkshires.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 30,
    "ingredients": [
      "Flour",
      "Eggs",
      "Milk",
      "Oil",
      "Salt"
    ],
    "typical_quantities": [
      "150g",
      "3",
      "300ml",
      "for tin",
      "pinch"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Flour, Eggs, Milk, Oil, Salt.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Flour until sealed or softened, then add Eggs and Milk.",
      "Stir in Salt and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-113",
    "name": "Bread and Butter Pudding",
    "description": "Classic baked bread pudding.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 45,
    "ingredients": [
      "Bread",
      "Butter",
      "Milk",
      "Eggs",
      "Sugar",
      "Raisins"
    ],
    "typical_quantities": [
      "8 slices",
      "50g",
      "400ml",
      "3",
      "50g",
      "100g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bread, Butter, Milk, Eggs, Sugar, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Bread until sealed or softened, then add Butter and Milk.",
      "Stir in Sugar, Raisins and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-114",
    "name": "Apple Crumble",
    "description": "Baked apple dessert with crumble.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 40,
    "ingredients": [
      "Apples",
      "Flour",
      "Butter",
      "Sugar",
      "Cinnamon",
      "Oats"
    ],
    "typical_quantities": [
      "6",
      "150g",
      "100g",
      "100g",
      "1 tsp",
      "50g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Apples, Flour, Butter, Sugar, Cinnamon, and the rest.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Apples until sealed or softened, then add Flour and Butter.",
      "Stir in Cinnamon, Oats and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },
  {
    "id": "recipe-115",
    "name": "Banoffee Pie",
    "description": "Banana and toffee pie.",
    "category": "British",
    "difficulty": "Medium",
    "prep_time": 40,
    "ingredients": [
      "Bananas",
      "Condensed Milk",
      "Cream",
      "Biscuits",
      "Butter"
    ],
    "typical_quantities": [
      "4",
      "400g",
      "300ml",
      "200g",
      "80g"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Bananas, Condensed Milk, Cream, Biscuits, Butter.",
      "Preheat the oven to 180–200°C (fan 160–180°C) as suited to the dish.",
      "Prepare the filling or base using Bananas with Condensed Milk and Cream.",
      "Assemble in an ovenproof dish or tray, topping with cheese, pastry, or crumbs if the recipe includes them.",
      "Bake until golden and cooked through (20–40 minutes). Rest briefly before serving."
    ]
  },
  {
    "id": "recipe-116",
    "name": "Eton Mess",
    "description": "Strawberries, cream and meringue.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 15,
    "ingredients": [
      "Strawberries",
      "Cream",
      "Meringue",
      "Sugar"
    ],
    "typical_quantities": [
      "300g",
      "200ml",
      "100g",
      "2 tbsp"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Strawberries, Cream, Meringue, Sugar.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Strawberries until sealed or softened, then add Cream and Meringue.",
      "Continue cooking until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot straight from the pan."
    ]
  },
  {
    "id": "recipe-117",
    "name": "Trifle",
    "description": "Layered sponge and custard dessert.",
    "category": "British",
    "difficulty": "Easy",
    "prep_time": 30,
    "ingredients": [
      "Sponge Cake",
      "Custard",
      "Cream",
      "Fruit",
      "Jelly"
    ],
    "typical_quantities": [
      "200g",
      "400ml",
      "200ml",
      "200g",
      "1 pack"
    ],
    "image": null,
    "instructions": [
      "Prep your ingredients: Sponge Cake, Custard, Cream, Fruit, Jelly.",
      "Heat a suitable pan or pot over medium heat with a little oil or butter.",
      "Cook Sponge Cake until sealed or softened, then add Custard and Cream.",
      "Stir in Jelly and cook until everything is tender and well combined.",
      "Taste and adjust seasoning. Serve hot."
    ]
  }
];
