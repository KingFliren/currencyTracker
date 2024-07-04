Hooks.once('init', () => {
  game.settings.register('currency-tracker', 'currencies', {
    name: 'Currencies',
    hint: 'Define the currencies available in the game.',
    scope: 'world',
    config: true,
    type: String,
    default: JSON.stringify([
      { name: "Gold", icon: "icons/commodities/currency/coin-embossed-gold.webp" },
      { name: "Silver", icon: "icons/commodities/currency/coin-embossed-silver.webp" }
    ]),
    onChange: value => console.log(`Currency settings changed to ${value}`)
  });
});

// Function to get currencies from settings
function getCurrencies() {
  const currenciesString = game.settings.get('currency-tracker', 'currencies');
  try {
    const currencies = JSON.parse(currenciesString);
    if (!Array.isArray(currencies)) {
      console.warn("Currencies setting is not an array. Returning empty array.");
      return [];
    }
    return currencies.map(currency => {
      if (typeof currency !== 'object' || !currency.name || !currency.icon) {
        console.warn(`Invalid currency object found: ${JSON.stringify(currency)}. Skipping.`);
        return null;
      }
      return {
        name: String(currency.name),
        icon: String(currency.icon)
      };
    }).filter(currency => currency !== null);
  } catch (error) {
    console.error("Failed to parse currencies settings: ", error);
    return [];
  }
}
