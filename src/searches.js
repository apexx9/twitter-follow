const query = (value) => `https://x.com/search?q=${encodeURIComponent(value)}&src=typed_query&f=live`;

export const segments = {
  ghanaian_women: { label: "Ghanaian women & Ghana-based conversations" },
  nigerian_women: { label: "Nigerian communities & conversations" },
  international_women: { label: "International lifestyle & community conversations" },
  ghanaian_men: { label: "Ghanaian men & local conversations" },
  tech: { label: "Ghanaian and African technology communities" },
  other: { label: "Wider African and international conversations" }
};

// Initial interest signals derived from the user's supplied following-list sample.
// These are discovery themes, not assumptions about any account's identity.
const searches = {
  ghanaian_women: [
    ["Ghanaian everyday conversations", '(Ghana OR Ghanaian OR Accra) (thoughts OR "random thoughts" OR "just saying" OR relatable)'],
    ["Ghana lifestyle and creativity", '(Ghana OR Accra) (fashion OR sewist OR artist OR books OR music OR lifestyle)'],
    ["Ghana conversations in replies", '(Ghana OR Ghanaian OR Accra) filter:replies']
  ],
  nigerian_women: [
    ["Nigerian everyday conversations", '(Nigeria OR Nigerian OR Lagos OR Abuja) (thoughts OR lifestyle OR culture OR relatable)'],
    ["Nigerian creative communities", '(Nigeria OR Nigerian OR Lagos) (artist OR writing OR fashion OR books OR music)'],
    ["Nigerian conversations in replies", '(Nigeria OR Nigerian OR Lagos) filter:replies']
  ],
  international_women: [
    ["Lifestyle and personal interests", '(books OR music OR travel OR fashion OR art OR lifestyle) (thoughts OR opinions OR community)'],
    ["Creative voices", '(artist OR writer OR sewist OR designer OR photography) (thoughts OR work OR community)']
  ],
  ghanaian_men: [
    ["Ghanaian social conversations", '(Ghana OR Ghanaian OR Accra) (football OR music OR culture OR thoughts OR relatable)'],
    ["Ghana sports and music", '(Ghana OR Accra) (Chelsea OR "Man United" OR "Real Madrid" OR football OR music)'],
    ["Ghana conversations in replies", '(Ghana OR Ghanaian OR Accra) filter:replies']
  ],
  tech: [
    ["Ghana builders and technology", '(Ghana OR Accra) (developer OR software OR startup OR product OR engineering)'],
    ["African tech and robotics", '(Africa OR African) (developer OR robotics OR engineering OR programming OR product)']
  ],
  other: [
    ["African culture and conversations", '(Africa OR African) (culture OR music OR books OR lifestyle OR thoughts)'],
    ["Shared interests and communities", '(books OR music OR film OR running OR photography OR football) (opinions OR community OR conversation)']
  ]
};

export function getSearches(segment) {
  return (searches[segment] || []).map(([label, terms]) => ({
    label,
    url: query(terms)
  }));
}
