
export type HotelCategory = 'Normal' | 'Medium' | 'Luxury';

export interface Hotel {
    id: string;
    name: string;
    location: string;
    city: string;
    image: string;
    rating: number;
    description: string;
    tags: string[];
    priceRange: string;
    price: number; 
    category: HotelCategory;
    // New Real-time Fields
    totalRooms: number;
    occupiedRooms: number;
}

export interface DistrictOccupancy {
    city: string;
    occupancy: number; // Percentage 0-100
    activeGuests: number;
    trend: 'RISING' | 'FALLING' | 'STABLE';
}

export interface GlobalStats {
    totalCapacity: number;
    totalOccupied: number;
    occupancyRate: number;
    soldOutHotels: number;
    availableHotels: number;
}

const CITIES = [
    'Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Pushkar', 
    'Mount Abu', 'Bikaner', 'Ajmer', 'Chittorgarh', 'Sawai Madhopur', 
    'Mandawa', 'Alwar', 'Kumbhalgarh'
];

const HOTEL_IMAGES = [
    'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2070&auto=format&fit=crop', // Palace
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop', // Lake
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop', // Heritage
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop', // White
    'https://images.unsplash.com/photo-1577908906518-c2b6279f53e6?q=80&w=2070&auto=format&fit=crop', // Desert
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=1854&auto=format&fit=crop', // Haveli
    'https://images.unsplash.com/photo-1590055531792-708d30e5e2e6?q=80&w=2070&auto=format&fit=crop', // Pool
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop', // Resort
];

const ADJECTIVES = ['Royal', 'Grand', 'Heritage', 'Imperial', 'Majestic', 'Golden', 'Regal', 'Oasis', 'Vintage', 'Luxury', 'Classic'];
const NOUNS = ['Palace', 'Haveli', 'Fort', 'Residency', 'Vilas', 'Retreat', 'Manor', 'Kothi', 'Niwas', 'Bagh', 'Mahal'];

// Featured Real Hotels (Top Tier)
const FEATURED_HOTELS: Hotel[] = [
    // --- LUXURY COLLECTION (> 7000) ---
    {
        id: 'rambagh-palace',
        name: 'Rambagh Palace',
        location: 'Bhawani Singh Rd, Jaipur',
        city: 'Jaipur',
        rating: 4.9,
        description: 'The Jewel of Jaipur, formerly the residence of the Maharaja of Jaipur. Experience true royalty.',
        image: 'https://files.oaiusercontent.com/file-2uXjNyiDhEZ5y9uHbCnDT8?se=2025-02-18T12%3A58%3A18Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3Ddb284b80-16d7-4632-a5e3-c24098492080.webp&sig=5Nq9Tj8u6FkHwF3D7G3Fkv%2ByiF8xT5L/g/2d7nZ04r4%3D',
        tags: ['Royal', 'History', 'Luxury'],
        priceRange: '₹₹₹₹₹',
        price: 45000,
        category: 'Luxury',
        totalRooms: 78,
        occupiedRooms: 65
    },
    {
        id: 'udaivilas',
        name: 'The Oberoi Udaivilas',
        location: 'Haridasji Ki Magri, Udaipur',
        city: 'Udaipur',
        rating: 5.0,
        description: 'Located on the banks of Lake Pichola, showcasing the rich heritage of the Mewar region.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
        tags: ['Lake View', 'Romance'],
        priceRange: '₹₹₹₹₹',
        price: 52000,
        category: 'Luxury',
        totalRooms: 87,
        occupiedRooms: 82
    },
    {
        id: 'umaid-bhawan',
        name: 'Umaid Bhawan Palace',
        location: 'Circuit House Rd, Jodhpur',
        city: 'Jodhpur',
        rating: 4.9,
        description: 'A magnificent piece of Rajasthan\'s heritage, part hotel and part museum.',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop',
        tags: ['Palace', 'Museum'],
        priceRange: '₹₹₹₹₹',
        price: 38000,
        category: 'Luxury',
        totalRooms: 64,
        occupiedRooms: 50
    },
    {
        id: 'suryagarh',
        name: 'Suryagarh',
        location: 'Kahala Phata, Jaisalmer',
        city: 'Jaisalmer',
        rating: 4.8,
        description: 'Your gateway to the Thar Desert, combining ancient traditions with modern luxury.',
        image: 'https://images.unsplash.com/photo-1577908906518-c2b6279f53e6?q=80&w=2070&auto=format&fit=crop',
        tags: ['Desert', 'Fort'],
        priceRange: '₹₹₹₹',
        price: 18000,
        category: 'Luxury',
        totalRooms: 72,
        occupiedRooms: 40
    },

    // --- MEDIUM COLLECTION (2500 - 7000) ---
    {
        id: 'shahpura-house',
        name: 'Shahpura House',
        location: 'Devi Marg, Jaipur',
        city: 'Jaipur',
        rating: 4.5,
        description: 'Traditional Rajput architecture mixed with modern amenities, offering a royal experience at a moderate price.',
        image: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=1854&auto=format&fit=crop',
        tags: ['Heritage', 'Boutique', 'Culture'],
        priceRange: '₹₹₹',
        price: 5500,
        category: 'Medium',
        totalRooms: 45,
        occupiedRooms: 38
    },
    {
        id: 'kankarwa-haveli',
        name: 'Kankarwa Haveli',
        location: 'Lal Ghat, Udaipur',
        city: 'Udaipur',
        rating: 4.4,
        description: 'A renovated heritage mansion right on the banks of Lake Pichola, family-run and authentic.',
        image: 'https://images.unsplash.com/photo-1590055531792-708d30e5e2e6?q=80&w=2070&auto=format&fit=crop',
        tags: ['Lake View', 'Heritage', 'Family'],
        priceRange: '₹₹₹',
        price: 4200,
        category: 'Medium',
        totalRooms: 30,
        occupiedRooms: 12
    },

    // --- NORMAL (POCKET FRIENDLY) COLLECTION (500 - 2500) ---
    {
        id: 'zostel-jaipur',
        name: 'Zostel Jaipur',
        location: 'Civil Lines, Jaipur',
        city: 'Jaipur',
        rating: 4.3,
        description: 'Vibrant and social atmosphere, perfect for backpackers and budget travelers seeking community.',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop',
        tags: ['Hostel', 'Budget', 'Social'],
        priceRange: '₹',
        price: 999,
        category: 'Normal',
        totalRooms: 50,
        occupiedRooms: 48
    },
    {
        id: 'lake-star',
        name: 'Hotel Lake Star',
        location: 'Near Lake Pichola, Udaipur',
        city: 'Udaipur',
        rating: 4.1,
        description: 'Clean, comfortable rooms with rooftop views of the lake at an unbeatable price.',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop',
        tags: ['Budget', 'View', 'Rooftop'],
        priceRange: '₹₹',
        price: 1800,
        category: 'Normal',
        totalRooms: 25,
        occupiedRooms: 20
    }
];

const generateHotels = (): Hotel[] => {
    const generated: Hotel[] = [];
    let idCounter = 1;

    // Generate ~200 hotels
    CITIES.forEach(city => {
        // Generate 15-20 hotels per city
        const count = 15 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < count; i++) {
            const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
            const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
            const imgIndex = Math.floor(Math.random() * HOTEL_IMAGES.length);
            
            // Randomly assign category based on probability
            const rand = Math.random();
            let category: HotelCategory;
            let price: number;
            let priceRange: string;
            let ratingBase: number;
            let namePrefix = "";
            
            // Room Capacity Calculation
            const rooms = Math.floor(Math.random() * 80) + 10; // 10 to 90 rooms
            const occupied = Math.floor(rooms * (Math.random() * 0.9)); // 0% to 90% full initially

            if (rand > 0.8) {
                // Luxury (20%) - Price > 7000
                category = 'Luxury';
                price = Math.floor(Math.random() * (45000 - 7000) + 7000);
                priceRange = '₹₹₹₹';
                ratingBase = 4.5;
                namePrefix = `${adj} ${noun}`;
            } else if (rand > 0.4) {
                // Medium (40%) - Price 2500 - 7000
                category = 'Medium';
                price = Math.floor(Math.random() * (7000 - 2500) + 2500);
                priceRange = '₹₹₹';
                ratingBase = 3.8;
                namePrefix = `${city} ${noun}`;
            } else {
                // Normal / Pocket Friendly (40%) - Price 500 - 2500
                category = 'Normal';
                price = Math.floor(Math.random() * (2500 - 500) + 500);
                priceRange = '₹₹';
                ratingBase = 3.0;
                namePrefix = `${city} Inn`;
            }

            const name = `${namePrefix} ${category === 'Luxury' ? '' : Math.floor(Math.random()*100)}`;
            const rating = (ratingBase + Math.random() * 0.5).toFixed(1);
            
            generated.push({
                id: `hotel-${city.toLowerCase()}-${idCounter++}`,
                name: name,
                location: `${city}, Rajasthan`,
                city: city,
                rating: parseFloat(rating),
                description: category === 'Normal' 
                    ? `A cozy and budget-friendly stay in the heart of ${city}.` 
                    : category === 'Medium' 
                        ? `Experience comfort and tradition at this beautiful property in ${city}.`
                        : `Unmatched luxury and royal heritage await you at this premier ${city} destination.`,
                image: HOTEL_IMAGES[imgIndex],
                tags: [category, 'Stay', city],
                priceRange: priceRange,
                price: price,
                category: category,
                totalRooms: rooms,
                occupiedRooms: occupied
            });
        }
    });

    return [...FEATURED_HOTELS, ...generated];
};

export const allHotels = generateHotels();

// Function to simulate real-time check-ins and check-outs
export const simulateLiveTraffic = (): GlobalStats => {
    // Randomly update 5-10 hotels every tick
    const hotelsToUpdate = Math.floor(Math.random() * 10) + 5;
    
    for(let i=0; i < hotelsToUpdate; i++) {
        const idx = Math.floor(Math.random() * allHotels.length);
        const hotel = allHotels[idx];
        
        // 50% chance to check-in or check-out
        const change = Math.random() > 0.5 ? 1 : -1;
        
        // Ensure boundaries
        if (change === 1 && hotel.occupiedRooms < hotel.totalRooms) {
            hotel.occupiedRooms++;
        } else if (change === -1 && hotel.occupiedRooms > 0) {
            hotel.occupiedRooms--;
        }
    }

    // Calculate Global Stats
    let totalCapacity = 0;
    let totalOccupied = 0;
    let soldOutHotels = 0;
    let availableHotels = 0;

    allHotels.forEach(h => {
        totalCapacity += h.totalRooms;
        totalOccupied += h.occupiedRooms;
        if (h.occupiedRooms >= h.totalRooms) {
            soldOutHotels++;
        } else {
            availableHotels++;
        }
    });

    const occupancyRate = Math.floor((totalOccupied / totalCapacity) * 100);

    return {
        totalCapacity,
        totalOccupied,
        occupancyRate,
        soldOutHotels,
        availableHotels
    };
};

export const getUniqueCities = () => ['All Cities', ...CITIES];

export const getDistrictOccupancy = (): DistrictOccupancy[] => {
    return CITIES.map(city => {
        // Calculate real averages based on hotels in that city
        const cityHotels = allHotels.filter(h => h.city === city);
        let cap = 0;
        let occ = 0;
        cityHotels.forEach(h => { cap += h.totalRooms; occ += h.occupiedRooms; });
        
        const occupancy = cap > 0 ? Math.floor((occ / cap) * 100) : 0;
        
        return {
            city,
            occupancy,
            activeGuests: occ,
            trend: (Math.random() > 0.6 ? 'RISING' : Math.random() > 0.5 ? 'FALLING' : 'STABLE') as 'RISING' | 'FALLING' | 'STABLE'
        };
    }).sort((a, b) => b.occupancy - a.occupancy);
};
