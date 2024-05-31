function trimString(str, max) {
	return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}

function reputationToString(reputation) {
	// Check if reputation is a number
	if (isNaN(reputation)) throw new Error('Reputation must be a number');

	// Define various reputation levels
	let reputationLevel;
	if (reputation < -100) reputationLevel = 'Utterly Hated!';
	else if (reputation < -50) reputationLevel = 'Die!!!';
	else if (reputation < -25) reputationLevel = 'RAAAAAHHH!!!';
	else if (reputation < -10) reputationLevel = 'Soaked in Milk.';
	else if (reputation < -5) reputationLevel = 'Rather Jiggly.';
	else if (reputation === 0) reputationLevel = 'Neutral.';
	else if (reputation < 5) reputationLevel = 'Microwaveable Friend. ';
	else if (reputation < 10) reputationLevel = 'Gooey Treat.';
	else if (reputation < 25) reputationLevel = 'Yammy Individual';
	else if (reputation < 50) reputationLevel = 'High Demand Creature.';
	else if (reputation < 100) reputationLevel = 'Marketable Plushy.';
	else reputationLevel = 'Sold Out Everywhere!';
	return reputationLevel;
}

module.exports = {
	trimString,
	reputationToString,
};
