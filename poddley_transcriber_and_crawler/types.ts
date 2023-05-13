export interface Feed {
  items: Item[]
  feedUrl: string
  image: Image
  paginationLinks: PaginationLinks
  creator: string
  title: string
  description: string
  author: string
  generator: string
  link: string
  language: string
  copyright: string
  lastBuildDate: string
  itunes: Itunes2
}

export interface Item {
  creator: string
  title: string
  link: string
  pubDate: string
  enclosure: Enclosure
  "dc:creator": string
  content: string
  contentSnippet: string
  guid: string
  isoDate: string
  itunes: Itunes
}

export interface Enclosure {
  url: string
  length: string
  type: string
}

export interface Itunes {
  summary: string
  explicit: string
  duration: string
  image: string
  episodeType: string
}

export interface Image {
  link: string
  url: string
  title: string
}

export interface PaginationLinks {
  self: string
}

export interface Itunes2 {
  owner: Owner
  image: string
  categories: string[]
  categoriesWithSubs: CategoriesWithSub[]
  author: string
  summary: string
  explicit: string
}

export interface Owner {
  name: string
  email: string
}

export interface CategoriesWithSub {
  name: string
  subs: Sub[]
}

export interface Sub {
  name: string
}
