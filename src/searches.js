const query = (value) => `https://x.com/search?q=${encodeURIComponent(value)}&src=typed_query&f=live`;

export const segments = {
  ghanaian_women: { label: "Ghanaian women & Ghana-based conversations" },
  nigerian_women: { label: "Nigerian communities & conversations" },
  international_women: { label: "International lifestyle & community conversations" },
  ghanaian_men: { label: "Ghanaian men & local conversations" },
  tech: { label: "Ghanaian and African technology communities" },
  other: { label: "Wider African and international conversations" }
};

const searches = {
  ghanaian_women: [
    ["Ghana conversations", '(Ghana OR Ghanaian OR Accra) (conversation OR thoughts OR life) -filter:replies'],
    ["Ghana lifestyle", '(Ghana OR Accra) (lifestyle OR fashion OR music OR culture)'],
    ["Accra community", '"Accra" (community OR meetup OR events OR friends)']
  ],
  nigerian_women: [
    ["Nigeria conversations", '(Nigeria OR Nigerian OR Lagos) (conversation OR lifestyle OR culture)'],
    ["Nigerian community", '(Lagos OR Abuja OR Port Harcourt) (community OR everyday OR thoughts)']
  ],
  international_women: [
    ["International lifestyle", '(lifestyle OR books OR music OR travel) (conversation OR thoughts)'],
    ["Creative communities", '(creative OR writing OR art OR culture) (community OR conversations)']
  ],
  ghanaian_men: [
    ["Ghana conversations", '(Ghana OR Ghanaian OR Accra) (football OR music OR culture OR everyday)'],
    ["Accra interests", '"Accra" (sports OR music OR business OR community)']
  ],
  tech: [
    ["Ghana tech", '(Ghana OR Accra) (software OR developer OR technology OR startup)'],
    ["African tech", '(Africa OR African) (developer OR robotics OR engineering OR programming)']
  ],
  other: [
    ["African conversations", '(Africa OR African) (culture OR music OR community OR lifestyle)'],
    ["Global interests", '(books OR music OR film OR running OR photography) (community OR conversation)']
  ]
};

export function getSearches(segment) {
  return (searches[segment] || []).map(([label, terms]) => ({
    label,
    url: query(`${terms} lang:en`)
  }));
}
