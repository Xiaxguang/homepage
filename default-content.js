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
    { id: "beats", visible: true, order: 6 },
    { id: "about", visible: true, order: 7 },
    { id: "contact", visible: true, order: 8 }
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
    aboutTitle: "我是 XIAXGUANG，也叫阿光。",
    aboutBody: "音樂製作人、聲音設計師。從混音、編曲到人聲錄音，專注於把作品品質與情緒表達推進到更完整的位置。合作過多位歌手、YouTuber 與創作者，期待與你一起創造更多可能。",
    instagram: "xiaxguang",
    lineId: "bikabikahikari",
    youtube: "",
    heroCharacter: "assets/characters/mascot-seated.png",
    aboutCharacter: "assets/characters/mascot-crossed.png"
  },
  services: [
    {
      title: "混音製作",
      description: "專業混音處理，讓你的聲音更有層次與力量。"
    },
    {
      title: "編曲配樂",
      description: "量身打造編曲，從 0 到 1 完成你的音樂想像。"
    },
    {
      title: "宅錄人聲",
      description: "專業錄音設備，提供乾淨人聲錄製服務。"
    }
  ],
  categories: ["全部", "原創", "翻唱", "混音", "編曲"],
  works: [
    {
      id: "track-neon-velocity",
      title: "Neon Velocity",
      artist: "XIAXGUANG",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/neon-velocity.mp3",
      coverUrl: "assets/media/cover-neon-velocity.webp",
      externalUrl: "",
      tags: ["霓虹", "電子", "速度"],
      visible: true
    },
    {
      id: "track-demon-core",
      title: "Demon Core",
      artist: "XIAXGUANG",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/demon-core.mp3",
      coverUrl: "assets/media/cover-demon-core.webp",
      externalUrl: "",
      tags: ["暗黑", "能量", "重拍"],
      visible: true
    },
    {
      id: "track-astral-gate",
      title: "Astral Gate",
      artist: "XIAXGUANG",
      category: "編曲",
      type: "audio",
      mediaUrl: "assets/audio/astral-gate.mp3",
      coverUrl: "assets/media/cover-astral-gate.webp",
      externalUrl: "",
      tags: ["星際", "史詩", "空間"],
      visible: true
    },
    {
      id: "track-echo-rift",
      title: "Echo Rift",
      artist: "XIAXGUANG",
      category: "混音",
      type: "audio",
      mediaUrl: "assets/audio/echo-rift.mp3",
      coverUrl: "assets/media/cover-echo-rift.webp",
      externalUrl: "",
      tags: ["裂隙", "低頻", "聲景"],
      visible: true
    },
    {
      id: "track-kaoliang-nights",
      title: "Kaoliang Nights",
      artist: "XIAXGUANG",
      category: "原創",
      type: "audio",
      mediaUrl: "assets/audio/kaoliang-nights.mp3",
      coverUrl: "assets/media/cover-kaoliang-nights.webp",
      externalUrl: "",
      tags: ["雨夜", "宅錄", "氛圍"],
      visible: true
    }
  ],
  comparisons: [
    {
      id: "mix-comparison-01",
      title: "Vocal Mixing",
      subtitle: "Before / After",
      beforeUrl: "",
      afterUrl: "",
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
      id: "beat-night-drive",
      title: "Night Drive",
      coverUrl: "assets/media/beat-night-drive.webp",
      audioUrl: "",
      bpm: 128,
      key: "F minor",
      genre: "Dark Pop",
      priceLabel: "洽詢授權",
      purchaseUrl: "",
      visible: true
    },
    {
      id: "beat-cyber-wave",
      title: "Cyber Wave",
      coverUrl: "assets/media/cover-spectrum.webp",
      audioUrl: "",
      bpm: 145,
      key: "C minor",
      genre: "Synth Pop",
      priceLabel: "洽詢授權",
      purchaseUrl: "",
      visible: true
    },
    {
      id: "beat-deep-thoughts",
      title: "Deep Thoughts",
      coverUrl: "assets/media/cover-crystal.webp",
      audioUrl: "",
      bpm: 90,
      key: "A minor",
      genre: "Lo-fi",
      priceLabel: "洽詢授權",
      purchaseUrl: "",
      visible: true
    }
  ]
};
