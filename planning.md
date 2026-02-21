1. the main concept
a meal planner app for people with illness like high blood sugar, high blood pressure, high cholesterol. user can specified their health conditions, preferance (vegan, allergies, etc) and the app will recommend dishes that are suitable and with balanced nutrients for the user.

And based on the meal planned by the user, the app generate a shopping list of ingredients for the user. User can then use the shopping list to buy ingredients and cook the dishes. The app will also provide recipes for each dish.

note dish here also include drinks and beverages and snacks and fruits, not just cooked dishes.

2. UI and Flow
- UI should be simple, easy, clean and intuitive, user friendly for elderly people.
- display a nutritional summary (in graph and can switch to table form) for that day when user selecting dishes for the day. this graph/tables show the calories, protein, carbs, fat, fiber, sodium, cholesterol, sugar, fiber, etc of the dishes selected for that day, and compare with the user's target nutrient profile. the graph/table should be updated dynamically when user selecting/removing dishes.
-  show the planner in a weekly view, with each day having breakfast, lunch, dinner slots. 
-  user click on the slot to edit/add/remove dishes for that slot.
-  dish should display with image, name, and score. 
- when displaying the dish menu, it should show the score for each dish, and the first one listed is with highest score.
- user can also use Search to find dish
- dish menu display should be in grid form



3. database for dish and nutrients
- table A - each row is a dish, each column is ingredients, the table show the amount of grams of each ingredient in the dish. add one column for the dish id, and one column for the recipe id, and one column for the meal types (breakfast, lunch, dinner, snack), and one column for the tags (singaporean, malay, chinese, etc). All dish in the tables assume for single person serving per meal.
- maybe should have columns to show if the dish is suitable for high blood sugar, high blood pressure, high cholesterol user, and also for vegan, allergies, etc. and also for religion, etc. These info might help to filter the dishes faster.
- table B - each row is an ingredient, each column is nutrients, the value is the amount of nutrients in grams
- need to consider the ingredients amount can be customizable by user, and how to handle it. for example, if user want to decrease the amount of salt, sugar, oil, etc.
- what about replacing one ingredient with another ingredient? for example, if user is high-cholesterol, the app should recommend to replace the chicken wing with chicken breast. Or replacing sugar with stevia sweetener for high blood sugar user.

4. the algorithm of dynamic dish recommendation
the algo check and do the following in order:
a. check user health conditions (include measurement data for blood sugar, blood pressure and cholesterol?)
b. check user profile/preference (age, activity level,vegan, allergies, religion,etc)
c. create a target nutrient profile for the user based on the health conditions and profile/preference. Show it to user and let user confirm or adjust it???
d. the algo will first filter the dishes based on the user's health conditions and profile/preference from table A.
e. then from these dishes, the algo will calculate the score for each dish based on the user's target nutrient profile. The higher the score, the more suitable the dish is for the user. total score = suitable for user health condition (60%) + balance of nutrients (30%) + user preference (10%)
f. user first select the meal type (breakfast, lunch, dinner), then the app will recommend a list of dishes for the user to choose from, showing the score for each dish, and the first one listed is with highest score.
g. there is also a filter (show on UI), auto filter based on user preferance (vegan, allergies, religion,etc), meal type (breakfast, lunch, dinner) and health conditions (high blood sugar, high blood pressure, high cholesterol, etc). User can manually toggle off these filters.
h. user can select multiple dishes for each meal type.
i. if user already selected a dish, the algo will re-calcualte the next suitable dish based on the remaining user's target nutrient profile. (this is to ensure the total nutrients of all selected dishes are within the user's target nutrient profile), and update the score for the next recommending dish. 
j. the algo will try to ensure user can have balanced nutrients throughout the day, not just for each meal. 

5. recipe
- display the amount of ingredients (salt, sugar, etc.) customized by user
- display the steps to cook the dish
- display the estimated time to cook the dish
- display the estimated calories, protein, carbs, fat, fiber, sodium, cholesterol, sugar of the dish (based on the customized amount of ingredients)
- how to store the recipe?

6. local testing
- test on local computer


7. Migration to GCP/AWS 
- what need to adjust for cloud deployment
- app design should have maximum compatibility with cloud services


8. other features
- account for care taker vs account for meal user
- user able to rate the dishes and recipes
- user able to save favorite dishes and recipes
- user able to share dishes and recipes with others
- user able to add dishes and recipes to the app
- user able to adjust the ingredients amount in a recipe
- user able to adjust the recipe (add/remove/replace ingredients)
- track the user's health conditions and progress (blood sugar, blood pressure, cholesterol, etc)
- nutrient tracking and analysis
- how the app looks like in mobile? do we need to design it?


9. other considerations
- data to collect from users (age, gender, weight, height, activity level, jobs, health conditions, preferance (vegan, allergies, etc)), etchnicity, religion, etc
- 