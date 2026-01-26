import { Schema } from "koishi";

const no_waifu = [
  "你没有娶到群友，强者注定孤独，加油！",
  "找不到对象.jpg",
  "今天的风儿好喧嚣，就像你单身的悲鸣...",
  "雪花飘飘北风萧萧～天地一片苍茫。",
  "要不等着分配一个对象？",
  "恭喜伱没有娶到老婆~",
  "さんが群友で結婚するであろうヒロインは、\n『自分の左手』です！",
  "醒醒，伱没有老婆。",
  "哈哈哈哈哈哈哈哈哈",
  "智者不入爱河，建设美丽中国～",
  "智者不入爱河，我们终成富婆",
  "智者不入爱河，寡王一路硕博",
  "今天的你依然和空气斗智斗勇呢~",
  "今天的你依然和空气斗智斗勇呢~",
  "娶不到就是娶不到，娶不到就多练！",
  "恭喜你，完美诠释了『独善其身』！",
  "恋爱？我的CPU占用率已经100%了。",
  "醒醒，你的老婆可能是你的幻想朋友...",
  "你的老婆可能还在测试阶段～",
  "处男之身很酷，保持纯真～",
  "加入单身俱乐部，快乐每一天",
  "你虽然没有找到对象，但你看到了加入FFF团的海报..."
];

const happy_end = [
  "好耶~",
  "婚礼？启动！",
  "需要咱主持婚礼吗 qwq",
  "不许秀恩爱！",
  "(响起婚礼进行曲♪)",
  "比翼从此添双翅，连理于今有合枝。\n琴瑟和鸣鸳鸯栖，同心结结永相系。",
  "金玉良缘，天作之合，郎才女貌，喜结同心。",
  "繁花簇锦迎新人，车水马龙贺新婚。",
  "乾坤和乐，燕尔新婚。",
  "愿天下有情人终成眷属。",
  "花团锦绣色彩艳，嘉宾满堂话语喧。",
  "火树银花不夜天，春归画栋双栖燕。",
  "红妆带绾同心结，碧树花开并蒂莲。",
  "一生一世两情相悦，三世尘缘四世同喜",
  "玉楼光辉花并蒂，金屋春暖月初圆。",
  "笙韵谱成同生梦，烛光笑对含羞人。",
  "祝你们百年好合，白头到老。",
  "祝你们生八个。"
];

const divorce_messages = ["嗯...", "...", "好...", "行...", "离就离吧...", "随你便..."];

interface Config {
  /**
   * at 对象时成功的概率，取值范围 0-100
   *
   * 单位：百分比
   */
  atSuccessRate: number;
  /** 娶群友成功率 */
  successRate: number;
  /** 没有娶到对象时的提示语 */
  noWaifuMessages: string[];
  /** 成功娶到对象时的提示语 */
  happyEndMessages: string[];
  /** 离婚时的提示语 */
  divorceMessages: string[];
  /** 离婚 CD，单位：秒 */
  divorceCooldown: number;
  /** 离婚罚款，指数增长
   */
  divorceFine: number;
}

const Config: Schema<Config> = Schema.object({
  atSuccessRate: Schema.number().description("at 对象时成功的概率，取值范围 0-100\n百分比").default(40),
  successRate: Schema.number().description("娶群友成功率，取值范围 0-100\n百分比").default(72),
  noWaifuMessages: Schema.array(String).description("没有娶到对象时的提示语").default(no_waifu),
  happyEndMessages: Schema.array(String).description("成功娶到对象时的提示语").default(happy_end),
  divorceMessages: Schema.array(String).description("离婚时的提示语").default(divorce_messages),
  divorceCooldown: Schema.number().description("离婚 CD，单位：秒").default(3600),
  divorceFine: Schema.number().description("离婚罚款，指数增长").default(200)
});

export { Config };
