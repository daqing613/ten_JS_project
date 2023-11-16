const mealsEL = document.getElementById("meals");
const favMeals = document.getElementById("fav-meals");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById("meal-info");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const randomMealData = await resp.json();
  const randomMeal = randomMealData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const mealData = await resp.json();
  const meal = mealData.meals[0];
  return meal;
}

async function getMealsBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;
  return meals;
}

function addMeal(mealData, random = false) {
  console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
        <div class="meal-header">
            ${random ? `<span class="random">Random Recipe</span>` : ""}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

  const btn = meal.querySelector(".meal-body .fav-btn");
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      btn.classList.add("active");
    }
    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEL.appendChild(meal);
}

function addMealToLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  favMeals.innerHTML = "";
  const mealIds = getMealsFromLS();

  const meals = [];

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    addMealToFav(meal);
  }
}

function addMealToFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
  `;

  const btn = favMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);

    fetchFavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favMeals.appendChild(favMeal);
}

function showMealInfo(mealData) {
  // clean it up
  mealInfoEl.innerHTML = "";
  // update the Meal info
  const mealInfo = document.createElement("div");
  const ingredients = [];
  // Get all ingredients from the object. Up to 20
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      // Stop if no more ingredients
      break;
    }
  }

  mealInfo.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <p>
      ${mealData.strInstructions}
    </p>
    <h3>Ingredients:</h3>
    <ul>
      ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
    </ul>
  `;
  mealInfoEl.appendChild(mealInfo);

  // show the popup
  mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
  // clean container
  mealsEL.innerHTML = "";
  const search = searchTerm.value;
  const meals = await getMealsBySearch(search);
  meals.forEach((meal) => {
    addMeal(meal);
  });
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
