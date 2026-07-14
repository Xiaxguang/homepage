window.DEFAULT_CONTENT = {
  appearance: {
    accentColor: "#72f2aa",
    accentCyan: "#58d9e8",
    accentViolet: "#8d6cff",
    heroBackgroundUrl: "assets/media/studio-hero.webp",
    heroCharacter: "assets/characters/mascot-seated.png",
    aboutCharacter: "assets/characters/mascot-crossed.png"
  },
  sections: [
    { id: "hero", visible: true, order: 1 },
    { id: "dashboard", visible: true, order: 2 },
    { id: "works", visible: true, order: 3 },
    { id: "comparison", visible: true, order: 4 },
    { id: "services", visible: true, order: 5 },
    { id: "commerce", visible: true, order: 6 },
    { id: "beats", visible: true, order: 7 },
    { id: "about", visible: true, order: 8 },
    { id: "contact", visible: true, order: 9 }
  ],
  profile: {
    name: "XIAXGUANG",
    alias: "阿光",
    role: "MUSIC PRODUCER",
    tagline: "聲音設計・音樂製作",
    heroKicker: "你好，我是 XIAXGUANG",
    heroLine: "混音 / 編曲 / 錄音",
    heroDescription: "用聲音打造情緒，用音樂傳遞故事。專業、用心、有效率，讓你的作品更上一層樓。",
    location: "Taiwan, Taoyuan",
    email: "a26926291@gmail.com",
    phone: "0956737181",
    aboutTitle: "我是 XIAXGUANG，也叫阿光。",
    aboutBody: "音樂製作人、聲音設計師。從混音、編曲到人聲錄音，專注於把作品品質與情緒表達推進到更完整的位置。合作過多位歌手、YouTuber 與創作者，期待與你一起創造更多可能。",
    instagram: "xiaxguang",
    lineId: "bikabikahikari",
    discord: "Xiaxguang",
    discordUrl: "https://discord.com/users/577455290841038850",
    youtube: "",
    heroCharacter: "assets/characters/mascot-seated.png",
    aboutCharacter: "assets/characters/mascot-crossed.png"
  },
  services: [
    {
      id: "lyrics",
      title: "作詞",
      priceLabel: "NT$ 6,000",
      description: "依照主題、情緒與演唱語感打造歌詞。"
    },
    {
      id: "composition",
      title: "作曲",
      priceLabel: "NT$ 8,000",
      description: "完成旋律與歌曲主體，建立清楚的音樂輪廓。"
    },
    {
      id: "arrangement",
      title: "編曲",
      priceLabel: "NT$ 15,000",
      description: "從節奏、和聲到音色設計，完整鋪陳歌曲氛圍。"
    },
    {
      id: "mixing",
      title: "混音",
      priceLabel: "NT$ 4,500",
      description: "處理人聲、樂器平衡、空間與動態，讓作品更完整。"
    },
    {
      id: "mastering",
      title: "母帶",
      priceLabel: "NT$ 3,000",
      description: "整理整體響度、頻率與播放一致性，適合正式發布。"
    },
    {
      id: "cover-short",
      title: "Cover 短版",
      priceLabel: "NT$ 4,000",
      description: "90 秒內 Cover 製作，委託方需確認公開或商業使用授權。"
    },
    {
      id: "cover-full",
      title: "Cover 全曲",
      priceLabel: "NT$ 6,000",
      description: "完整 Cover 製作，依歌曲需求調整編制與質感；公開發行需另行確認授權。"
    },
    {
      id: "original-package",
      title: "原創歌曲全包",
      priceLabel: "NT$ 25,000",
      description: "包含作詞、作曲、編曲、混音、母帶；依需求彈性調整方案，專屬打造你的音樂作品。",
      featured: true
    }
  ],
  categories: ["全部", "原創", "翻唱", "混音", "編曲"],
  works: [
    {
      id: "original-01",
      title: "背景 - XIAXGUANG",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/Original/1.mp3",
      coverUrl: "assets/image/1.webp",
      tags: ["原創", "作曲", "製作"],
      visible: true
    },
    {
      id: "original-02",
      title: "別裝沒看到 - XIAXGUANG",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/Original/2.mp3",
      coverUrl: "assets/image/2.webp",
      tags: ["原創", "編曲", "製作"],
      visible: true
    },
    {
      id: "original-03",
      title: "我要你管我 - XIAXGUANG",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/Original/3.mp3",
      coverUrl: "assets/image/3.webp",
      tags: ["原創", "音樂製作"],
      visible: true
    },
    {
      id: "original-04",
      title: "弄丟女朋友 - XIAXGUANG",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/Original/4.mp3",
      coverUrl: "assets/image/4.webp",
      tags: ["原創", "作曲"],
      visible: true
    },
    {
      id: "original-05",
      title: "離開我 - XIAXGUANG",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/Original/5.mp3",
      coverUrl: "assets/image/5.webp",
      tags: ["原創", "編曲"],
      visible: true
    },
    {
      id: "original-06",
      title: "還是分開的好 - XIAXGUANG&葉書宏",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/Original/6.mp3",
      coverUrl: "assets/image/6.webp",
      tags: ["原創", "錄音"],
      visible: true
    },
    {
      id: "cover-lemon",
      title: "LEMON - Cover by Xiaxguang",
      category: "翻唱",
      type: "audio",
      mediaUrl: "assets/audio/COVER/LEMON.mp3",
      coverUrl: "assets/image/Cover1.webp",
      tags: ["翻唱", "Cover"],
      visible: true
    },
    {
      id: "cover-overdose",
      title: "OVERDOSE - Cover by Xiaxguang",
      category: "翻唱",
      type: "audio",
      mediaUrl: "assets/audio/COVER/OVERDOSE.mp3",
      coverUrl: "assets/image/Cover2.webp",
      tags: ["翻唱", "Cover"],
      visible: true
    },
    {
      id: "cover-wait",
      title: "我會等 - Cover by Xiaxguang",
      category: "翻唱",
      type: "audio",
      mediaUrl: "assets/audio/COVER/XIAXGUANG-我會等.mp3",
      coverUrl: "assets/image/Cover3.webp",
      tags: ["翻唱", "Cover"],
      visible: true
    },
    {
      id: "cover-evening-breeze",
      title: "晚風告白 - Cover by Xiaxguang",
      category: "翻唱",
      type: "audio",
      mediaUrl: "assets/audio/COVER/晚風告白.mp3",
      coverUrl: "assets/image/Cover4.webp",
      tags: ["翻唱", "Cover"],
      visible: true
    },
    {
      id: "cover-dinner-song",
      title: "晚餐歌 - Cover by Xiaxguang",
      category: "翻唱",
      type: "audio",
      mediaUrl: "assets/audio/COVER/晚餐歌.mp3",
      coverUrl: "assets/image/Cover5.webp",
      tags: ["翻唱", "Cover"],
      visible: true
    },
    {
      id: "cover-first-morning",
      title: "第一個清晨 - Cover by Xiaxguang",
      category: "翻唱",
      type: "audio",
      mediaUrl: "assets/audio/COVER/第一個清晨.mp3",
      coverUrl: "assets/image/Cover6.webp",
      tags: ["翻唱", "Cover"],
      visible: true
    },
    {
      id: "mix-passing-by",
      title: "他只是經過 - Cover by 阿均&葉書宏",
      category: "混音",
      type: "audio",
      mediaUrl: "assets/audio/Mixing/他只是經過MMM.mp3",
      coverUrl: "assets/image/Mixing1.webp",
      tags: ["混音", "Vocal Mixing"],
      visible: true
    },
    {
      id: "mix-night-sun",
      title: "夜晚的太陽 - 阿月",
      category: "混音",
      type: "audio",
      mediaUrl: "assets/audio/Mixing/夜晚的太陽.mp3",
      coverUrl: "assets/image/Mixing2.webp",
      tags: ["混音", "後製"],
      visible: true
    },
    {
      id: "mix-think",
      title: "我在想著你 - Xiaxguang",
      category: "混音",
      type: "audio",
      mediaUrl: "assets/audio/Mixing/想.mp3",
      coverUrl: "assets/image/Mixing3.webp",
      tags: ["混音", "人聲處理"],
      visible: true
    },
    {
      id: "mix-dizzy",
      title: "暈了 - Xiaxguang",
      category: "混音",
      type: "audio",
      mediaUrl: "assets/audio/Mixing/暈了.mp3",
      coverUrl: "assets/image/Mixing4.webp",
      tags: ["混音", "後製"],
      visible: true
    },
    {
      id: "arrangement-also-want",
      title: "其實我也想 - 阿月",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/Arrangement/其實我也想 - 阿月.mp3",
      coverUrl: "assets/image/Arrangement1.webp",
      tags: ["編曲", "Arrangement"],
      visible: true
    },
    {
      id: "arrangement-rui-mei",
      title: "KO - 叡鎂鋂",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/Arrangement/叡鎂鋂KO Ver.2.mp3",
      coverUrl: "assets/image/Arrangement2.webp",
      tags: ["編曲", "Arrangement"],
      visible: true
    },
    {
      id: "arrangement-yuanshan",
      title: "員山廣興堂 - RB",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/Arrangement/員山廣興堂.mp3",
      coverUrl: "assets/image/Arrangement3.webp",
      tags: ["編曲", "配樂"],
      visible: true
    },
    {
      id: "arrangement-half-for-you",
      title: "留一半給你 - 姜EA",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/Arrangement/留一半給你MMM.mp3",
      coverUrl: "assets/image/Arrangement4.webp",
      tags: ["編曲", "Arrangement"],
      visible: true
    },
    {
      id: "arrangement-friday",
      title: "禮拜五的復興路 - 葉書宏&蕭斯文",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/Arrangement/禮拜五的復興路MMM.mp3",
      coverUrl: "assets/image/Arrangement5.webp",
      tags: ["編曲", "Arrangement"],
      visible: true
    },
    {
      id: "arrangement-instrumental",
      title: "Not Alone instrumental",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/Arrangement/純音樂.mp3",
      coverUrl: "assets/image/Arrangement6.webp",
      tags: ["編曲", "純音樂"],
      visible: true
    },
    {
      id: "arrangement-tiger-lord",
      title: "虎爺 - RB",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/Arrangement/虎爺.mp3",
      coverUrl: "assets/image/Arrangement7.webp",
      tags: ["編曲", "配樂"],
      visible: true
    },
    {
      id: "arrangement-my-fault",
      title: "都是我不對 - 姜EA",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/Arrangement/都是我不對 MMM.mp3",
      coverUrl: "assets/image/Arrangement8.webp",
      tags: ["編曲", "Arrangement"],
      visible: true
    }
  ],
  comparisons: [
    {
      id: "mix-comparison-01",
      title: "Vocal Mixing",
      subtitle: "Before / After",
      beforeUrl: "assets/audio/Before.mp3",
      afterUrl: "assets/audio/After.mp3",
      visible: true
    }
  ],
  process: [
    { title: "討論需求", description: "了解作品方向與需求" },
    { title: "報價確認", description: "確認預算與交期" },
    { title: "製作執行", description: "進行混音、編曲或錄音" },
    { title: "確認修改", description: "依回饋調整作品" },
    { title: "交付成品", description: "完成並交付檔案" }
  ],
  beats: [
    {
      id: "beat-neon-velocity",
      title: "Neon Velocity",
      coverUrl: "assets/media/cover-neon-velocity.webp",
      audioUrl: "assets/audio/neon-velocity.mp3",
      bpm: 129,
      key: "F# major",
      genre: "Synthwave",
      priceLabel: "洽詢授權",
      purchaseUrl: "",
      visible: true
    },
    {
      id: "beat-demon-core",
      title: "Midnight Core",
      coverUrl: "assets/media/cover-demon-core.webp",
      audioUrl: "assets/audio/demon-core.mp3",
      bpm: 144,
      key: "F minor",
      genre: "Dark Trap",
      priceLabel: "洽詢授權",
      purchaseUrl: "",
      visible: true
    },
    {
      id: "beat-astral-gate",
      title: "Astral Gate",
      coverUrl: "assets/media/cover-astral-gate.webp",
      audioUrl: "assets/audio/astral-gate.mp3",
      bpm: 136,
      key: "C major",
      genre: "Cinematic Trap",
      priceLabel: "洽詢授權",
      purchaseUrl: "",
      visible: true
    },
    {
      id: "beat-echo-rift",
      title: "Echo Rift",
      coverUrl: "assets/media/cover-echo-rift.webp",
      audioUrl: "assets/audio/echo-rift.mp3",
      bpm: 123,
      key: "A minor",
      genre: "Wave",
      priceLabel: "洽詢授權",
      purchaseUrl: "",
      visible: true
    },
    {
      id: "beat-kaoliang-nights",
      title: "Rainy Nights",
      coverUrl: "assets/media/cover-kaoliang-nights.webp",
      audioUrl: "assets/audio/kaoliang-nights.mp3",
      bpm: 144,
      key: "Bb major",
      genre: "Rainy Lo-fi",
      priceLabel: "洽詢授權",
      purchaseUrl: "",
      visible: true
    }
  ]
};
