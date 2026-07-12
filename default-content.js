window.DEFAULT_PORTFOLIO_CONTENT = {
  version: 1,
  brand: {
    name: "阿光音樂製作",
    en: "A-KUANG MUSIC",
    mark: "A",
    email: "a26926291@gmail.com"
  },
  theme: {
    accent: "#8eab78",
    accent2: "#5f678f",
    warm: "#a97555",
    background: "#090d0c",
    worksColumns: 3,
    cardRadius: 24,
    mascotPosition: "right"
  },
  sections: [
    { id: "works", label: "精選作品", visible: true },
    { id: "services", label: "製作服務", visible: true },
    { id: "process", label: "合作流程", visible: true },
    { id: "beat-store", label: "Beat 商店", visible: true },
    { id: "about", label: "關於我", visible: true },
    { id: "contact", label: "聯絡合作", visible: true }
  ],
  hero: {
    eyebrow: "MIXING · ARRANGEMENT · RECORDING",
    titleBefore: "把你的聲音，做成",
    titleHighlight: "真正能被記住",
    titleAfter: "的作品。",
    description: "我是音樂製作人阿光，提供混音、編曲與桃園宅錄服務。錄音空間免費使用，只收實際製作費，讓創作者能用合理預算完成一首有質感的歌。",
    primaryText: "聽我的作品",
    primaryLink: "#works",
    secondaryText: "聊聊你的歌",
    secondaryLink: "#contact",
    chips: ["遠端合作", "免費宅錄", "長期合作優惠"],
    mascot: "assets/characters/mascot-wave.png"
  },
  stats: [
    { value: "1 對 1", label: "溝通製作方向" },
    { value: "0 元", label: "宅錄場地費" },
    { value: "遠端", label: "全台皆可合作" },
    { value: "長期", label: "合作方案優惠" }
  ],
  worksHeading: {
    eyebrow: "SELECTED WORKS",
    title: "精選作品",
    description: "放上原創、翻唱、混音前後對比與編曲 Demo，訪客可直接播放音檔、影片或前往作品連結。"
  },
  works: [
    {
      id: "work-1",
      title: "夜色訊號",
      subtitle: "編曲・混音",
      category: "ORIGINAL",
      genre: "POP / R&B",
      coverUrl: "",
      mediaType: "link",
      mediaUrl: "",
      externalUrl: "",
      published: true
    },
    {
      id: "work-2",
      title: "After Rain",
      subtitle: "人聲混音",
      category: "COVER",
      genre: "BALLAD",
      coverUrl: "",
      mediaType: "link",
      mediaUrl: "",
      externalUrl: "",
      published: true
    },
    {
      id: "work-3",
      title: "Neon Heart",
      subtitle: "Beat 製作",
      category: "BEAT",
      genre: "TRAP / POP",
      coverUrl: "",
      mediaType: "link",
      mediaUrl: "",
      externalUrl: "",
      published: true
    }
  ],
  servicesHeading: {
    eyebrow: "WHAT I DO",
    title: "製作服務",
    description: "先理解你想要的聲音，再依作品狀況安排適合的製作流程。"
  },
  services: [
    { id: "service-1", code: "MIX", title: "人聲混音", description: "修音、節奏整理、音色塑形、空間設計與母帶處理，讓人聲更穩、更清楚，也更貼合伴奏。", priceLabel: "參考價格", price: "NT$2,500–3,500", featured: false },
    { id: "service-2", code: "ARR", title: "編曲製作", description: "從 Demo、和弦或旋律開始，完成歌曲架構、配器、節奏與氛圍，打造專屬於你的版本。", priceLabel: "視難度報價", price: "NT$5,000–10,000", featured: true },
    { id: "service-3", code: "REC", title: "桃園免費宅錄", description: "提供錄音空間與基本錄音協助，不收場地與錄音費。可分天錄製，降低一次錄完的壓力。", priceLabel: "錄音空間", price: "免費", featured: false }
  ],
  processHeading: {
    eyebrow: "WORKFLOW",
    title: "合作流程",
    description: "遠端或現場都可以，流程會依作品狀況彈性調整。"
  },
  process: [
    { id: "step-1", title: "先聊作品", description: "提供 Demo、參考歌與想要的方向，我會先確認需求與可行性。" },
    { id: "step-2", title: "確認報價", description: "依歌曲長度、軌數與製作難度報價，不用擔心隱藏費用。" },
    { id: "step-3", title: "製作與修改", description: "分階段確認方向，避免做到最後才發現彼此想像不同。" },
    { id: "step-4", title: "完成交付", description: "提供正式音檔；有需要也可討論演出版、伴奏版或社群短版。" }
  ],
  beatHeading: {
    eyebrow: "BEAT CATALOG",
    title: "Beat 伴奏商店",
    description: "先提供試聽與詢問，之後可以再串接金流、授權方案與付款後下載。",
    buttonText: "詢問 Beat",
    buttonLink: "#contact"
  },
  beats: [
    { id: "beat-1", title: "Moonline", genre: "R&B / Chill", filter: "rnb", bpm: "92 BPM", key: "F# Minor", coverUrl: "", mediaType: "audio", mediaUrl: "", price: "即將開放", published: true },
    { id: "beat-2", title: "City Bloom", genre: "Pop / Bright", filter: "pop", bpm: "118 BPM", key: "A Major", coverUrl: "", mediaType: "audio", mediaUrl: "", price: "即將開放", published: true },
    { id: "beat-3", title: "Zero Gravity", genre: "Trap / Dark", filter: "trap", bpm: "140 BPM", key: "D Minor", coverUrl: "", mediaType: "audio", mediaUrl: "", price: "即將開放", published: true }
  ],
  about: {
    eyebrow: "ABOUT",
    title: "不是只把聲音修漂亮，而是把你的特色留下來。",
    description: "我是阿光，主要協助歌手、VTuber、翻唱創作者與獨立音樂人完成混音、編曲和錄音。我希望合作過程是可以放心溝通的，不需要懂太多專業術語，也不必一次就把所有東西準備到完美。",
    tags: ["歌手", "VTuber", "翻唱創作者", "獨立音樂人"],
    mascot: "assets/characters/mascot-seated.png"
  },
  contact: {
    eyebrow: "LET'S CREATE",
    title: "有一首歌想完成？先傳 Demo 給我聽。",
    description: "不確定該做混音還是重編也沒關係，可以先說你的預算、期限與參考歌曲。",
    email: "a26926291@gmail.com",
    instagramLabel: "@請替換你的帳號",
    instagramUrl: "",
    lineLabel: "請替換你的聯絡連結",
    lineUrl: "",
    formButton: "產生詢問信件"
  }
};
