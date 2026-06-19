import type { SearchableSelectOption } from "@/shared/ui/primitives/searchable-select";

type PakistanBank = {
  value: string;
  aliases?: string[];
};

const PAKISTAN_BANKS: PakistanBank[] = [
  { value: "Al Baraka Bank (Pakistan) Limited", aliases: ["Al Baraka", "ABPL"] },
  { value: "Allied Bank Limited", aliases: ["ABL", "Allied Bank"] },
  { value: "Askari Bank Limited", aliases: ["Askari", "AKBL"] },
  { value: "Bank Al Habib Limited", aliases: ["BAHL", "Bank Al Habib"] },
  { value: "Bank Alfalah Limited", aliases: ["BAFL", "Bank Alfalah"] },
  { value: "BankIslami Pakistan Limited", aliases: ["BIPL", "BankIslami"] },
  { value: "Citibank N.A.", aliases: ["Citibank"] },
  { value: "Deutsche Bank AG", aliases: ["Deutsche Bank"] },
  { value: "Dubai Islamic Bank Pakistan Limited", aliases: ["DIB", "DIBPL", "Dubai Islamic Bank"] },
  { value: "Easypaisa Bank Limited", aliases: ["Easypaisa Bank"] },
  { value: "Faysal Bank Limited", aliases: ["FBL", "Faysal Bank"] },
  { value: "First Women Bank Limited", aliases: ["FWBL", "First Women Bank"] },
  { value: "Habib Bank Limited", aliases: ["HBL", "Habib Bank"] },
  { value: "Habib Metropolitan Bank Limited", aliases: ["HMB", "HMBL", "Habib Metropolitan"] },
  { value: "Industrial and Commercial Bank of China Limited", aliases: ["ICBC", "ICBC Pakistan"] },
  { value: "JS Bank Limited", aliases: ["JS Bank", "JSBL"] },
  { value: "MCB Bank Limited", aliases: ["MCB", "Muslim Commercial Bank"] },
  { value: "MCB Islamic Bank Limited", aliases: ["MCB Islamic"] },
  { value: "Mashreq Bank Pakistan Limited", aliases: ["Mashreq Bank"] },
  { value: "Meezan Bank Limited", aliases: ["Meezan", "MBL"] },
  { value: "National Bank of Pakistan", aliases: ["NBP", "National Bank"] },
  { value: "Punjab Provincial Cooperative Bank Limited", aliases: ["PPCBL", "Provincial Cooperative Bank"] },
  { value: "Raqami Islamic Digital Bank Limited", aliases: ["Raqami", "Raqami Bank"] },
  { value: "Samba Bank Limited", aliases: ["Samba Bank"] },
  { value: "Sindh Bank Limited", aliases: ["Sindh Bank"] },
  { value: "Soneri Bank Limited", aliases: ["Soneri"] },
  { value: "Standard Chartered Bank (Pakistan) Limited", aliases: ["SCB", "Standard Chartered"] },
  { value: "The Bank of Khyber", aliases: ["BOK", "Bank of Khyber"] },
  { value: "The Bank of Punjab", aliases: ["BOP", "Bank of Punjab"] },
  { value: "United Bank Limited", aliases: ["UBL", "United Bank"] },
  { value: "Zarai Taraqiati Bank Limited", aliases: ["ZTBL", "Zarai Taraqiati Bank"] },
];

export function getPakistanBankOptions(): SearchableSelectOption[] {
  return PAKISTAN_BANKS.map((bank) => ({
    value: bank.value,
    label: bank.value,
    keywords: bank.aliases ?? [],
  }));
}
