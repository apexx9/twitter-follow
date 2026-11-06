export const config = {
  databasePath: "./data/ghanaconnect.db",
  followers: { min: 100, max: 2000 },
  activity: { activeWithinDays: 7 },
  discoveryFocus: {
    Ghana: 45,
    Nigeria: 15,
    "African technology": 15,
    "Creative and lifestyle": 15,
    "Sports, music and wider interests": 10
  },
  locationPriority: {
    Ghana: 1,
    Nigeria: 2,
    "Other Africa": 3,
    International: 4,
    Unknown: 5
  },
  weights: {
    activity: 30,
    conversation: 30,
    engagement: 20,
    location: 15,
    profileCompleteness: 5
  }
};
