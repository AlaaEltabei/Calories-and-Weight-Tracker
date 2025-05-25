function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Food Manager')
    .addItem('Add food', 'showFoodDialog')
    .addItem('Edit food', 'showEditFoodList')
    .addItem('Delete food', 'showDeleteFoodDialog')
    .addItem('Add meal', 'showMealOptions')
    .addItem('Edit meal', 'showEditMealDialog')
    .addItem('Delete meal', 'showDeleteMealDialog')
    .addToUi();
}

function showFoodDialog() {
  const html = HtmlService.createHtmlOutputFromFile('food_form')
    .setWidth(300)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'New food');
}

function addFoodToSheet(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FoodDataBase");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Error: Sheet named 'FoodDataBase' not found.");
    return;
  }

  const startRow = 2;
  const lastRow = sheet.getLastRow();
  const existingRows = lastRow >= startRow ? lastRow - startRow + 1 : 0;

  const currentData = existingRows > 0
    ? sheet.getRange(startRow, 1, existingRows, 5).getValues()
    : [];

  const newEntry = [
    data.foodName.trim(),
    parseFloat(data.calories) || 0,
    parseFloat(data.protein) || 0,
    parseFloat(data.carb) || 0,
    parseFloat(data.fat) || 0
  ];

  currentData.push(newEntry);
  currentData.sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));

  sheet.getRange(startRow, 1, currentData.length, 5).setValues(currentData);
}

function checkDuplicateFoodName(foodName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FoodDataBase");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Error: Sheet named 'FoodDataBase' not found.");
    return;
  }

  const startRow = 2;
  const lastRow = sheet.getLastRow();
  const existingRows = lastRow >= startRow ? lastRow - startRow + 1 : 0;
  const data = existingRows > 0 ? sheet.getRange(startRow, 1, existingRows, 5).getValues() : [];

  // Check for duplicate food name (case-insensitive)
  const exists = data.some(row => row[0].toLowerCase() === foodName.toLowerCase());
  return exists;
}

function showEditFoodList() {
  const html = HtmlService.createHtmlOutputFromFile('edit_food_dropdown')
    .setWidth(300)
    .setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(html, 'Edit Food Entry');
}

function getFoodNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FoodDataBase");
  const names = sheet.getRange("A2:A" + sheet.getLastRow()).getValues().flat().filter(name => name);
  return names;
}

function getFoodDetails(foodName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FoodDataBase");
  const data = sheet.getRange(2, 1, sheet.getLastRow()-1, 5).getValues(); // cols A-E
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === foodName) {
      return {
        calories: data[i][1],
        protein: data[i][2],
        carbs: data[i][3],
        fat: data[i][4]
      };
    }
  }
  return null; // not found
}

function getAllFoodData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FoodDataBase");
  const data = sheet.getRange(2,1,sheet.getLastRow()-1,5).getValues();
  return data.map(row => ({
    name: row[0],
    calories: row[1],
    protein: row[2],
    carbs: row[3],
    fat: row[4]
  }));
}

function updateFoodData(name, calories, protein, carbs, fat) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('FoodDataBase');
  const data = sheet.getRange(2,1,sheet.getLastRow()-1,5).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === name) {
      // Update row i+2 (since data starts from row 2)
      sheet.getRange(i+2, 2, 1, 4).setValues([[calories, protein, carbs, fat]]);
      return true;  // success
    }
  }
  return false; // food not found
}

// Show delete dialog
function showDeleteFoodDialog() {
  const html = HtmlService.createHtmlOutputFromFile('delete_food_dialog')
    .setWidth(300)
    .setHeight(150);
  SpreadsheetApp.getUi().showModalDialog(html, 'Delete Food Entry');
}

function deleteFood(foodName) {
  if (!foodName) return false;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('FoodDataBase');
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
  const data = dataRange.getValues();

  // Filter out the row matching foodName
  const filteredData = data.filter(row => row[0] !== foodName);

  // Clear existing data range first
  dataRange.clearContent();

  // Write filtered data back if any
  if (filteredData.length > 0) {
    sheet.getRange(2, 1, filteredData.length, lastCol).setValues(filteredData);

    // Sort only the rows we have data for now
    sheet.getRange(2, 1, filteredData.length, lastCol).sort({column: 1, ascending: true});
  }

  return true;
}

function showMealOptions() {
  const html = HtmlService.createHtmlOutputFromFile('meal_options')
    .setWidth(300)
    .setHeight(150);
  SpreadsheetApp.getUi().showModalDialog(html, 'Add Meal');
}

function showManualMealForm() {
  const html = HtmlService.createHtmlOutputFromFile('manual_meal_form')
    .setWidth(300)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Add Meal Manually');
}

function addManualMeal(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MealDataBase");
  sheet.appendRow([
    data.mealName,
    Number(data.calories),
    Number(data.protein),
    Number(data.carb),
    Number(data.fat)
  ]);

  // 🔽 Sort MealDataBase by meal name (column A)
  const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  dataRange.sort({ column: 1, ascending: true });
}

function showMealFromFoodForm() {
  const html = HtmlService.createHtmlOutputFromFile('meal_from_food_form')
    .setWidth(500)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Add Meal from Existing Food');
}

function getFoodList() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FoodDataBase");
  const data = sheet.getRange("A2:A" + sheet.getLastRow()).getValues();
  return data.flat().filter(name => name);
}

function addMealFromFood(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const foodSheet = ss.getSheetByName("FoodDataBase");
  const mealSheet = ss.getSheetByName("MealDataBase");
  const prepSheet = ss.getSheetByName("MealPrep");

  const foodData = foodSheet.getRange(2, 1, foodSheet.getLastRow() - 1, 5).getValues(); // A-E
  const foodMap = {};
  foodData.forEach(row => {
    const [name, cal, prot, carb, fat] = row;
    if (name) foodMap[name] = { cal, prot, carb, fat };
  });

  let ingredients = data.ingredients;

  // 🔍 Find duplicates
  const counts = {};
  ingredients.forEach(item => {
    counts[item.food] = (counts[item.food] || 0) + 1;
  });

  const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);
  let combine = false;

  if (duplicates.length > 0) {
    const dupList = duplicates.map(d => `- ${d[0]} (${d[1]} times)`).join('\n');
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Duplicate Ingredients Found',
      `You have added the following ingredients multiple times:\n${dupList}\n\nDo you want to combine them?`,
      ui.ButtonSet.YES_NO
    );
    combine = (response === ui.Button.YES);
  }

  let finalList = [];

  if (combine) {
    const combinedSet = new Set(duplicates.map(d => d[0]));
    const seen = new Set();
    const combined = {};

    for (let item of ingredients) {
      const { food, amount } = item;

      if (combinedSet.has(food)) {
        if (!seen.has(food)) {
          // First appearance, create entry
          combined[food] = amount;
          seen.add(food);
        } else {
          // Additional appearance, just add to total
          combined[food] += amount;
        }
      } else {
        // Unique ingredient, add directly
        finalList.push({ food, amount });
      }
    }

    // Insert the combined duplicates in place of their first appearance
    const added = new Set();
    let output = [];
    for (let item of ingredients) {
      const { food } = item;
      if (combinedSet.has(food) && !added.has(food)) {
        output.push({ food, amount: combined[food] });
        added.add(food);
      } else if (!combinedSet.has(food)) {
        output.push(item); // original unique item
      }
    }
    ingredients = output;
  }

  // Now proceed with adding to sheet
  let total = { cal: 0, prot: 0, carb: 0, fat: 0 };

  ingredients.forEach(item => {
    const { food, amount } = item;
    if (!foodMap[food]) return;

    const multiplier = amount / 100;
    const cal = multiplier * foodMap[food].cal;
    const prot = multiplier * foodMap[food].prot;
    const carb = multiplier * foodMap[food].carb;
    const fat = multiplier * foodMap[food].fat;

    total.cal += cal;
    total.prot += prot;
    total.carb += carb;
    total.fat += fat;

    prepSheet.appendRow([
      data.mealName, food, amount,
      cal, prot, carb, fat
    ]);
  });

  mealSheet.appendRow([
    data.mealName,
    Math.round(total.cal * 100) / 100,
    Math.round(total.prot * 100) / 100,
    Math.round(total.carb * 100) / 100,
    Math.round(total.fat * 100) / 100
  ]);

  // Sort both Meal and Prep sheets
  const mealRange = mealSheet.getRange(2, 1, mealSheet.getLastRow() - 1, mealSheet.getLastColumn());
  mealRange.sort({ column: 1, ascending: true });

  const prepRange = prepSheet.getRange(2, 1, prepSheet.getLastRow() - 1, prepSheet.getLastColumn());
  prepRange.sort({ column: 1, ascending: true });
}

function showDeleteMealDialog() {
  const html = HtmlService.createHtmlOutputFromFile('delete_meal_dialog')
    .setWidth(300)
    .setHeight(150);
  SpreadsheetApp.getUi().showModalDialog(html, 'Delete Meal');
}

function getMealNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MealDataBase");
  const colA = sheet.getRange("A2:A").getValues();
  const names = [];

  for (let i = 0; i < colA.length; i++) {
    const name = colA[i][0];
    if (!name) break;  // Stop at first empty cell
    names.push(name);
  }

  return names;
}

function deleteMeal(mealName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mealSheet = ss.getSheetByName("MealDataBase");
  const prepSheet = ss.getSheetByName("MealPrep");

  if (!mealName) return;

  // Remove from MealDataBase
  const mealData = mealSheet.getDataRange().getValues();
  for (let i = mealData.length - 1; i >= 1; i--) {
    if (mealData[i][0] === mealName) {
      mealSheet.deleteRow(i + 1);
    }
  }

  // Remove from MealPrep
  const prepData = prepSheet.getDataRange().getValues();
  for (let i = prepData.length - 1; i >= 1; i--) {
    if (prepData[i][0] === mealName) {
      prepSheet.deleteRow(i + 1);
    }
  }

  // Re-sort MealDataBase
  if (mealSheet.getLastRow() > 1) {
    const range = mealSheet.getRange(2, 1, mealSheet.getLastRow() - 1, mealSheet.getLastColumn());
    range.sort({ column: 1, ascending: true });
  }

  // Re-sort MealPrep
  if (prepSheet.getLastRow() > 1) {
    const range = prepSheet.getRange(2, 1, prepSheet.getLastRow() - 1, prepSheet.getLastColumn());
    range.sort({ column: 1, ascending: true });
  }
}

function showEditMealDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dbSheet = ss.getSheetByName("MealDataBase");
  const prepSheet = ss.getSheetByName("MealPrep");

  // Load MealDataBase as array of meal objects
  const dbData = dbSheet.getDataRange().getValues(); // includes header
  const meals = []; // array of {name, calories, protein, carb, fat}
  for (let i = 1; i < dbData.length; i++) {
    const row = dbData[i];
    meals.push({
      name: row[0],
      calories: row[1],
      protein: row[2],
      carb: row[3],
      fat: row[4]
    });
  }

  // Load MealPrep
  const prepData = prepSheet.getDataRange().getValues(); // includes header
  const mealsPrep = [];
  for (let i = 1; i < prepData.length; i++) {
    const row = prepData[i];
    mealsPrep.push({
      name: row[0],
      food: row[1],
      amount: row[2]
    });
  }

  const foodNames = getFoodNames();

  const html = HtmlService.createTemplateFromFile('edit_meal');
  html.meals = meals;
  html.mealsPrep = mealsPrep;
  html.mealsPrepFoods = foodNames;

  SpreadsheetApp.getUi().showModalDialog(
    html.evaluate().setWidth(500).setHeight(600),
    'Edit Meal'
  );
}

function editMealFromFood(mealName) {
  // Placeholder: open a custom dialog or do something with the meal
  Logger.log("Editing meal from food: " + mealName);
}

function editMealFromManual(mealName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("MealDataBase");
  const data = sheet.getDataRange().getValues();

  // Find the row with the mealName in column A (index 0)
  let mealRow = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === mealName) {
      mealRow = data[i];
      break;
    }
  }
  if (!mealRow) {
    SpreadsheetApp.getUi().alert('Meal not found in MealDataBase.');
    return;
  }

  // Extract Calories, Protein, Carb, Fat from columns B, C, D, E (indexes 1,2,3,4)
  const mealData = {
    calories: mealRow[1],
    protein: mealRow[2],
    carb: mealRow[3],
    fat: mealRow[4]
  };

  // Pass data and mealName to the dialog
  const html = HtmlService.createTemplateFromFile('edit_meal_manual');
  html.mealName = mealName;
  html.mealData = mealData;

  SpreadsheetApp.getUi().showModalDialog(html.evaluate().setWidth(350).setHeight(300), mealName);
}

function updateMealNutrients(mealName, updatedData) {
  // Validate all inputs are numbers (floats)
  const fields = ['calories', 'protein', 'carb', 'fat'];
  for (const field of fields) {
    const val = updatedData[field];
    if (typeof val !== 'number' || isNaN(val)) {
      throw new Error(`Invalid value for ${field}. Please enter a valid number.`);
    }
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("MealDataBase");
  const data = sheet.getDataRange().getValues();

  // Find the row with the mealName in column A (index 0)
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === mealName) {
      rowIndex = i + 1; // +1 because sheet rows start at 1
      break;
    }
  }
  if (rowIndex === -1) {
    throw new Error('Meal not found: ' + mealName);
  }

  // Update columns B, C, D, E (2,3,4,5) with new values
  sheet.getRange(rowIndex, 2).setValue(updatedData.calories);
  sheet.getRange(rowIndex, 3).setValue(updatedData.protein);
  sheet.getRange(rowIndex, 4).setValue(updatedData.carb);
  sheet.getRange(rowIndex, 5).setValue(updatedData.fat);
}
