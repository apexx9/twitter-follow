const query = (value) => `https://x.com/search?q=${encodeURIComponent(value)}&src=typed_query&f=live`;

export const segments = {
  ghana_conversations: { label: "Ghana — everyday conversations" },
  ghana_creative: { label: "Ghana — creative and lifestyle interests" },
  ghana_sports_music: { label: "Ghana — sports, music and entertainment" },
  ghana_students_builders: { label: "Ghana — students, builders and professionals" },
  nigeria_communities: { label: "Nigeria — conversations and shared interests" },
  african_technology: { label: "Africa — technology, engineering and robotics" },
  wider_interests: { label: "Wider interests — books, running, film and culture" }
};

// Themes are based on the bios in the user's supplied following-list sample.
// Search results are suggestions to review, not verified matches or identity classifications.
const searches = {
  ghana_conversations: [
    ["Everyday thoughts and opinions", '(Ghana OR Ghanaian OR Accra) (thoughts OR "random thoughts" OR relatable OR opinions) -filter:retweets'],
    ["People having conversations", '(Ghana OR Ghanaian OR Accra) filter:replies -filter:retweets']
  ],
  ghana_creative: [
    ["Artists, writers and designers", '(Ghana OR Ghanaian OR Accra) (artist OR writer OR writing OR designer OR "graphic designer") -filter:retweets'],
    ["Fashion, books and lifestyle", '(Ghana OR Accra) (fashion OR sewist OR books OR lifestyle OR photography) -filter:retweets']
  ],
  ghana_sports_music: [
    ["Football conversations", '(Ghana OR Ghanaian OR Accra) (football OR Chelsea OR "Manchester United" OR "Real Madrid" OR Barcelona) -filter:retweets'],
    ["Music and entertainment", '(Ghana OR Ghanaian OR Accra) (music OR musician OR Afrobeats OR entertainment) -filter:retweets']
  ],
  ghana_students_builders: [
    ["Students and learning", '(Ghana OR Ghanaian OR Accra) (student OR university OR learning OR education OR research) -filter:retweets'],
    ["Builders and professionals", '(Ghana OR Accra) (developer OR software OR startup OR "product manager" OR engineering) -filter:retweets']
  ],
  nigeria_communities: [
    ["Everyday conversations", '(Nigeria OR Nigerian OR Lagos OR Abuja) (thoughts OR relatable OR opinions OR lifestyle) -filter:retweets'],
    ["Creative and student communities", '(Nigeria OR Nigerian OR Lagos) (artist OR writing OR fashion OR books OR student OR developer) -filter:retweets']
  ],
  african_technology: [
    ["African software and startup builders", '(Africa OR African OR Ghana OR Nigeria) (developer OR software OR startup OR programming) -filter:retweets'],
    ["Robotics and engineering", '(Africa OR African) (robotics OR engineering OR embedded OR electronics OR hardware) -filter:retweets']
  ],
  wider_interests: [
    ["Books, film and culture", '(books OR reading OR film OR photography OR culture) (thoughts OR opinions OR conversation) -filter:retweets'],
    ["Running and everyday interests", '(running OR fitness OR music OR travel) (community OR thoughts OR conversation) -filter:retweets']
  ]
};

export function getSearches(segment) {
  return (searches[segment] || []).map(([label, terms]) => ({
    label,
    url: query(terms)
  }));
}
