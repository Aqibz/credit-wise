export type PakistanCity = {
  name: string;
  areas: string[];
};

export type PakistanProvince = {
  name: string;
  cities: PakistanCity[];
};

export const PAKISTAN_PROVINCES: PakistanProvince[] = [
  {
    name: "Punjab",
    cities: [
      {
        name: "Lahore",
        areas: [
          "Abbot Road",
          "Allama Iqbal Town",
          "Askari 10",
          "Awan Town",
          "Bahria Town",
          "Bedian Road",
          "Canal Road",
          "Cantt",
          "Cavalry Ground",
          "College Road",
          "DHA Phase 1",
          "DHA Phase 2",
          "DHA Phase 3",
          "DHA Phase 4",
          "DHA Phase 5",
          "DHA Phase 6",
          "DHA Phase 7",
          "DHA Phase 8",
          "Faisal Town",
          "Ferozepur Road",
          "Garden Town",
          "Garhi Shahu",
          "Gulberg",
          "Harbanspura",
          "Iqbal Town",
          "Johar Town",
          "Kalma Chowk",
          "Liberty Market",
          "LDA Avenue",
          "Mall Road",
          "Model Town",
          "Muslim Town",
          "Paragon City",
          "Raiwind Road",
          "Sabzazar",
          "Shad Bagh",
          "Shadman",
          "Shahdara",
          "Thokar Niaz Baig",
          "Township",
          "Valencia Town",
          "Wafaqi Colony",
          "Wapda Town",
        ],
      },
      {
        name: "Rawalpindi",
        areas: [
          "Bahria Town",
          "Chaklala",
          "Commercial Market",
          "Committee Chowk",
          "Dhoke Kala Khan",
          "Gulraiz Housing",
          "Liaquat Bagh",
          "Pirwadhai",
          "PWD Housing",
          "Raja Bazaar",
          "Saddar",
          "Satellite Town",
          "Scheme 3",
          "Westridge",
        ],
      },
      {
        name: "Faisalabad",
        areas: [
          "Abdullahpur",
          "Batala Colony",
          "Canal Road",
          "D Ground",
          "Ghulam Muhammad Abad",
          "Jaranwala Road",
          "Madina Town",
          "Peoples Colony",
          "Samanabad",
          "Susan Road",
        ],
      },
      {
        name: "Multan",
        areas: [
          "Bosan Road",
          "Cantt",
          "Gulgasht Colony",
          "Mumtazabad",
          "New Multan",
          "Shah Rukn-e-Alam",
          "Suraj Miani",
          "Vehari Road",
        ],
      },
      {
        name: "Gujranwala",
        areas: [
          "Cantt",
          "Civil Lines",
          "DC Colony",
          "Model Town",
          "Peoples Colony",
          "Satellite Town",
          "Sialkot Bypass",
          "Wapda Town",
        ],
      },
      {
        name: "Sialkot",
        areas: [
          "Cantt",
          "Defence Road",
          "Hajipura",
          "Kashmir Road",
          "Marshall Town",
          "Paris Road",
          "Small Industrial Estate",
          "Ugoki",
        ],
      },
      {
        name: "Bahawalpur",
        areas: [
          "Ahmedpur East Road",
          "Cantt",
          "Dubai Chowk",
          "Model Town",
          "Satellite Town",
          "Shahi Bazar",
          "Yazman Road",
        ],
      },
      {
        name: "Sargodha",
        areas: [
          "49 Tail",
          "Bhalwal Road",
          "Club Road",
          "Fatima Jinnah Road",
          "Katchery Bazar",
          "Satellite Town",
          "University Road",
        ],
      },
    ],
  },
  {
    name: "Sindh",
    cities: [
      {
        name: "Karachi",
        areas: [
          "Bahadurabad",
          "Clifton",
          "Defence Phase 1",
          "Defence Phase 2",
          "Defence Phase 5",
          "Federal B Area",
          "Gulistan-e-Jauhar",
          "Gulshan-e-Iqbal",
          "Korangi",
          "Liaquatabad",
          "Malir",
          "Nazimabad",
          "North Karachi",
          "PECHS",
          "Shahrah-e-Faisal",
          "Saddar",
        ],
      },
      {
        name: "Hyderabad",
        areas: [
          "Auto Bhan Road",
          "Cantt",
          "Citizen Colony",
          "Latifabad",
          "Qasimabad",
          "Resham Gali",
          "Station Road",
        ],
      },
      {
        name: "Sukkur",
        areas: [
          "Barrage Road",
          "Clock Tower",
          "Military Road",
          "New Pind",
          "Shikarpur Road",
          "Station Road",
        ],
      },
    ],
  },
  {
    name: "Khyber Pakhtunkhwa",
    cities: [
      {
        name: "Peshawar",
        areas: [
          "Cantt",
          "Hayatabad",
          "Jamrud Road",
          "Karkhano Market",
          "Ring Road",
          "Saddar",
          "University Town",
          "Warsak Road",
        ],
      },
      {
        name: "Abbottabad",
        areas: [
          "Jhangi",
          "Mandian",
          "Nawan Shehr",
          "Supply",
          "Thanda Choha",
        ],
      },
      {
        name: "Mardan",
        areas: [
          "Bagh-e-Iram",
          "Bank Road",
          "College Chowk",
          "Nowshera Road",
          "Sheikh Maltoon Town",
        ],
      },
    ],
  },
  {
    name: "Balochistan",
    cities: [
      {
        name: "Quetta",
        areas: [
          "Airport Road",
          "Brewery Road",
          "Jinnah Town",
          "Samungli Road",
          "Satellite Town",
          "Sariab Road",
          "Zarghoon Road",
        ],
      },
      {
        name: "Gwadar",
        areas: [
          "Airport Area",
          "Fisherman Colony",
          "Jiwani Road",
          "Marine Drive",
          "Shahi Bazaar",
        ],
      },
    ],
  },
  {
    name: "Islamabad Capital Territory",
    cities: [
      {
        name: "Islamabad",
        areas: [
          "B-17",
          "Blue Area",
          "DHA Phase 2",
          "F-6",
          "F-7",
          "F-8",
          "F-10",
          "F-11",
          "G-9",
          "G-10",
          "G-11",
          "I-8",
          "I-10",
          "PWD Housing",
          "Soan Garden",
        ],
      },
    ],
  },
  {
    name: "Azad Jammu and Kashmir",
    cities: [
      {
        name: "Muzaffarabad",
        areas: [
          "Ambore",
          "Chehla Bandi",
          "Lower Chattar",
          "Upper Chattar",
        ],
      },
      {
        name: "Mirpur",
        areas: [
          "Allama Iqbal Road",
          "Bhimber Road",
          "F-1",
          "New Mirpur City",
        ],
      },
    ],
  },
  {
    name: "Gilgit-Baltistan",
    cities: [
      {
        name: "Gilgit",
        areas: [
          "Bagrote",
          "Danyor",
          "Jutial",
          "Kashrote",
          "Sakwar",
        ],
      },
      {
        name: "Skardu",
        areas: [
          "Airport Road",
          "Ali Abad",
          "Hussainabad",
          "Kachura Road",
          "New Ranga",
        ],
      },
    ],
  },
];

type CityMeta = {
  province: string;
  city: PakistanCity;
};

const cityMeta = PAKISTAN_PROVINCES.flatMap((province) =>
  province.cities.map((city) => ({
    province: province.name,
    city,
  })),
);

export function getPakistanProvinceNames(): string[] {
  return PAKISTAN_PROVINCES.map((province) => province.name);
}

export function getPakistanProvinceOptions() {
  return getPakistanProvinceNames().map((province) => ({
    value: province,
    label: province,
  }));
}

export function getPakistanProvinceForCity(cityName: string) {
  return cityMeta.find(({ city }) => city.name === cityName)?.province ?? "";
}

export function getPakistanCityOptions() {
  return cityMeta
    .slice()
    .sort((a, b) => a.city.name.localeCompare(b.city.name))
    .map(({ province, city }) => ({
      value: city.name,
      label: city.name,
      keywords: [province, ...city.areas],
    }));
}

export function getPakistanAreaOptions(cityName: string) {
  const selectedCity = cityMeta.find(({ city }) => city.name === cityName)?.city;

  return (selectedCity?.areas ?? [])
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((area) => ({
      value: area,
      label: area,
      keywords: [cityName],
    }));
}
