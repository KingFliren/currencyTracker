const currencyJournalName = "Cash Register";

async function createCurrencyJournal() {
  let journal = game.journal.getName(currencyJournalName);
  if (!journal) {
    journal = await JournalEntry.create({ name: currencyJournalName, content: "{}" });
  } else if (!journal.data.content || journal.data.content.trim() === "") {
    await journal.update({ content: "{}" });
  }
  return journal;
}

let currencyJournal;

Hooks.once('ready', async function() {
  console.log("Currency Tracker: Ready hook fired");
  currencyJournal = await createCurrencyJournal();
  console.log("Currency Journal:", currencyJournal);
  if (!currencyJournal.data.content || currencyJournal.data.content.trim() === "") {
    await currencyJournal.update({ content: "{}" });
    console.log("Currency Journal initialized with empty content");
  }
  // ... rest of the ready hook code

  // Add currency section to character sheets
Hooks.on("renderActorSheet", async (app, html, data) => {
  console.log("Rendering actor sheet");
  const playerId = data.actor.id;
  const currencies = getCurrencies();
  console.log("Currencies:", currencies);

  if (currencies.length === 0) {
    console.warn("No currencies defined. Check module settings.");
    return;
  }

  let currencySection = `<section class="currency-section"><h2>Currencies</h2>`;
  
  const playerCurrency = await getPlayerCurrency(playerId);
  console.log("Player currency:", playerCurrency);
  
  currencies.forEach(currency => {
    const amount = playerCurrency[currency.name] || 0;
    currencySection += `
      <div class="currency-item">
        <img src="${currency.icon}" alt="${currency.name}" width="20" height="20">
        <span>${currency.name}: </span>
        <input type="number" class="currency-value" data-player-id="${playerId}" data-currency-type="${currency.name}" value="${amount}">
      </div>`;
  });

  currencySection += `</section>`;
  console.log("Currency section HTML:", currencySection);
  
  const sheetBody = html.find('.sheet-body');
  if (sheetBody.length === 0) {
    console.warn("Could not find .sheet-body element");
  } else {
    sheetBody.append(currencySection);
    console.log("Currency section appended to sheet body");
  }

  // Add change listeners to input fields
  html.find('.currency-value').on('change', async (event) => {
    const input = event.currentTarget;
    const playerId = input.dataset.playerId;
    const currencyType = input.dataset.currencyType;
    const amount = parseInt(input.value);

    await updateCurrency(playerId, currencyType, amount);
  });
});

// Function to parse JSON safely
function parseJSONSafe(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse JSON content: ", error);
    return {};
  }
}

// Function to get player currency
async function getPlayerCurrency(playerId) {
  const data = parseJSONSafe(currencyJournal.data.content);
  return data[playerId] || {};
}

// Function to set player currency
async function setPlayerCurrency(playerId, currency) {
  const data = parseJSONSafe(currencyJournal.data.content);
  data[playerId] = currency;
  await currencyJournal.update({ content: JSON.stringify(data) });
}

// Function to update currency
async function updateCurrency(playerId, currencyType, amount) {
  const currency = await getPlayerCurrency(playerId);
  currency[currencyType] = amount;
  await setPlayerCurrency(playerId, currency);
  // Optionally, you can add a UI update here if needed
  ui.notifications.info(`Updated ${currencyType} for player ${playerId} to ${amount}`);
}

// Function to load currency values into the input fields
async function loadCurrencyValues(playerId) {
  const currency = await getPlayerCurrency(playerId);
  for (const [type, amount] of Object.entries(currency)) {
    $(`.currency-value[data-player-id="${playerId}"][data-currency-type="${type}"]`).val(amount);
  }
}
