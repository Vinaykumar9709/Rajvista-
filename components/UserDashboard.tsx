
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { Sparkles, Send, Coffee, Wifi, Calendar, MapPin, Grid, IndianRupee, Clock, X, CheckCircle, Utensils, Minus, Plus, Trash2, Soup, Wine, Crown, Star, ArrowLeft, Search, Filter, BarChart3, TrendingUp, TrendingDown, Minus as MinusIcon, Banknote, Building, Palmtree, ExternalLink, ArrowRightCircle, Plane, Activity, DoorOpen, BedDouble } from 'lucide-react';
import { getConciergeResponse } from '../services/geminiService';
import { allHotels, getUniqueCities, Hotel, getDistrictOccupancy, DistrictOccupancy, HotelCategory, simulateLiveTraffic, GlobalStats } from '../data/hotelData';

interface Props {
  user: User;
}

// Room Definitions
type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CHECKOUT_SOON';
type RoomType = 'NORMAL' | 'MEDIUM' | 'LUXURY';

interface Room {
    number: string;
    status: RoomStatus;
    type: RoomType;
    price: number;
    bookedUntil?: Date;
    label: string; // Dynamic label based on hotel type
}

interface FoodItem {
    id: string;
    name: string;
    category: 'Royal' | 'Main' | 'Starter' | 'Beverage';
    price: number;
    description: string;
}

interface CartItem extends FoodItem {
    qty: number;
}

// Booking Platform Interface
interface BookingPlatform {
    id: string;
    name: string;
    logoColor: string;
    textColor: string;
    baseVariance: number; // e.g., 0.95 for 5% off, 1.0 for standard
    url: string; // Base URL (used as fallback)
}

const BOOKING_PLATFORMS: BookingPlatform[] = [
    { id: 'rajvista', name: 'Rajvista Official', logoColor: 'bg-amber-900', textColor: 'text-amber-50', baseVariance: 1.0, url: '' },
    { id: 'mmt', name: 'MakeMyTrip', logoColor: 'bg-red-600', textColor: 'text-white', baseVariance: 0.98, url: 'https://www.makemytrip.com/hotels/' },
    { id: 'agoda', name: 'Agoda', logoColor: 'bg-blue-600', textColor: 'text-white', baseVariance: 0.92, url: 'https://www.agoda.com/' },
    { id: 'booking', name: 'Booking.com', logoColor: 'bg-blue-900', textColor: 'text-white', baseVariance: 1.02, url: 'https://www.booking.com/' },
    { id: 'goibibo', name: 'Goibibo', logoColor: 'bg-orange-500', textColor: 'text-white', baseVariance: 0.95, url: 'https://www.goibibo.com/hotels/' },
    { id: 'cleartrip', name: 'Cleartrip', logoColor: 'bg-sky-500', textColor: 'text-white', baseVariance: 0.97, url: 'https://www.cleartrip.com/hotels' },
];

const SPA_PRICE_PER_HOUR = 5000;

const FOOD_MENU: FoodItem[] = [
    { id: '1', category: 'Royal', name: 'Dal Baati Churma', price: 850, description: 'Classic Rajasthani dish with lentils and baked wheat balls.' },
    { id: '2', category: 'Royal', name: 'Laal Maas', price: 1100, description: 'Fiery mutton curry prepared in a sauce of yogurt and hot spices.' },
    { id: '3', category: 'Starter', name: 'Murgh Malai Tikka', price: 650, description: 'Creamy chicken kebabs cooked in a clay oven.' },
    { id: '4', category: 'Starter', name: 'Paneer Tikka', price: 550, description: 'Spiced cottage cheese cubes grilled to perfection.' },
    { id: '5', category: 'Main', name: 'Butter Chicken', price: 750, description: 'Chicken in a mildly spiced tomato cream sauce.' },
    { id: '6', category: 'Main', name: 'Vegetable Biryani', price: 600, description: 'Basmati rice cooked with mixed vegetables and aromatic spices.' },
    { id: '7', category: 'Beverage', name: 'Masala Chai', price: 200, description: 'Traditional Indian spiced tea.' },
    { id: '8', category: 'Beverage', name: 'Sweet Lassi', price: 250, description: 'Chilled yogurt drink served in a clay pot.' },
];

const UserDashboard: React.FC<Props> = ({ user }) => {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [listingCategory, setListingCategory] = useState<HotelCategory>('Luxury'); // Default to Luxury
  
  const [visibleCount, setVisibleCount] = useState(12);
  const [occupancyStats, setOccupancyStats] = useState<DistrictOccupancy[]>([]);
  const [liveStats, setLiveStats] = useState<GlobalStats | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RoomType>('NORMAL');

  // Booking Modal State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingDays, setBookingDays] = useState<number>(1);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null); // Stores ID of platform being booked
  const [bookedPlatform, setBookedPlatform] = useState<string>('');

  // Spa Modal State
  const [showSpaModal, setShowSpaModal] = useState(false);
  const [spaHours, setSpaHours] = useState(1);
  const [spaTime, setSpaTime] = useState('10:00');
  const [showSpaSuccess, setShowSpaSuccess] = useState(false);

  // Food Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showFoodSuccess, setShowFoodSuccess] = useState(false);

  // Initialize Rooms with State
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // Dynamic Room Configuration calculated when a hotel is selected
  const [roomConfig, setRoomConfig] = useState<Record<RoomType, { label: string, price: number }>>({
      NORMAL: { label: 'Standard', price: 0 },
      MEDIUM: { label: 'Deluxe', price: 0 },
      LUXURY: { label: 'Suite', price: 0 }
  });

  useEffect(() => {
    // Initial fetch
    setOccupancyStats(getDistrictOccupancy());
    setLiveStats(simulateLiveTraffic());

    // Live update loop (2.5 seconds)
    const interval = setInterval(() => {
        setOccupancyStats(getDistrictOccupancy());
        setLiveStats(simulateLiveTraffic());
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedHotel) {
        setChatHistory([{ role: 'ai', text: `Namaste ${user.name}, welcome to ${selectedHotel.name}. I am your Royal Concierge. How may I serve you today?` }]);
        
        // Dynamic Price Calculation based on Hotel Base Price
        const basePrice = selectedHotel.price;
        const newConfig = {
            NORMAL: { 
                label: selectedHotel.category === 'Normal' ? 'Standard Room' : 'Deluxe Room', 
                price: basePrice 
            },
            MEDIUM: { 
                label: selectedHotel.category === 'Normal' ? 'Deluxe Room' : 'Executive Suite', 
                price: Math.floor(basePrice * 1.5) 
            },
            LUXURY: { 
                label: selectedHotel.category === 'Normal' ? 'Family Suite' : 'Royal Suite', 
                price: Math.floor(basePrice * 2.5) 
            },
        };
        setRoomConfig(newConfig);

        // Regenerate rooms when hotel changes to simulate different availability
        const generatedRooms: Room[] = [];
        
        const createBatch = (type: RoomType, count: number, startId: number, configItem: { label: string, price: number }) => {
            for (let i = 1; i <= count; i++) {
                const roomNum = (startId + i).toString();
                const rand = Math.random();
                let status: RoomStatus = 'AVAILABLE';
                let bookedUntil: Date | undefined = undefined;

                if (rand > 0.6) {
                    const futureDate = new Date();
                    if (Math.random() > 0.7) {
                        status = 'CHECKOUT_SOON';
                        const hoursLeft = Math.floor(Math.random() * 5) + 1;
                        futureDate.setTime(futureDate.getTime() + (hoursLeft * 60 * 60 * 1000));
                    } else {
                        status = 'OCCUPIED';
                        const days = Math.floor(Math.random() * 10) + 1;
                        futureDate.setDate(futureDate.getDate() + days);
                    }
                    bookedUntil = futureDate;
                }

                generatedRooms.push({
                    number: roomNum,
                    type,
                    price: configItem.price,
                    label: configItem.label,
                    status,
                    bookedUntil
                });
            }
        };

        createBatch('NORMAL', 50, 100, newConfig.NORMAL);
        createBatch('MEDIUM', 30, 200, newConfig.MEDIUM);
        createBatch('LUXURY', 10, 300, newConfig.LUXURY);
        
        setRooms(generatedRooms);
    }
  }, [selectedHotel, user.name]);

  // Filter Hotels Logic
  // DEPENDENCY ON liveStats IS CRITICAL FOR RE-RENDERING INDIVIDUAL BARS
  const filteredHotels = useMemo(() => {
    return allHotels.filter(hotel => {
        const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              hotel.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = selectedCity === 'All Cities' || hotel.city === selectedCity;
        const matchesCategory = hotel.category === listingCategory;
        
        return matchesSearch && matchesCity && matchesCategory;
    });
  }, [searchQuery, selectedCity, listingCategory, liveStats]);

  const loadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const getStatusColor = (status: RoomStatus) => {
      switch (status) {
          case 'AVAILABLE': return 'bg-green-600 text-white shadow-green-200 hover:bg-green-700 cursor-pointer border border-green-500';
          case 'OCCUPIED': return 'bg-red-700 text-white shadow-red-200 cursor-not-allowed opacity-90 border border-red-800'; 
          case 'CHECKOUT_SOON': return 'bg-yellow-400 text-yellow-900 shadow-yellow-200 cursor-not-allowed border border-yellow-500';
          default: return 'bg-slate-300';
      }
  };

  const getReviewText = (room: Room) => {
      if (room.status === 'AVAILABLE') return 'BOOK';
      if (!room.bookedUntil) return 'OCCUPIED';

      const now = new Date();
      const diffMs = room.bookedUntil.getTime() - now.getTime();
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      
      if (room.status === 'CHECKOUT_SOON') {
          return `Free in ${diffHours} h`;
      }
      return `Occupied`;
  };

  const handleRoomClick = (room: Room) => {
      if (room.status === 'AVAILABLE') {
          setSelectedRoom(room);
          setBookingDays(1);
          setShowBookingSuccess(false);
          setBookingLoading(null);
      }
  };

  const confirmBooking = (platformId: string, platformName: string, defaultUrl: string) => {
      if (!selectedRoom) return;
      
      setBookingLoading(platformId);

      // Handle External Redirects
      if (platformId !== 'rajvista') {
          setTimeout(() => {
              let finalUrl = defaultUrl;
              
              if (selectedHotel) {
                 // Construct specific Search Query for the platforms to open the specific hotel
                 const query = encodeURIComponent(`${selectedHotel.name} ${selectedHotel.city}`);
                 
                 switch (platformId) {
                     case 'booking':
                         finalUrl = `https://www.booking.com/searchresults.html?ss=${query}`;
                         break;
                     case 'agoda':
                         finalUrl = `https://www.agoda.com/search?text=${query}`;
                         break;
                     case 'mmt':
                         finalUrl = `https://www.makemytrip.com/hotels/hotel-listing/?searchText=${query}`;
                         break;
                     case 'goibibo':
                         finalUrl = `https://www.goibibo.com/hotels/?searchText=${query}`;
                         break;
                     case 'cleartrip':
                         finalUrl = `https://www.cleartrip.com/hotels/results?search=${query}`;
                         break;
                     default:
                         // Fallback to Google Search if platform logic is unknown
                         finalUrl = `https://www.google.com/search?q=${query}+booking`;
                         break;
                 }
              }
              
              window.open(finalUrl, '_blank');
              setBookingLoading(null);
              // Close modal after redirecting to let them continue
              setSelectedRoom(null);
          }, 1500);
          return;
      }
      
      // Handle Internal Rajvista Booking
      setTimeout(() => {
          const finishDate = new Date();
          finishDate.setDate(finishDate.getDate() + Number(bookingDays));
          
          setRooms(prevRooms => prevRooms.map(r => {
              if (r.number === selectedRoom.number) {
                  return { ...r, status: 'OCCUPIED', bookedUntil: finishDate };
              }
              return r;
          }));
          
          setBookedPlatform(platformName);
          setShowBookingSuccess(true);
          setBookingLoading(null);
          
          setTimeout(() => { 
              setSelectedRoom(null); 
              setShowBookingSuccess(false); 
          }, 3000);
      }, 1500);
  };

  // Helper to Calculate Dynamic Platform Prices
  const getComparisonPrices = (basePrice: number) => {
      // Create deterministic but random-looking variance based on basePrice
      return BOOKING_PLATFORMS.map(platform => {
          // Add a little randomness so it's not always exactly the same multiplier
          // Using basePrice as a seed for consistent randomness per room would be complex, 
          // so we'll just use the random math for now as it re-renders.
          const variance = platform.baseVariance + (Math.random() * 0.04 - 0.02); // +/- 2% jitter
          const finalPrice = Math.floor(basePrice * variance);
          
          // Calculate "Fake" original price to show discount
          const originalPrice = Math.floor(finalPrice * (1 + Math.random() * 0.2 + 0.1)); // 10-30% higher
          const discount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);

          return {
              ...platform,
              finalPrice,
              originalPrice,
              discount
          };
      }).sort((a, b) => a.finalPrice - b.finalPrice); // Sort cheapest first
  };

  // Spa Handlers
  const confirmSpaBooking = () => {
      setShowSpaSuccess(true);
      setTimeout(() => { setShowSpaModal(false); setShowSpaSuccess(false); }, 2000);
  };

  // Food Handlers
  const addToCart = (item: FoodItem) => {
      setCart(prev => {
          const existing = prev.find(i => i.id === item.id);
          if (existing) {
              return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
          }
          return [...prev, { ...item, qty: 1 }];
      });
  };

  const updateQty = (id: string, delta: number) => {
      setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const confirmFoodOrder = () => {
      setShowFoodSuccess(true);
      setTimeout(() => { 
          setShowFoodModal(false); 
          setShowFoodSuccess(false); 
          setCart([]);
      }, 2000);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: 'user' as const, text: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setLoadingAi(true);
    const aiResponse = await getConciergeResponse(chatInput, user.name);
    setChatHistory([...newHistory, { role: 'ai', text: aiResponse }]);
    setLoadingAi(false);
  };

  // --- VIEW: HOTEL SELECTION ---
  if (!selectedHotel) {
      return (
          <div className="space-y-8 animate-fade-in pb-10">
              <div className="space-y-4 pt-4">
                  <div className="text-center">
                    <h2 className="text-4xl font-serif font-bold text-amber-900">The Rajvista Collection</h2>
                    <p className="text-amber-800/70 font-serif text-lg">Select a destination to begin your royal journey in Rajasthan.</p>
                  </div>

                  {/* LIVE REAL-TIME DASHBOARD WIDGET */}
                  {liveStats && (
                    <>
                     <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#2c1a1a] p-4 rounded-xl shadow-lg border-t-4 border-amber-600 z-10 relative">
                        <div className="flex items-center gap-4 border-r border-amber-800/50 pr-4">
                            <div className="p-3 bg-amber-900/50 rounded-lg">
                                <BedDouble className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Total Capacity</p>
                                <p className="text-2xl font-serif font-bold text-white leading-none">{liveStats.totalCapacity.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border-r border-amber-800/50 pr-4">
                            <div className="p-3 bg-red-900/30 rounded-lg">
                                <DoorOpen className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-red-300 font-bold">Sold Out Hotels</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-serif font-bold text-white leading-none">{liveStats.soldOutHotels}</p>
                                    <span className="text-xs text-red-400 mb-0.5">Full</span>
                                </div>
                            </div>
                        </div>

                         <div className="flex items-center gap-4 border-r border-amber-800/50 pr-4">
                            <div className="p-3 bg-green-900/30 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-green-300 font-bold">Available Hotels</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-serif font-bold text-white leading-none">{liveStats.availableHotels}</p>
                                    <span className="text-xs text-green-400 mb-0.5">Open</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pl-2">
                             <div className="p-3 bg-blue-900/30 rounded-lg">
                                <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                            </div>
                             <div>
                                <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">Live Occupancy</p>
                                <div className="w-full bg-blue-900/50 h-1.5 rounded-full mt-1 mb-1 max-w-[100px]">
                                    <div 
                                        className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000" 
                                        style={{ width: `${liveStats.occupancyRate}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-blue-200">{liveStats.occupancyRate}% Rooms Filled</p>
                            </div>
                        </div>
                     </div>

                     {/* NEW: Live Hotel Ticker */}
                     <div className="max-w-6xl mx-auto mt-2 bg-[#1f1212] border-x border-b border-amber-900/50 rounded-b-xl p-2 overflow-hidden flex items-center relative shadow-lg z-0">
                         <style>{`
                            @keyframes marquee {
                                0% { transform: translateX(0); }
                                100% { transform: translateX(-50%); }
                            }
                            .animate-marquee-infinite {
                                animation: marquee 400s linear infinite;
                                display: flex; /* Ensure horizontal layout */
                                width: max-content; /* Allow content to dictate width */
                            }
                            .animate-marquee-infinite:hover {
                                animation-play-state: paused;
                            }
                        `}</style>
                        <div className="bg-red-900/80 text-white text-[10px] font-bold px-3 py-1 rounded mr-3 flex items-center gap-2 shadow-sm border border-red-700 z-10 whitespace-nowrap">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            LIVE FEED
                        </div>
                        <div className="flex-1 overflow-hidden relative mask-linear-fade">
                             <div className="animate-marquee-infinite">
                                {/* Duplicate the list to ensure seamless scrolling loop */}
                                {[...allHotels, ...allHotels].map((hotel, i) => {
                                     const pct = Math.round((hotel.occupiedRooms / hotel.totalRooms) * 100);
                                     const color = pct >= 90 ? 'text-red-400' : pct >= 60 ? 'text-amber-400' : 'text-green-400';
                                     return (
                                        <div key={`${hotel.id}-${i}`} className="inline-flex items-center mx-4 text-sm font-mono text-amber-200/60 whitespace-nowrap">
                                            <span className="font-serif font-bold text-amber-100 mr-2">{hotel.name}</span>
                                            <span className={`font-bold ${color} flex items-center gap-1`}>
                                                {pct}% <span className="text-[10px] opacity-70">Occupied</span>
                                            </span>
                                            <span className="mx-4 text-amber-900/40">|</span>
                                        </div>
                                     )
                                })}
                             </div>
                        </div>
                     </div>
                    </>
                  )}

                  {/* Search and Filter Bar */}
                  <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-md border border-amber-100 relative z-10">
                      <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                          <input 
                              type="text" 
                              placeholder="Search hotels, cities..." 
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-amber-200 outline-none focus:ring-2 focus:ring-amber-500 font-serif text-amber-900 placeholder:text-amber-800/40"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                      <div className="relative w-full md:w-64">
                          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                          <select 
                              className="w-full pl-10 pr-10 py-3 rounded-lg border border-amber-200 outline-none focus:ring-2 focus:ring-amber-500 font-serif text-amber-900 appearance-none bg-white cursor-pointer"
                              value={selectedCity}
                              onChange={(e) => setSelectedCity(e.target.value)}
                          >
                              {getUniqueCities().map(city => (
                                  <option key={city} value={city}>{city}</option>
                              ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <span className="text-amber-500 text-xs">▼</span>
                          </div>
                      </div>
                  </div>

                  {/* Category Selection Tabs */}
                  <div className="max-w-4xl mx-auto flex justify-center w-full">
                      <div className="flex p-1 bg-amber-100 rounded-xl gap-1 w-full md:w-auto">
                          <button 
                             onClick={() => setListingCategory('Normal')}
                             className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold font-serif transition-all flex-1 md:flex-initial justify-center ${listingCategory === 'Normal' ? 'bg-white text-green-800 shadow-md' : 'text-amber-800 hover:bg-amber-200/50'}`}
                          >
                              <Banknote className="w-4 h-4" />
                              Normal (₹500 - ₹2500)
                          </button>
                          <button 
                             onClick={() => setListingCategory('Medium')}
                             className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold font-serif transition-all flex-1 md:flex-initial justify-center ${listingCategory === 'Medium' ? 'bg-white text-amber-900 shadow-md' : 'text-amber-800 hover:bg-amber-200/50'}`}
                          >
                              <Building className="w-4 h-4" />
                              Medium (₹2500 - ₹7000)
                          </button>
                          <button 
                             onClick={() => setListingCategory('Luxury')}
                             className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold font-serif transition-all flex-1 md:flex-initial justify-center ${listingCategory === 'Luxury' ? 'bg-white text-purple-900 shadow-md' : 'text-amber-800 hover:bg-amber-200/50'}`}
                          >
                              <Crown className="w-4 h-4" />
                              Luxury (₹7000+)
                          </button>
                      </div>
                  </div>
              </div>

              <div className="flex justify-between items-center px-2">
                 <p className="text-amber-800 font-medium font-serif">Showing {Math.min(visibleCount, filteredHotels.length)} of {filteredHotels.length} {listingCategory} Properties</p>
                 {selectedCity !== 'All Cities' && (
                    <button 
                        onClick={() => setSelectedCity('All Cities')}
                        className="text-xs text-amber-700 underline hover:text-amber-900"
                    >
                        Clear Location Filter
                    </button>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredHotels.slice(0, visibleCount).map(hotel => {
                      const occupancyPercent = Math.round((hotel.occupiedRooms / hotel.totalRooms) * 100);
                      let barColor = 'bg-green-500';
                      if (occupancyPercent > 60) barColor = 'bg-amber-500';
                      if (occupancyPercent > 85) barColor = 'bg-red-500';

                      return (
                      <div key={hotel.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-100 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full cursor-pointer" onClick={() => setSelectedHotel(hotel)}>
                          <div className="relative h-56 overflow-hidden">
                              <img 
                                  src={hotel.image} 
                                  alt={hotel.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-amber-900 shadow-sm">
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {hotel.rating}
                              </div>
                              <div className={`absolute bottom-4 left-4 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/20
                                  ${hotel.category === 'Luxury' ? 'bg-purple-900/80 text-purple-100' : 
                                    hotel.category === 'Medium' ? 'bg-amber-900/80 text-amber-100' : 
                                    'bg-green-800/80 text-green-100'}`}>
                                  {hotel.category === 'Normal' ? 'Pocket Friendly' : hotel.category}
                              </div>
                              
                              {/* Top Right Occupancy Badge */}
                              <div className="absolute top-4 left-4">
                                   {hotel.occupiedRooms >= hotel.totalRooms ? (
                                       <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-red-500 uppercase tracking-wide">
                                           Sold Out
                                       </span>
                                   ) : (
                                       <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-white/20 flex items-center gap-1">
                                           <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                           {hotel.totalRooms - hotel.occupiedRooms} Rooms Left
                                       </span>
                                   )}
                              </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                              <div className="mb-2">
                                  <h3 className="text-xl font-serif font-bold text-amber-900 mb-1 line-clamp-1">{hotel.name}</h3>
                                  <div className="flex items-center gap-1 text-amber-700 text-xs uppercase tracking-wide font-bold">
                                      <MapPin className="w-3 h-3" /> {hotel.city}
                                  </div>
                              </div>
                              <p className="text-amber-800/70 text-sm mb-4 line-clamp-2 flex-1 font-serif">{hotel.description}</p>
                              
                              {/* --- INDIVIDUAL REAL-TIME OCCUPANCY VISUALIZER --- */}
                              <div className="mb-3 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                            </span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-800">Real-Time Status</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-900">{occupancyPercent}% Full</span>
                                    </div>
                                    <div className="w-full bg-amber-200/50 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ease-out ${barColor}`} 
                                            style={{ width: `${occupancyPercent}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[9px] text-amber-700">{hotel.occupiedRooms} Occupied</span>
                                        <span className="text-[9px] font-bold text-green-700">{hotel.totalRooms - hotel.occupiedRooms} Available</span>
                                    </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-auto">
                                  {hotel.tags.slice(0, 3).map(tag => (
                                      <span key={tag} className="px-2 py-1 bg-amber-50 text-amber-800 text-[10px] font-medium rounded-md border border-amber-100">{tag}</span>
                                  ))}
                              </div>
                              <div className="mt-4 pt-3 border-t border-amber-50 font-bold text-amber-900 text-sm flex items-center justify-between">
                                  <span className="text-xs text-amber-700 font-normal">Starting from</span>
                                  <span className="text-lg">₹{hotel.price.toLocaleString()}</span>
                              </div>
                          </div>
                          <div className="p-4 pt-0">
                                <button 
                                    className="w-full py-3 bg-amber-50 text-amber-900 font-serif font-bold rounded-xl group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    Select Property
                                </button>
                          </div>
                      </div>
                  )})}
              </div>

              {visibleCount < filteredHotels.length && (
                  <div className="text-center pt-8 pb-12">
                      <button 
                          onClick={loadMore}
                          className="px-8 py-3 bg-white border-2 border-amber-900 text-amber-900 font-serif font-bold rounded-full hover:bg-amber-900 hover:text-white transition-colors shadow-lg"
                      >
                          Load More Hotels
                      </button>
                  </div>
              )}
          </div>
      );
  }

  // --- VIEW: HOTEL DASHBOARD (Existing Logic) ---
  const displayedRooms = rooms.filter(r => r.type === selectedCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full relative">
      
      {/* --- ROOM BOOKING MODAL (PRICE COMPARISON) --- */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-[#2c1a1a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#fffbf0] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in relative border-2 border-amber-700">
                {!showBookingSuccess && (
                    <button onClick={() => setSelectedRoom(null)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-amber-100 text-amber-800 z-10"><X className="w-5 h-5" /></button>
                )}
                {showBookingSuccess ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-80">
                        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4 border-2 border-green-600"><CheckCircle className="w-10 h-10" /></div>
                        <h3 className="text-2xl font-serif font-bold text-amber-900">Booking Confirmed!</h3>
                        <p className="text-amber-800/80 mt-2 font-serif text-lg">
                            Reservation successfully made via <span className="font-bold text-amber-900">{bookedPlatform}</span>.
                        </p>
                        <p className="text-sm text-amber-600 mt-1">Room {selectedRoom.number} is now yours.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-[80vh] md:h-auto">
                        <div className="bg-[#2c1a1a] text-amber-50 p-6 border-b border-amber-700">
                            <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-amber-500" /> 
                                Compare & Book Room {selectedRoom.number}
                            </h3>
                            <p className="text-amber-200/60 text-xs mt-1">Select your preferred booking partner for the lowest rates.</p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {/* Duration Input */}
                            <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                <div>
                                    <label className="block text-xs font-serif font-bold text-amber-900 uppercase tracking-wide mb-1">Stay Duration</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min="1" max="30" value={bookingDays} onChange={(e) => setBookingDays(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 border border-amber-200 rounded-lg px-3 py-2 text-lg font-bold text-center focus:ring-2 focus:ring-amber-600 outline-none bg-white text-amber-900" />
                                        <span className="text-amber-800 font-serif">Nights</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-amber-600">Average Rate</p>
                                    <p className="text-xl font-bold text-amber-900 font-serif">₹{selectedRoom.price.toLocaleString()}<span className="text-sm text-amber-600 font-sans font-normal">/night</span></p>
                                </div>
                            </div>

                            {/* Comparison List */}
                            <div className="space-y-3">
                                {getComparisonPrices(selectedRoom.price).map((platform) => (
                                    <div key={platform.id} className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">
                                        {/* Highlight Cheapest */}
                                        {platform.discount > 10 && (
                                            <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                                                SAVE {platform.discount}%
                                            </div>
                                        )}

                                        {/* Platform Logo/Name */}
                                        <div className="flex items-center gap-4 w-full sm:w-1/3">
                                            <div className={`w-10 h-10 ${platform.logoColor} ${platform.textColor} rounded-lg flex items-center justify-center font-bold text-xs shadow-sm`}>
                                                {platform.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-amber-900 font-serif">{platform.name}</span>
                                        </div>

                                        {/* Price Section */}
                                        <div className="text-center sm:text-right flex-1">
                                            {platform.discount > 0 && (
                                                <div className="text-xs text-red-400 line-through font-medium">
                                                    ₹{(platform.originalPrice * bookingDays).toLocaleString()}
                                                </div>
                                            )}
                                            <div className="text-xl font-bold text-amber-950 font-serif">
                                                ₹{(platform.finalPrice * bookingDays).toLocaleString()}
                                                <span className="text-[10px] text-amber-600 font-sans font-normal block sm:inline sm:ml-1">
                                                    total for {bookingDays} nights
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button 
                                            onClick={() => confirmBooking(platform.id, platform.name, platform.url)}
                                            disabled={bookingLoading !== null}
                                            className={`
                                                w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                                                ${bookingLoading === platform.id 
                                                    ? 'bg-amber-100 text-amber-800 cursor-wait' 
                                                    : 'bg-amber-900 text-white hover:bg-amber-800 shadow-md hover:shadow-lg'
                                                }
                                                ${bookingLoading && bookingLoading !== platform.id ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            {bookingLoading === platform.id ? (
                                                <>
                                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-amber-800 border-t-transparent"></span>
                                                    {platform.id === 'rajvista' ? 'Booking...' : 'Redirecting...'}
                                                </>
                                            ) : (
                                                <>
                                                    {platform.id === 'rajvista' ? (
                                                        <>Book Now <ArrowRightCircle className="w-4 h-4" /></>
                                                    ) : (
                                                        <>View Deal <ExternalLink className="w-4 h-4" /></>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- SPA BOOKING MODAL --- */}
      {showSpaModal && (
        <div className="fixed inset-0 bg-[#2c1a1a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-[#fffbf0] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative border-2 border-amber-700">
                {!showSpaSuccess && <button onClick={() => setShowSpaModal(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-amber-100 text-amber-800"><X className="w-5 h-5" /></button>}
                
                {showSpaSuccess ? (
                     <div className="p-8 text-center flex flex-col items-center justify-center h-64">
                        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mb-4 border-2 border-purple-600"><Sparkles className="w-10 h-10" /></div>
                        <h3 className="text-2xl font-serif font-bold text-amber-900">Spa Session Booked</h3>
                        <p className="text-amber-800/80 mt-2 font-serif">Relaxation awaits you at {spaTime}.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-[#2c1a1a] text-amber-50 p-6 border-b border-amber-700">
                            <h3 className="text-xl font-serif font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Jiva Grande Spa</h3>
                        </div>
                        <div className="p-6 space-y-6">
                             <div>
                                <label className="block text-sm font-serif font-bold text-amber-900 mb-2 uppercase tracking-wide">Select Time</label>
                                <input type="time" value={spaTime} onChange={(e) => setSpaTime(e.target.value)} className="w-full border border-amber-200 rounded-lg px-4 py-3 text-lg font-bold text-center focus:ring-2 focus:ring-amber-600 outline-none bg-white text-amber-900"/>
                            </div>
                            <div>
                                <label className="block text-sm font-serif font-bold text-amber-900 mb-2 uppercase tracking-wide">Duration (Hours)</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSpaHours(Math.max(1, spaHours - 1))} className="p-3 bg-amber-100 rounded-lg hover:bg-amber-200"><Minus className="w-4 h-4 text-amber-900"/></button>
                                    <span className="flex-1 text-center font-bold text-2xl text-amber-900">{spaHours}</span>
                                    <button onClick={() => setSpaHours(spaHours + 1)} className="p-3 bg-amber-100 rounded-lg hover:bg-amber-200"><Plus className="w-4 h-4 text-amber-900"/></button>
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
                                <div className="flex justify-between text-sm text-amber-800"><span>Price per hour</span><span>₹{SPA_PRICE_PER_HOUR}</span></div>
                                <div className="border-t border-amber-200 pt-3 flex justify-between font-bold text-lg text-amber-950 font-serif"><span>Total Cost</span><span>₹{(spaHours * SPA_PRICE_PER_HOUR).toLocaleString()}</span></div>
                            </div>
                            <button onClick={confirmSpaBooking} className="w-full bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-900 hover:to-purple-950 text-white font-serif font-bold py-4 rounded-xl shadow-lg transition-all border border-purple-600">Confirm Appointment</button>
                        </div>
                    </>
                )}
             </div>
        </div>
      )}

      {/* --- FOOD ORDERING MODAL --- */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-[#2c1a1a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#fffbf0] rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden animate-fade-in relative border-2 border-amber-700 flex flex-col">
                {!showFoodSuccess && <button onClick={() => setShowFoodModal(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-amber-100 text-amber-800 z-10"><X className="w-5 h-5" /></button>}
                
                {showFoodSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-20 h-20 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center mb-6 border-2 border-orange-600"><Utensils className="w-10 h-10" /></div>
                        <h3 className="text-3xl font-serif font-bold text-amber-900">Order Sent to Kitchen</h3>
                        <p className="text-amber-800/80 mt-2 font-serif text-lg">Your royal feast will be served in your room shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-[#2c1a1a] text-amber-50 p-6 border-b border-amber-700 flex justify-between items-center">
                            <h3 className="text-xl font-serif font-bold flex items-center gap-2"><Utensils className="w-5 h-5 text-amber-500" /> In-Room Dining</h3>
                        </div>
                        
                        <div className="flex-1 flex overflow-hidden">
                            {/* Menu Section */}
                            <div className="flex-1 overflow-y-auto p-6 border-r border-amber-200">
                                {['Royal', 'Starter', 'Main', 'Beverage'].map((cat) => (
                                    <div key={cat} className="mb-8">
                                        <h4 className="font-serif font-bold text-lg text-amber-800 mb-4 border-b border-amber-200 pb-1 flex items-center gap-2">
                                            {cat === 'Royal' && <Crown className="w-4 h-4 text-amber-600" />}
                                            {cat === 'Starter' && <Utensils className="w-4 h-4 text-amber-600" />}
                                            {cat === 'Main' && <Soup className="w-4 h-4 text-amber-600" />}
                                            {cat === 'Beverage' && <Wine className="w-4 h-4 text-amber-600" />}
                                            {cat} Selection
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {FOOD_MENU.filter(i => i.category === cat).map(item => (
                                                <div key={item.id} className="bg-white p-4 rounded-xl border border-amber-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h5 className="font-serif font-bold text-amber-900">{item.name}</h5>
                                                            <span className="text-sm font-bold text-amber-700">₹{item.price}</span>
                                                        </div>
                                                        <p className="text-xs text-amber-600/70 mb-3 line-clamp-2">{item.description}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => addToCart(item)}
                                                        className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 transition-colors uppercase tracking-wider"
                                                    >
                                                        Add to Order
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Sidebar */}
                            <div className="w-80 bg-amber-50 p-6 flex flex-col border-l border-amber-200">
                                <h4 className="font-serif font-bold text-lg text-amber-900 mb-4">Your Platter</h4>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                    {cart.length === 0 ? (
                                        <p className="text-sm text-amber-800/50 italic text-center mt-10">Select items from the menu to build your feast.</p>
                                    ) : (
                                        cart.map(item => (
                                            <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-amber-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-amber-900 text-sm line-clamp-1">{item.name}</span>
                                                    <span className="text-xs font-bold text-amber-700">₹{item.price * item.qty}</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-amber-50 rounded-md p-1">
                                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-amber-200 rounded text-amber-800"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-xs font-bold text-amber-900 w-6 text-center">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-amber-200 rounded text-amber-800"><Plus className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-amber-200">
                                    <div className="flex justify-between text-lg font-serif font-bold text-amber-900 mb-4">
                                        <span>Total Bill</span>
                                        <span>₹{cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}</span>
                                    </div>
                                    <button 
                                        onClick={confirmFoodOrder}
                                        disabled={cart.length === 0}
                                        className="w-full bg-amber-800 hover:bg-amber-900 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}


      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        {/* Navigation Back */}
        <button 
            onClick={() => setSelectedHotel(null)} 
            className="text-amber-800 hover:text-amber-900 flex items-center gap-2 text-sm font-semibold transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Hotel Collection
        </button>

        <div className="bg-[#2c1a1a] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden border border-amber-900">
            {/* Background Image of Selected Hotel */}
            <div className="absolute inset-0 z-0 opacity-30">
                <img src={selectedHotel.image} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#2c1a1a] to-transparent"></div>
            </div>

            <h2 className="text-3xl font-serif font-bold mb-2 relative z-10 text-amber-100">{selectedHotel.name}</h2>
            <div className="flex gap-2 mb-4 relative z-10">
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    selectedHotel.category === 'Luxury' ? 'bg-purple-900/50 border-purple-500 text-purple-200' :
                    selectedHotel.category === 'Medium' ? 'bg-amber-700/50 border-amber-500 text-amber-200' :
                    'bg-green-800/50 border-green-500 text-green-200'
                }`}>
                    {selectedHotel.category === 'Normal' ? 'Pocket Friendly' : selectedHotel.category}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold border border-amber-500/50 bg-black/20 text-amber-200">
                    {selectedHotel.city}
                </span>
            </div>
            <p className="text-amber-200/80 relative z-10 mb-6 font-serif max-w-lg">{selectedHotel.description}</p>
            <div className="flex gap-4 relative z-10">
                <button onClick={() => setShowSpaModal(true)} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-serif font-medium transition-colors border border-amber-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Book Spa
                </button>
                <button onClick={() => setShowFoodModal(true)} className="bg-white/10 hover:bg-white/20 text-amber-100 px-6 py-2 rounded-lg font-serif font-medium transition-colors border border-amber-100/30 backdrop-blur-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4" /> Room Service
                </button>
            </div>
        </div>

        {/* Room Status Grid */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="font-serif font-bold text-xl text-amber-900 flex items-center gap-2">
                        <Grid className="w-5 h-5 text-amber-600" />
                        Available Rooms
                    </h3>
                    <p className="text-xs text-amber-700/70 mt-1 font-serif">Live availability for {selectedHotel.name}</p>
                </div>
                
                {/* Status Legend */}
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-green-700">
                        <span className="w-3 h-3 rounded-full bg-green-600 border border-green-700"></span> Available
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-700">
                        <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600"></span> Free &lt; 5h
                    </div>
                    <div className="flex items-center gap-1.5 text-red-800">
                        <span className="w-3 h-3 rounded-full bg-red-700 border border-red-800"></span> Occupied
                    </div>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                {(Object.keys(roomConfig) as RoomType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedCategory(type)}
                        className={`flex-1 flex flex-col items-center py-2 px-4 rounded-md transition-all text-sm font-medium ${
                            selectedCategory === type 
                            ? 'bg-white text-amber-900 shadow-sm ring-1 ring-amber-200' 
                            : 'text-amber-700/60 hover:bg-amber-100 hover:text-amber-900'
                        }`}
                    >
                        <span className="flex items-center gap-1 font-serif font-bold">
                            {roomConfig[type].label}
                        </span>
                        <span className="text-xs opacity-75 font-normal flex items-center mt-0.5">
                            <IndianRupee className="w-3 h-3" /> {roomConfig[type].price.toLocaleString()} / day
                        </span>
                    </button>
                ))}
            </div>
            
            {/* Scrollable Room Grid */}
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {displayedRooms.map((room) => (
                        <div 
                            key={room.number} 
                            onClick={() => handleRoomClick(room)}
                            className={`
                                ${getStatusColor(room.status)} 
                                p-2 rounded-md text-center shadow-sm transition-transform hover:scale-105 relative group h-20 flex flex-col justify-center items-center
                            `}
                        >
                            <div className="font-serif font-bold text-sm">{room.number}</div>
                            {/* Small Status Text inside box */}
                            <div className="text-[9px] mt-1 leading-tight opacity-90 font-medium font-serif uppercase tracking-tighter">
                                {getReviewText(room)}
                            </div>
                            
                            {/* Detailed Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-40 bg-[#2c1a1a] text-amber-50 text-xs rounded-lg p-3 z-10 pointer-events-none shadow-xl border border-amber-700">
                                <p className="font-serif font-bold text-amber-400 mb-1">{room.label}</p>
                                <p className="mb-1">Rate: ₹{room.price}/day</p>
                                <p className={`font-semibold ${
                                    room.status === 'AVAILABLE' ? 'text-green-400' : 
                                    room.status === 'CHECKOUT_SOON' ? 'text-yellow-400' : 'text-red-300'
                                }`}>
                                    {getReviewText(room)}
                                </p>
                                {room.status === 'AVAILABLE' && (
                                    <p className="mt-2 text-[10px] text-amber-200/50 italic">Click to compare prices</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 text-center text-xs text-amber-800/60 border-t border-amber-100 pt-2 font-serif italic">
                Select a green chamber to confirm your royal reservation.
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { icon: Wifi, label: 'Free Wi-Fi', sub: 'High Speed' },
                { icon: Coffee, label: 'Breakfast', sub: '6 AM - 10 AM' },
                { icon: Sparkles, label: 'Housekeeping', sub: 'Daily' },
                { icon: MapPin, label: 'Concierge', sub: '24/7' }
            ].map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm text-center hover:shadow-md transition-shadow">
                    <item.icon className="w-6 h-6 mx-auto mb-2 text-amber-700" />
                    <h4 className="font-serif font-semibold text-amber-900 text-sm">{item.label}</h4>
                    <p className="text-xs text-amber-600">{item.sub}</p>
                </div>
            ))}
        </div>
      </div>

      {/* AI Concierge Chat */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 h-[600px] flex flex-col overflow-hidden">
            <div className="bg-[#2c1a1a] p-4 flex items-center gap-3 border-b border-amber-900">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <h3 className="text-amber-100 font-serif font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    AI Concierge
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fffbf0]">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-serif ${
                            msg.role === 'user' 
                            ? 'bg-[#451a03] text-amber-50 rounded-tr-none' 
                            : 'bg-white border border-amber-200 text-amber-900 rounded-tl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loadingAi && (
                     <div className="flex justify-start">
                        <div className="bg-white border border-amber-200 text-amber-700 p-3 rounded-2xl rounded-tl-none shadow-sm text-xs italic font-serif">
                            Thinking...
                        </div>
                     </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-amber-100">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about pool hours, dining..."
                        className="flex-1 border border-amber-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-amber-50/50 text-amber-900"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={loadingAi}
                        className="bg-[#451a03] text-amber-50 p-2 rounded-lg hover:bg-[#5e2304] disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
