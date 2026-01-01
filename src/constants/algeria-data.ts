// Algerian Wilayas and Communes Data
export interface Commune {
    code: number;
    name: string;
    ar_name: string;
    wilaya_code: number;
}

export interface Wilaya {
    code: number;
    name: string;
    ar_name: string;
    communes: Commune[];
}

export const ALGERIA_DATA: Wilaya[] = [
    {
        code: 1, name: "Adrar", ar_name: "أدرار", communes: [
            { code: 101, name: "Adrar", ar_name: "أدرار", wilaya_code: 1 },
            { code: 102, name: "Tamest", ar_name: "تامست", wilaya_code: 1 },
            { code: 112, name: "Aoulef", ar_name: "أولف", wilaya_code: 1 },
            { code: 104, name: "Reggane", ar_name: "رقان", wilaya_code: 1 }
        ]
    },
    {
        code: 2, name: "Chlef", ar_name: "الشلف", communes: [
            { code: 201, name: "Chlef", ar_name: "الشلف", wilaya_code: 2 },
            { code: 202, name: "Tenes", ar_name: "تنس", wilaya_code: 2 },
            { code: 204, name: "El Karimia", ar_name: "الكريمية", wilaya_code: 2 },
            { code: 212, name: "Boukadir", ar_name: "بوقادير", wilaya_code: 2 }
        ]
    },
    {
        code: 3, name: "Laghouat", ar_name: "الأغواط", communes: [
            { code: 301, name: "Laghouat", ar_name: "الأغواط", wilaya_code: 3 },
            { code: 302, name: "Ksar El Hirane", ar_name: "قصر الحيران", wilaya_code: 3 },
            { code: 304, name: "Aflou", ar_name: "أفلو", wilaya_code: 3 }
        ]
    },
    {
        code: 4, name: "Oum El Bouaghi", ar_name: "أم البواقي", communes: [
            { code: 401, name: "Oum El Bouaghi", ar_name: "أم البواقي", wilaya_code: 4 },
            { code: 402, name: "Ain Beida", ar_name: "عين البيضاء", wilaya_code: 4 },
            { code: 403, name: "Ain M'lila", ar_name: "عين مليلة", wilaya_code: 4 }
        ]
    },
    {
        code: 5, name: "Batna", ar_name: "باتنة", communes: [
            { code: 501, name: "Batna", ar_name: "باتنة", wilaya_code: 5 },
            { code: 502, name: "Ghassira", ar_name: "غسيرة", wilaya_code: 5 },
            { code: 503, name: "Maafa", ar_name: "معافة", wilaya_code: 5 }
        ]
    },
    {
        code: 6, name: "Béjaïa", ar_name: "بجاية", communes: [
            { code: 601, name: "Béjaïa", ar_name: "بجاية", wilaya_code: 6 },
            { code: 602, name: "Amizour", ar_name: "أميزور", wilaya_code: 6 },
            { code: 608, name: "Akbou", ar_name: "أقبو", wilaya_code: 6 }
        ]
    },
    {
        code: 7, name: "Biskra", ar_name: "بسكرة", communes: [
            { code: 701, name: "Biskra", ar_name: "بسكرة", wilaya_code: 7 },
            { code: 705, name: "Ouled Djellal", ar_name: "أولاد جلال", wilaya_code: 7 },
            { code: 707, name: "Tolga", ar_name: "طولقة", wilaya_code: 7 }
        ]
    },
    {
        code: 8, name: "Béchar", ar_name: "بشار", communes: [
            { code: 801, name: "Béchar", ar_name: "بشار", wilaya_code: 8 },
            { code: 803, name: "Kenadsa", ar_name: "القنادسة", wilaya_code: 8 },
            { code: 806, name: "Taghit", ar_name: "تاغيت", wilaya_code: 8 }
        ]
    },
    {
        code: 9, name: "Blida", ar_name: "البليدة", communes: [
            { code: 901, name: "Blida", ar_name: "البليدة", wilaya_code: 9 },
            { code: 902, name: "Chebli", ar_name: "شبلي", wilaya_code: 9 },
            { code: 904, name: "Boufarik", ar_name: "بوفاريك", wilaya_code: 9 },
            { code: 921, name: "Ouled Yaich", ar_name: "أولاد يعيش", wilaya_code: 9 }
        ]
    },
    {
        code: 10, name: "Bouira", ar_name: "البويرة", communes: [
            { code: 1001, name: "Bouira", ar_name: "البويرة", wilaya_code: 10 },
            { code: 1004, name: "Lakhdaria", ar_name: "الأخضرية", wilaya_code: 10 },
            { code: 1005, name: "Sour El Ghozlane", ar_name: "سور الغزلان", wilaya_code: 10 }
        ]
    },
    {
        code: 11, name: "Tamanrasset", ar_name: "تمنراست", communes: [
            { code: 1101, name: "Tamanrasset", ar_name: "تمنراست", wilaya_code: 11 },
            { code: 1104, name: "In Salah", ar_name: "عين صالح", wilaya_code: 11 }
        ]
    },
    {
        code: 12, name: "Tébessa", ar_name: "تبسة", communes: [
            { code: 1201, name: "Tébessa", ar_name: "تبسة", wilaya_code: 12 },
            { code: 1205, name: "Cheria", ar_name: "الشريعة", wilaya_code: 12 }
        ]
    },
    {
        code: 13, name: "Tlemcen", ar_name: "تلمسان", communes: [
            { code: 1301, name: "Tlemcen", ar_name: "تلمسان", wilaya_code: 13 },
            { code: 1322, name: "Maghnia", ar_name: "مغنية", wilaya_code: 13 }
        ]
    },
    {
        code: 14, name: "Tiaret", ar_name: "تيارت", communes: [
            { code: 1401, name: "Tiaret", ar_name: "تيارت", wilaya_code: 14 },
            { code: 1402, name: "Medroussa", ar_name: "مدروسة", wilaya_code: 14 }
        ]
    },
    {
        code: 15, name: "Tizi Ouzou", ar_name: "تيزي وزو", communes: [
            { code: 1501, name: "Tizi Ouzou", ar_name: "تيزي وزو", wilaya_code: 15 },
            { code: 1504, name: "Azazga", ar_name: "عزازقة", wilaya_code: 15 }
        ]
    },
    {
        code: 16, name: "Alger", ar_name: "الجزائر", communes: [
            { code: 1601, name: "Alger Centre", ar_name: "الجزائر الوسطى", wilaya_code: 16 },
            { code: 1602, name: "Sidi M'Hamed", ar_name: "سيدي امحمد", wilaya_code: 16 },
            { code: 1613, name: "El Harrach", ar_name: "الحراش", wilaya_code: 16 },
            { code: 1621, name: "Bab Ezzouar", ar_name: "باب الزوار", wilaya_code: 16 },
            { code: 1630, name: "Bordj El Kiffan", ar_name: "برج الكيفان", wilaya_code: 16 },
            { code: 1642, name: "Rouiba", ar_name: "الرويبة", wilaya_code: 16 }
        ]
    },
    {
        code: 17, name: "Djelfa", ar_name: "الجلفة", communes: [
            { code: 1701, name: "Djelfa", ar_name: "الجلفة", wilaya_code: 17 },
            { code: 1704, name: "Hassi Bahbah", ar_name: "حاسي بحبح", wilaya_code: 17 }
        ]
    },
    {
        code: 18, name: "Jijel", ar_name: "جيجل", communes: [
            { code: 1801, name: "Jijel", ar_name: "جيجل", wilaya_code: 18 },
            { code: 1802, name: "Erraguene", ar_name: "الأرھاط", wilaya_code: 18 }
        ]
    },
    {
        code: 19, name: "Sétif", ar_name: "سطيف", communes: [
            { code: 1901, name: "Sétif", ar_name: "سطيف", wilaya_code: 19 },
            { code: 1902, name: "Ain El Kebira", ar_name: "عين البيضاء", wilaya_code: 19 },
            { code: 1908, name: "El Eulma", ar_name: "العلمة", wilaya_code: 19 }
        ]
    },
    {
        code: 20, name: "Saïda", ar_name: "سعيدة", communes: [
            { code: 2001, name: "Saïda", ar_name: "سعيدة", wilaya_code: 20 }
        ]
    },
    {
        code: 21, name: "Skikda", ar_name: "سكيكدة", communes: [
            { code: 2101, name: "Skikda", ar_name: "سكيكدة", wilaya_code: 21 },
            { code: 2103, name: "El Hadaiek", ar_name: "الحدائق", wilaya_code: 21 }
        ]
    },
    {
        code: 22, name: "Sidi Bel Abbès", ar_name: "سيدي بلعباس", communes: [
            { code: 2201, name: "Sidi Bel Abbès", ar_name: "سيدي بلعباس", wilaya_code: 22 }
        ]
    },
    {
        code: 23, name: "Annaba", ar_name: "عنابة", communes: [
            { code: 2301, name: "Annaba", ar_name: "عنابة", wilaya_code: 23 },
            { code: 2302, name: "Berrahal", ar_name: "برحال", wilaya_code: 23 },
            { code: 2305, name: "El Bouni", ar_name: "البوني", wilaya_code: 23 }
        ]
    },
    {
        code: 24, name: "Guelma", ar_name: "قالمة", communes: [
            { code: 2401, name: "Guelma", ar_name: "قالمة", wilaya_code: 24 }
        ]
    },
    {
        code: 25, name: "Constantine", ar_name: "قسنطينة", communes: [
            { code: 2501, name: "Constantine", ar_name: "قسنطينة", wilaya_code: 25 },
            { code: 2502, name: "Hamma Bouziane", ar_name: "حامة بوزيان", wilaya_code: 25 },
            { code: 2503, name: "El Khroub", ar_name: "الخروب", wilaya_code: 25 }
        ]
    },
    {
        code: 26, name: "Médéa", ar_name: "المدية", communes: [
            { code: 2601, name: "Médéa", ar_name: "المدية", wilaya_code: 26 }
        ]
    },
    {
        code: 27, name: "Mostaganem", ar_name: "مستغانم", communes: [
            { code: 2701, name: "Mostaganem", ar_name: "مستغانم", wilaya_code: 27 }
        ]
    },
    {
        code: 28, name: "M'Sila", ar_name: "المسيلة", communes: [
            { code: 2801, name: "M'Sila", ar_name: "المسيلة", wilaya_code: 28 }
        ]
    },
    {
        code: 29, name: "Mascara", ar_name: "معسكر", communes: [
            { code: 2901, name: "Mascara", ar_name: "معسكر", wilaya_code: 29 }
        ]
    },
    {
        code: 30, name: "Ouargla", ar_name: "ورقلة", communes: [
            { code: 3001, name: "Ouargla", ar_name: "ورقلة", wilaya_code: 30 },
            { code: 3004, name: "Hassi Messaoud", ar_name: "حاسي مسعود", wilaya_code: 30 }
        ]
    },
    {
        code: 31, name: "Oran", ar_name: "وهران", communes: [
            { code: 3101, name: "Oran", ar_name: "وهران", wilaya_code: 31 },
            { code: 3103, name: "Bir El Djir", ar_name: "بئر الجير", wilaya_code: 31 },
            { code: 3105, name: "Es Senia", ar_name: "السانية", wilaya_code: 31 }
        ]
    },
    {
        code: 32, name: "El Bayadh", ar_name: "البيض", communes: [
            { code: 3201, name: "El Bayadh", ar_name: "البيض", wilaya_code: 32 }
        ]
    },
    {
        code: 33, name: "Illizi", ar_name: "إليزي", communes: [
            { code: 3301, name: "Illizi", ar_name: "إليزي", wilaya_code: 33 }
        ]
    },
    {
        code: 34, name: "Bordj Bou Arréridj", ar_name: "برج بوعريريج", communes: [
            { code: 3401, name: "Bordj Bou Arréridj", ar_name: "برج بوعريريج", wilaya_code: 34 }
        ]
    },
    {
        code: 35, name: "Boumerdès", ar_name: "بومرداس", communes: [
            { code: 3501, name: "Boumerdès", ar_name: "بومرداس", wilaya_code: 35 }
        ]
    },
    {
        code: 36, name: "El Tarf", ar_name: "الطارف", communes: [
            { code: 3601, name: "El Tarf", ar_name: "الطارف", wilaya_code: 36 }
        ]
    },
    {
        code: 37, name: "Tindouf", ar_name: "تندوف", communes: [
            { code: 3701, name: "Tindouf", ar_name: "تندوف", wilaya_code: 37 }
        ]
    },
    {
        code: 38, name: "Tissemsilt", ar_name: "تسمسيلت", communes: [
            { code: 3801, name: "Tissemsilt", ar_name: "تسمسيلت", wilaya_code: 38 }
        ]
    },
    {
        code: 39, name: "El Oued", ar_name: "الوادي", communes: [
            { code: 3901, name: "El Oued", ar_name: "الوادي", wilaya_code: 39 }
        ]
    },
    {
        code: 40, name: "Khenchela", ar_name: "خنشلة", communes: [
            { code: 4001, name: "Khenchela", ar_name: "خنشلة", wilaya_code: 40 }
        ]
    },
    {
        code: 41, name: "Souk Ahras", ar_name: "سوق أهراس", communes: [
            { code: 4101, name: "Souk Ahras", ar_name: "سوق أهراس", wilaya_code: 41 }
        ]
    },
    {
        code: 42, name: "Tipaza", ar_name: "تيبازة", communes: [
            { code: 4201, name: "Tipaza", ar_name: "تيبازة", wilaya_code: 42 }
        ]
    },
    {
        code: 43, name: "Mila", ar_name: "ميلة", communes: [
            { code: 4301, name: "Mila", ar_name: "ميلة", wilaya_code: 43 }
        ]
    },
    {
        code: 44, name: "Aïn Defla", ar_name: "عين الدفلى", communes: [
            { code: 4401, name: "Aïn Defla", ar_name: "عين الدفلى", wilaya_code: 44 }
        ]
    },
    {
        code: 45, name: "Naâma", ar_name: "النعامة", communes: [
            { code: 4501, name: "Naâma", ar_name: "النعامة", wilaya_code: 45 }
        ]
    },
    {
        code: 46, name: "Aïn Témouchent", ar_name: "عين تموشنت", communes: [
            { code: 4601, name: "Aïn Témouchent", ar_name: "عين تموشنت", wilaya_code: 46 }
        ]
    },
    {
        code: 47, name: "Ghardaïa", ar_name: "غرداية", communes: [
            { code: 4701, name: "Ghardaïa", ar_name: "غرداية", wilaya_code: 47 }
        ]
    },
    {
        code: 48, name: "Relizane", ar_name: "غليزان", communes: [
            { code: 4801, name: "Relizane", ar_name: "غليزان", wilaya_code: 48 }
        ]
    },
    {
        code: 49, name: "El M'Ghair", ar_name: "المغير", communes: [
            { code: 4901, name: "El M'Ghair", ar_name: "المغير", wilaya_code: 49 }
        ]
    },
    {
        code: 50, name: "El Menia", ar_name: "المنيعة", communes: [
            { code: 5001, name: "El Menia", ar_name: "المنيعة", wilaya_code: 50 }
        ]
    },
    {
        code: 51, name: "Ouled Djellal", ar_name: "أولاد جلال", communes: [
            { code: 5101, name: "Ouled Djellal", ar_name: "أولاد جلال", wilaya_code: 51 }
        ]
    },
    {
        code: 52, name: "Bordj Baji Mokhtar", ar_name: "برج باجي مختار", communes: [
            { code: 5201, name: "Bordj Baji Mokhtar", ar_name: "برج باجي مختار", wilaya_code: 52 }
        ]
    },
    {
        code: 53, name: "Béni Abbès", ar_name: "بني عباس", communes: [
            { code: 5301, name: "Béni Abbès", ar_name: "بني عباس", wilaya_code: 53 }
        ]
    },
    {
        code: 54, name: "Timimoun", ar_name: "تيميمون", communes: [
            { code: 5401, name: "Timimoun", ar_name: "تيميمون", wilaya_code: 54 }
        ]
    },
    {
        code: 55, name: "Touggourt", ar_name: "تقرت", communes: [
            { code: 5501, name: "Touggourt", ar_name: "تقرت", wilaya_code: 55 }
        ]
    },
    {
        code: 56, name: "Djanet", ar_name: "جانت", communes: [
            { code: 5601, name: "Djanet", ar_name: "جانت", wilaya_code: 56 }
        ]
    },
    {
        code: 57, name: "In Salah", ar_name: "عين صالح", communes: [
            { code: 5701, name: "In Salah", ar_name: "عين صالح", wilaya_code: 57 }
        ]
    },
    {
        code: 58, name: "In Guezzam", ar_name: "عين قزام", communes: [
            { code: 5801, name: "In Guezzam", ar_name: "عين قزام", wilaya_code: 58 }
        ]
    }
];

// Helper function to get all wilayas
export const getWilayas = (): Wilaya[] => ALGERIA_DATA;

// Helper function to get communes for a specific wilaya
export const getCommunesByWilaya = (wilayaCode: number): Commune[] => {
    const wilaya = ALGERIA_DATA.find(w => w.code === wilayaCode);
    return wilaya?.communes || [];
};

// Helper function to search wilayas
export const searchWilayas = (query: string): Wilaya[] => {
    const lowerQuery = query.toLowerCase();
    return ALGERIA_DATA.filter(
        w => w.name.toLowerCase().includes(lowerQuery) ||
            w.ar_name.includes(query)
    );
};

// Helper function to search communes
export const searchCommunes = (query: string, wilayaCode?: number): Commune[] => {
    const lowerQuery = query.toLowerCase();
    const data = wilayaCode
        ? getCommunesByWilaya(wilayaCode)
        : ALGERIA_DATA.flatMap(w => w.communes);

    return data.filter(
        c => c.name.toLowerCase().includes(lowerQuery) ||
            c.ar_name.includes(query)
    );
};
