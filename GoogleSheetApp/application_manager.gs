function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Food Manager')
    .addItem('Add Food', 'showFoodDialog')
    .addItem('Add Meal', 'showMealOptions')
    .addToUi();
}

function showFoodDialog() {
  const html = HtmlService.createHtmlOutputFromFile('FoodForm')
    .setWidth(300)
    .setHeight(300);
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

function showMealOptions() {
  const html = HtmlService.createHtmlOutputFromFile('MealOptions')
    .setWidth(300)
    .setHeight(150);
  SpreadsheetApp.getUi().showModalDialog(html, 'Add Meal');
}

function showManualMealForm() {
  const html = HtmlService.createHtmlOutputFromFile('ManualMealForm')
    .setWidth(400)
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
  const html = HtmlService.createHtmlOutputFromFile('MealFromFoodForm')
    .setWidth(600)
    .setHeight(500);
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

  let total = { cal: 0, prot: 0, carb: 0, fat: 0 };

  data.ingredients.forEach(item => {
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

  // 🔽 Sort MealDataBase by meal name (A)
  const mealDataRange = mealSheet.getRange(2, 1, mealSheet.getLastRow() - 1, mealSheet.getLastColumn());
  mealDataRange.sort({ column: 1, ascending: true });

  // 🔽 Sort MealPrep by meal name (A)
  const prepDataRange = prepSheet.getRange(2, 1, prepSheet.getLastRow() - 1, prepSheet.getLastColumn());
  prepDataRange.sort({ column: 1, ascending: true });
}


