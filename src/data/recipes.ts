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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
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
    "image": null
  }
];
