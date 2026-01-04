import { ALGERIA_DATA } from './algeria-data';

export interface ShippingRate {
    home: number | null;
    stopDesk: number | null; // null means unavailable
}

// Key is Wilaya Code
export const ZR_EXPRESS_RATES: Record<number, ShippingRate> = {
    // 1-10
    1: { home: 1400, stopDesk: 900 },  // Adrar
    2: { home: 800, stopDesk: 450 },   // Chlef
    3: { home: 950, stopDesk: 600 },   // Laghouat
    4: { home: 750, stopDesk: 450 },   // Oum El Bouaghi
    5: { home: 750, stopDesk: 450 },   // Batna
    6: { home: 750, stopDesk: 450 },   // Bejaia
    7: { home: 950, stopDesk: 550 },   // Biskra
    8: { home: 1100, stopDesk: 650 },  // Bechar
    9: { home: 750, stopDesk: 450 },   // Blida
    10: { home: 750, stopDesk: 450 },  // Bouira

    // 11-20
    11: { home: 1600, stopDesk: 1050 }, // Tamanrasset
    12: { home: 800, stopDesk: 450 },   // Tebessa
    13: { home: 900, stopDesk: 500 },   // Tlemcen
    14: { home: 800, stopDesk: 450 },   // Tiaret
    15: { home: 750, stopDesk: 450 },   // Tizi Ouzou
    16: { home: 650, stopDesk: 400 },   // Alger
    17: { home: 950, stopDesk: 500 },   // Djelfa
    18: { home: 750, stopDesk: 450 },   // Jijel
    19: { home: 750, stopDesk: 450 },   // Setif
    20: { home: 800, stopDesk: 500 },   // Saida

    // 21-30
    21: { home: 700, stopDesk: 450 },   // Skikda
    22: { home: 800, stopDesk: 450 },   // Sidi Bel Abbes
    23: { home: 500, stopDesk: 300 },   // Annaba
    24: { home: 700, stopDesk: 450 },   // Guelma
    25: { home: 700, stopDesk: 450 },   // Constantine
    26: { home: 800, stopDesk: 450 },   // Medea
    27: { home: 800, stopDesk: 450 },   // Mostaganem
    28: { home: 850, stopDesk: 500 },   // M'Sila
    29: { home: 800, stopDesk: 450 },   // Mascara
    30: { home: 1000, stopDesk: 600 },  // Ouargla

    // 31-40
    31: { home: 800, stopDesk: 450 },   // Oran
    32: { home: 1050, stopDesk: 600 },  // El Bayadh
    33: { home: null, stopDesk: null }, // Illizi (0/0)
    34: { home: 750, stopDesk: 450 },   // Bordj Bou Arreridj
    35: { home: 750, stopDesk: 450 },   // Boumerdes
    36: { home: 650, stopDesk: 450 },   // El Tarf
    37: { home: null, stopDesk: null }, // Tindouf (0/0)
    38: { home: 800, stopDesk: 520 },   // Tissemsilt
    39: { home: 1000, stopDesk: 600 },  // El Oued
    40: { home: 750, stopDesk: null },  // Khenchela (750/0)

    // 41-50
    41: { home: 750, stopDesk: 450 },   // Souk Ahras
    42: { home: 800, stopDesk: 450 },   // Tipaza
    43: { home: 750, stopDesk: 450 },   // Mila
    44: { home: 800, stopDesk: 450 },   // Ain Defla
    45: { home: 1100, stopDesk: 600 },  // Naama
    46: { home: 800, stopDesk: 450 },   // Ain Temouchent
    47: { home: 1000, stopDesk: 600 },  // Ghardaia
    48: { home: 800, stopDesk: 450 },   // Relizane
    49: { home: 1400, stopDesk: null }, // Timimoun (1400/0)
    50: { home: null, stopDesk: null }, // Bordj Badji Mokhtar (0/0)

    // 51-58
    51: { home: 950, stopDesk: 550 },   // Ouled Djellal
    52: { home: 1000, stopDesk: 900 },  // Beni Abbes
    53: { home: 1600, stopDesk: null }, // In Salah (1600/0)
    54: { home: 1600, stopDesk: null }, // In Guezzam (1600/0)
    55: { home: 1000, stopDesk: 600 },  // Touggourt
    56: { home: null, stopDesk: null }, // Djanet (0/0)
    57: { home: 950, stopDesk: null },  // M'Ghair (950/0)
    58: { home: 1000, stopDesk: null }, // Meniaa (1000/0)

    // 59-69 (Delegated - New)
    // Using default safe fallback (Home 900, Desk null) until user specifies
    59: { home: 950, stopDesk: 600 }, // Aflou (Like Laghouat)
    60: { home: 800, stopDesk: 450 }, // Barika (Like Batna)
    61: { home: 800, stopDesk: 450 }, // Ksar Chellala (Like Tiaret)
    62: { home: 950, stopDesk: 600 }, // Ain Oussera (Like Djelfa)
    63: { home: 950, stopDesk: 600 }, // Messaad (Like Djelfa)
    64: { home: 850, stopDesk: 500 }, // Bousaada (Like M'Sila)
    65: { home: 1100, stopDesk: null }, // El Abiodh (Like El Bayadh)
    66: { home: 750, stopDesk: 450 }, // Ksar El Boukhari (Like Medea)
    67: { home: 850, stopDesk: 450 }, // Bir El Ater (Like Tebessa)
    68: { home: 950, stopDesk: 600 }, // El Kantara (Like Biskra)
    69: { home: 850, stopDesk: 500 }, // El Aricha (Like Tlemcen)
};

export const getShippingRate = (wilayaName: string, deliveryType: 'Home Delivery' | 'Stop Desk' | string): number => {
    if (!wilayaName) return 0;

    // Find wilaya code by Arabic name
    const wilaya = ALGERIA_DATA.find(w => w.ar_name === wilayaName || w.name === wilayaName);

    if (!wilaya) return 0;

    const rates = ZR_EXPRESS_RATES[wilaya.code];
    if (!rates) return 0;

    if (deliveryType === 'Stop Desk') {
        // If Stop Desk is explicitely null (unavailable), we might want to return a specific indicator or just 0
        // For calculation purposes, if unavailable, we ideally shouldn't allow selecting it.
        // But if selected, return 0 or default?
        // Let's return rates.stopDesk if it exists, otherwise fall back to home or throwing error?
        // We'll return 0 if null, but UI should handle hiding the option.
        return rates.stopDesk || 0;
    }

    // Default to Home Delivery
    // If home is null (unavailable), return 0
    return rates.home || 0;
};

// Helper to check if Stop Desk is available
export const isStopDeskAvailable = (wilayaName: string): boolean => {
    if (!wilayaName) return false;
    const wilaya = ALGERIA_DATA.find(w => w.ar_name === wilayaName || w.name === wilayaName);
    if (!wilaya) return false;

    const rates = ZR_EXPRESS_RATES[wilaya.code];
    return rates && rates.stopDesk !== null && rates.stopDesk !== 0;
}
