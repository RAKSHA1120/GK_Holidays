const tourPackages = [
  {
    id: "oneday-kanthaloor",
    title: "One Day Kanthaloor",
    region: "oneday",
    type: "Nature & Adventure",
    destination: "Kanthaloor",
    days: "1 Day",
    price: 2500,
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80",
    summary: "Experience the cool hills, fresh strawberry farms, and misty valleys of Kanthaloor in one day.",
    highlights: ["Misty Valley Views", "Thrilling Jeep Safari", "Strawberry Farm Visit", "Cozy Evening Campfire"],
    itinerary: [
      "08:00 AM - Arrival in Kanthaloor & warm welcome with morning refreshments.",
      "09:30 AM - Departure for a guided sightseeing tour, visiting local fruit orchards, garlic farms, and strawberry fields.",
      "01:30 PM - Lunch at a local scenic spot.",
      "03:00 PM - Embark on a thrilling off-road Jeep Safari to the deep forest viewpoints and lemon grass hills.",
      "06:30 PM - Relax around a cozy evening campfire with light music.",
      "08:30 PM - Delicious dinner and late evening departure."
    ],
    inclusions: [
      "Comfortable Transportation",
      "Welcome Refreshments & Breakfast",
      "Traditional Veg/Non-Veg Lunch & Dinner",
      "Off-road Jeep Safari charges",
      "Campfire permissions & arrangement",
      "All entry fees and guide coordination"
    ],
    exclusions: [
      "Personal expenses (shopping, additional snacks, etc.)",
      "Anything not mentioned in the inclusions list"
    ]
  },
  {
    id: "oneday-munnar",
    title: "One Day Munnar",
    region: "oneday",
    type: "Hill Station Escape",
    destination: "Munnar",
    days: "1 Day",
    price: 2300,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    summary: "Discover the lush green tea gardens, misty viewpoints, and cascading waterfalls of beautiful Munnar.",
    highlights: ["Tea Museum & Estates Visit", "Mattupetty Dam & Eco Point", "Misty Mountain Jeep Safari", "Evening Campfire"],
    itinerary: [
      "07:30 AM - Morning arrival in Munnar, check-in for refreshment.",
      "09:00 AM - Visit the breathtaking tea estates, photo stops, and the Munnar Tea Museum.",
      "11:30 AM - Head to Mattupetty Dam, Kundala Lake, and Echo Point for spectacular views.",
      "01:30 PM - Special South Indian lunch at a hillside restaurant.",
      "03:00 PM - Afternoon Jeep safari through rugged mountain tracks.",
      "06:30 PM - Campfire session with music to beat the chilly evening air.",
      "08:00 PM - Dinner and return journey departure."
    ],
    inclusions: [
      "Comfortable Transportation",
      "Morning Refreshment & Breakfast",
      "Delicious Lunch & Dinner",
      "Mountain Jeep Safari",
      "Campfire with Music",
      "Parking, Tolls, and Driver allowances"
    ],
    exclusions: [
      "Boating charges at Mattupetty/Kundala",
      "Personal shopping and camera entry fees"
    ]
  },
  {
    id: "oneday-kochi",
    title: "One Day Kochi",
    region: "oneday",
    type: "Heritage & Fun",
    destination: "Kochi",
    days: "1 Day",
    price: 2500,
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80",
    summary: "Explore the historic port city of Kochi, from ancient Fort Kochi to a lively DJ boat cruise.",
    highlights: ["Historic Fort Kochi & Chinese Fishing Nets", "Lulu Mall Shopping Session", "High-Energy DJ Boat Cruise", "Traditional Kerala Meals"],
    itinerary: [
      "08:00 AM - Arrival in Kochi and morning breakfast.",
      "09:30 AM - Walk through Fort Kochi, St. Francis Church, Santa Cruz Basilica, and Chinese Fishing Nets.",
      "12:00 PM - Head to Marine Drive for a memorable boat cruise.",
      "01:30 PM - Lunch at a local scenic spot.",
      "03:00 PM - Dynamic DJ Boat cruise in the backwaters with music and dance.",
      "05:30 PM - Shopping time at the famous Lulu Mall or local markets.",
      "08:30 PM - Dinner and departure."
    ],
    inclusions: [
      "Comfortable Transportation",
      "Morning Breakfast & Welcome Drinks",
      "Tasty Lunch & Dinner",
      "DJ Boat Cruise ticket (Private/Semi-private boat)",
      "Fort Kochi local guide charges",
      "All tolls and parking fees"
    ],
    exclusions: [
      "Lulu Mall rides/game zone tickets",
      "Additional snacks and personal spending"
    ]
  },
  {
    id: "oneday-alleppey",
    title: "One Day Alleppey",
    region: "oneday",
    type: "Backwater Cruise",
    destination: "Alleppey",
    days: "1 Day",
    price: 2900,
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
    summary: "Relax on the iconic backwaters of Alleppey with a private houseboat or large shikara cruise.",
    highlights: ["3-Hour Scenic Backwater Cruise", "Traditional Houseboat Experience", "Authentic Toddy Shop Lunch", "Sunset Viewpoint"],
    itinerary: [
      "08:30 AM - Arrive in Alleppey, welcome drinks, and breakfast.",
      "10:00 AM - Board the houseboat/shikara for a scenic backwater cruise.",
      "01:30 PM - Enjoy a delicious Kerala lunch onboard with fresh pearl spot fish.",
      "03:30 PM - Continue cruise through narrow canals, observing village life.",
      "05:00 PM - Evening tea with local snacks (Banana fritters).",
      "06:00 PM - Sunset walk along Alleppey Beach.",
      "08:00 PM - Dinner and return departure."
    ],
    inclusions: [
      "Comfortable Transportation",
      "Refreshments & Breakfast",
      "Houseboat Lunch & Evening Tea/Snacks",
      "3-Hour Houseboat/Shikara Cruise fee",
      "Entry permits & local boat operator charges",
      "Dinner before return journey"
    ],
    exclusions: [
      "Special seafood additions ordered separately",
      "Personal boating/kayaking activities"
    ]
  },
  {
    id: "oneday-varkala",
    title: "One Day Varkala",
    region: "oneday",
    type: "Beach & Adventure",
    destination: "Varkala",
    days: "1 Day",
    price: 3100,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    summary: "Escape to the beautiful red cliff beaches of Varkala, featuring a fun kayaking session.",
    highlights: ["Unique Red Cliffs & Black Sand Beach", "Mangrove Kayaking Session", "Varkala Helipad & Cafes Visit", "Sunset at Papanasam Beach"],
    itinerary: [
      "07:30 AM - Arrive in Varkala and have breakfast near the cliff.",
      "09:00 AM - Proceed to the nearby lake/mangroves for a guided Kayaking session (approx 2 hours).",
      "12:30 PM - Relax at Varkala Beach or explore the ancient Janardhana Swami Temple.",
      "01:30 PM - Lunch at a premium Cliffside multi-cuisine cafe.",
      "03:30 PM - Walk along the Varkala Helipad, shop for local handicrafts.",
      "05:30 PM - Breathtaking sunset views from the cliff edge.",
      "07:30 PM - Buffet dinner and return drive."
    ],
    inclusions: [
      "Comfortable Transportation",
      "Breakfast, Lunch, and Dinner",
      "Kayaking Equipment and Guided Session",
      "Safety jackets and instructions",
      "Tour operator support"
    ],
    exclusions: [
      "Cafe drinks/beverages outside meals",
      "Temple offerings or special rituals"
    ]
  },
  {
    id: "oneday-vagamon",
    title: "One Day Vagamon",
    region: "oneday",
    type: "Hill & Meadows",
    destination: "Vagamon",
    days: "1 Day",
    price: 2700,
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
    summary: "Walk through pine forests, misty meadows, and enjoy a Jeep safari in Vagamon.",
    highlights: ["Vagamon Pine Forest Walk", "Green Meadows & Kurisumala", "Off-road Jeep Safari", "Evening Campfire & Music"],
    itinerary: [
      "08:00 AM - Arrival in Vagamon, morning refreshment & breakfast.",
      "09:30 AM - Wander through the enchanting Pine Forest and Vagamon Lake.",
      "11:30 AM - Climb the beautiful, rolling Green Meadows for amazing panoramic views.",
      "01:30 PM - Buffet lunch with local spices.",
      "03:00 PM - Off-road Jeep Safari to the suicidal viewpoint & pine valley.",
      "06:30 PM - Energetic campfire with music under the misty sky.",
      "08:30 PM - Hot dinner and late-night departure."
    ],
    inclusions: [
      "Comfortable Transportation",
      "Breakfast, Lunch, and Dinner",
      "Off-road Jeep Safari",
      "Campfire with Music setup",
      "All entry tickets (Meadows, Pine Forest, etc.)"
    ],
    exclusions: [
      "Adventure sports like Paragliding (subject to availability)",
      "Personal expenses"
    ]
  },
  {
    id: "twodays-kanthaloor-munnar",
    title: "Kanthaloor & Munnar",
    region: "twodays",
    type: "Nature & Tea Hills",
    destination: "Kanthaloor & Munnar",
    days: "2 Days",
    price: 3900,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    summary: "An expansive two-day journey through the tea capital Munnar and the fruit valley Kanthaloor.",
    highlights: ["2 Days Off-road Jeep Safari", "Strawberry & Garlic Farms", "Tea Estates & Dam Visit", "Premium Night Stay & Campfire"],
    itinerary: [
      "Day 1: Arrive in Kanthaloor. Check-in, refresh, and explore the orchards (strawberries, apples, plums). Afternoon 4x4 Jeep safari through lemongrass hills. Dinner and overnight stay with a cozy campfire.",
      "Day 2: Morning breakfast, checkout. Drive to Munnar. Visit Mattupetty Dam, Eco Point, and tea gardens. Afternoon sightseeing, shopping for tea & spices. Evening departure back home."
    ],
    inclusions: [
      "Comfortable Transportation",
      "1 Night Accommodation (Deluxe Room/Cottage on sharing basis)",
      "All Meals (2 Breakfasts, 2 Lunches, 2 Dinners)",
      "2 Days of off-road Jeep Safari activities",
      "Evening Campfire with music",
      "All entry permits, parking, tolls"
    ],
    exclusions: [
      "Boating tickets or optional horse riding",
      "Personal purchases and laundry"
    ]
  },
  {
    id: "twodays-munnar-kochi",
    title: "2 Days Munnar & Kochi",
    region: "twodays",
    type: "Hills & Coast Combo",
    destination: "Munnar & Kochi",
    days: "2 Days",
    price: 3800,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    summary: "Get the best of both worlds: the misty tea mountains of Munnar and the coastal port history of Kochi.",
    highlights: ["Munnar Viewpoints & Tea Gardens", "Night Stay in Munnar Hills", "Fort Kochi Sightseeing", "High-Energy Marine Drive DJ Boat"],
    itinerary: [
      "Day 1: Arrive in Munnar. Sightseeing including Photo Point, Tea Gardens, and Mattupetty Dam. Jeep Safari in the hills. Deluxe stay with campfire session. Dinner included.",
      "Day 2: Breakfast, checkout. Drive down to Kochi. Explore Fort Kochi heritage, Chinese nets, and St. Francis Church. Afternoon marine drive boat cruise with DJ music. Evening shopping at Lulu Mall, followed by dinner and return journey."
    ],
    inclusions: [
      "Comfortable Transportation",
      "1 Deluxe Night Stay in Munnar",
      "Meals: 2 Breakfasts, 2 Lunches, 2 Dinners",
      "Munnar Jeep Safari",
      "Kochi DJ Boat cruise ticket",
      "Campfire session",
      "All driver charges and entry permissions"
    ],
    exclusions: [
      "Lunch on Day 2 inside Lulu Mall (flexible choices)",
      "Any personal water activities"
    ]
  },
  {
    id: "twodays-vagamon-kochi",
    title: "Two Days Vagamon & Kochi",
    region: "twodays",
    type: "Meadows & Harbour",
    destination: "Vagamon & Kochi",
    days: "2 Days",
    price: 3800,
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80",
    summary: "Enjoy the rolling hills and pine forests of Vagamon and the commercial harbor charm of Kochi.",
    highlights: ["Vagamon Pine Forests & Meadows", "Thrilling Mountain Jeep Safari", "Comfortable Night Stay", "Kochi Chinese Nets & DJ Boat Cruise"],
    itinerary: [
      "Day 1: Reach Vagamon. Tour the Pine Forests, Vagamon Lake, and Meadows. Thrilling evening jeep safari. Overnight stay at a hillside cottage with campfire. Dinner included.",
      "Day 2: Breakfast, check out. Drive to Kochi. Visit Fort Kochi heritage zones and Chinese fishing nets. Board the popular DJ Boat Cruise at Marine Drive. Shopping at Lulu Mall, dinner, and return departure."
    ],
    inclusions: [
      "Comfortable Transportation",
      "1 Night Hotel Stay in Vagamon",
      "Foods (2 Breakfasts, 2 Lunches, 2 Dinners)",
      "Vagamon Jeep Safari & entry fees",
      "Campfire with music",
      "Kochi DJ Boat cruise ticket"
    ],
    exclusions: [
      "Shopping expenses",
      "Optional adventure sports at Vagamon Meadows"
    ]
  },
  {
    id: "twodays-alleppey-kochi",
    title: "Two Day Alleppey & Kochi",
    region: "twodays",
    type: "Waterways & Heritage",
    destination: "Alleppey & Kochi",
    days: "2 Days",
    price: 3900,
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
    summary: "Experience the ultimate Kerala waterways, featuring a backwater cruise in Alleppey and a harbor party in Kochi.",
    highlights: ["Alleppey Houseboat / Shikara Cruise", "Scenic Backwaters & Toddy Lunch", "Kochi Fort Kochi Walk & Lulu Mall", "DJ Boat Cruise on Marine Drive"],
    itinerary: [
      "Day 1: Arrive in Alleppey. Board the traditional houseboat/shikara for a 3-hour cruise through palm-fringed canals. Evening walk on Alleppey beach. Check-in to accommodation, dinner, and rest.",
      "Day 2: Breakfast, checkout. Travel to Kochi. Sightseeing around Fort Kochi & Jew Town. Afternoon Marine Drive DJ boat cruise. Shopping time at Lulu Mall. Dinner and night departure."
    ],
    inclusions: [
      "Comfortable Transportation",
      "1 Night Stay in Alleppey (Hotel/Resort)",
      "Meals: 2 Breakfasts, 2 Lunches, 2 Dinners",
      "3-Hour Alleppey Backwater Boating ticket",
      "Kochi DJ Boat ticket",
      "All entry fees and driver allowances"
    ],
    exclusions: [
      "Houseboat overnight stay upgrades (available on request)",
      "Personal shopping and guides"
    ]
  },
  {
    id: "twodays-vagamon-varkala",
    title: "Two Days Vagamon & Varkala",
    region: "twodays",
    type: "Cliffs & Meadows",
    destination: "Vagamon & Varkala",
    days: "2 Days",
    price: 4200,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    summary: "A unique combination of misty green pine meadows in Vagamon and red cliff beach kayaking in Varkala.",
    highlights: ["Meadows & Pine Valley Jeep Safari", "Misty Campfire Session", "Varkala Cliff Beach Exploration", "Mangrove Kayaking Adventure"],
    itinerary: [
      "Day 1: Arrive in Vagamon. Guided tour of the Meadows and Pine Forest. Afternoon off-road Jeep Safari. Evening check-in at hotel, campfire with light music, and dinner.",
      "Day 2: Early breakfast, checkout. Drive to Varkala. Walk along the scenic Varkala Cliff and beach. Head to the mangroves for a 2-hour guided Kayaking experience. Evening sunset views, dinner, and return journey."
    ],
    inclusions: [
      "Comfortable Transportation",
      "1 Night Stay in Vagamon",
      "Meals: 2 Breakfasts, 2 Lunches, 2 Dinners",
      "Jeep Safari in Vagamon",
      "Kayaking session with instructors & safety gear in Varkala",
      "Campfire permissions & music"
    ],
    exclusions: [
      "Water sports or activities not listed above",
      "Personal expenses and snacks"
    ]
  },
  {
    id: "twodays-kochi-wonderla",
    title: "Two Days Kochi & Wonderla",
    region: "twodays",
    type: "Amusement & City Tour",
    destination: "Kochi & Wonderla",
    days: "2 Days",
    price: 4500,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    summary: "Combine a historic city tour of Kochi, including a DJ boat, with a full day of thrilling rides at Wonderla Theme Park.",
    highlights: ["Fort Kochi & Chinese Nets Walk", "Marine Drive DJ Boat Cruise", "Premium Stay in Kochi", "Full-Day Wonderla Amusement Park Ticket"],
    itinerary: [
      "Day 1: Reach Kochi. Standard check-in. Sightseeing Fort Kochi heritage, Dutch palace, and St. Francis Church. Afternoon DJ Boat cruise. Evening shopping at Lulu Mall and delicious dinner.",
      "Day 2: Breakfast, checkout. Proceed to Wonderla Theme Park. Spend the entire day enjoying high-thrill land and water rides (lunch coupon included). Evening departure back home."
    ],
    inclusions: [
      "Comfortable Transportation",
      "1 Night Hotel Stay in Kochi",
      "All standard meals (2 Breakfasts, 2 Lunches, 2 Dinners)",
      "Kochi DJ Boat cruise ticket",
      "Full day entry ticket to Wonderla Amusement Park",
      "Tolls, parking, and driver allowances"
    ],
    exclusions: [
      "Locker rentals inside Wonderla",
      "Fastrack tickets (skip queue) upgrades"
    ]
  }
];
