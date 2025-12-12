
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

export function getMonthNameFromDate(date: number) {
	const monthIndex = (date % 100) - 1; // YYYYMM → MM → 0-based
	return MONTHS[monthIndex];
}
