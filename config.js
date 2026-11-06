export const config = {
  databasePath: "./data/ghanaconnect.db",
  followers: {
    min: 100,
    max: 2000
  },
  activity: {
    activeWithinDays: 7
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
