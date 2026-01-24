/**
 * 实时天气根响应
 */
export type RealtimeWeatherResponse = QWeatherResponse<Now, "now">;

/**
 * 实时天气数据
 */
export interface Now {
    /** 数据观测时间 */
    obsTime: string;
    /** 温度，默认单位：摄氏度 */
    temp: string;
    /** 体感温度，默认单位：摄氏度 */
    feelsLike: string;
    /** 天气状况的图标代码，另请参考天气图标项目 */
    icon: string;
    /** 天气状况的文字描述，包括阴晴雨雪等天气状态的描述 */
    text: string;
    /** 风向 360° 角度 */
    wind360: string;
    /** 风向 */
    windDir: string;
    /** 风力等级 */
    windScale: string;
    /** 风速，公里/小时 */
    windSpeed: string;
    /** 相对湿度，百分比数值 */
    humidity: string;
    /** 过去 1 小时降水量，默认单位：毫米 */
    precip: string;
    /** 大气压强，默认单位：百帕 */
    pressure: string;
    /** 能见度，默认单位：公里 */
    vis: string;
    /** 云量，百分比数值。可能为空 */
    cloud: string;
    /** 露点温度。可能为空 */
    dew: string;
}

/**
 * 7 日天气预报根响应
 */
export type DailyApi = QWeatherResponse<DailyItem[], "daily">;

/**
 *  API 天气预报根响应
 */
export type QWeatherResponse<T = unknown, K extends string = "data"> = {
    /** 状态码，"200" 表示成功 */
    code: string;
    /** 当前 API 的最近更新时间 */
    updateTime: string;
    /** 当前数据的响应式页面，便于嵌入网站或应用 */
    fxLink?: string;
    /** 数据引用与版权信息 */
    refer: Refer;
} & { [P in K]: T };

/**
 * 单日天气预报条目
 */
export interface DailyItem {
    /** 预报日期 */
    fxDate: string;
    /** 日出时间，在高纬度地区可能为空 */
    sunrise: string;
    /** 日落时间，在高纬度地区可能为空 */
    sunset: string;
    /** 当天月升时间，可能为空 */
    moonrise: string;
    /** 当天月落时间，可能为空 */
    moonset: string;
    /** 月相名称 */
    moonPhase: string;
    /** 月相图标代码，另请参考天气图标项目 */
    moonPhaseIcon: string;
    /** 预报当天最高温度 */
    tempMax: string;
    /** 预报当天最低温度 */
    tempMin: string;
    /** 预报白天天气状况的图标代码，另请参考天气图标项目 */
    iconDay: string;
    /** 预报白天天气状况文字描述，包括阴晴雨雪等天气状态的描述 */
    textDay: string;
    /** 预报夜间天气状况的图标代码，另请参考天气图标项目 */
    iconNight: string;
    /** 预报晚间天气状况文字描述，包括阴晴雨雪等天气状态的描述 */
    textNight: string;
    /** 预报白天风向 360° 角度 */
    wind360Day: string;
    /** 预报白天风向 */
    windDirDay: string;
    /** 预报白天风力等级 */
    windScaleDay: string;
    /** 预报白天风速，公里/小时 */
    windSpeedDay: string;
    /** 预报夜间风向 360° 角度 */
    wind360Night: string;
    /** 预报夜间当天风向 */
    windDirNight: string;
    /** 预报夜间风力等级 */
    windScaleNight: string;
    /** 预报夜间风速，公里/小时 */
    windSpeedNight: string;
    /** 预报当天总降水量，默认单位：毫米 */
    precip: string;
    /** 紫外线强度指数 */
    uvIndex: string;
    /** 相对湿度，百分比数值 */
    humidity: string;
    /** 大气压强，默认单位：百帕 */
    pressure: string;
    /** 能见度，默认单位：公里 */
    vis: string;
    /** 云量，百分比数值。可能为空 */
    cloud: string;
}

/**
 * 天气预警信息根响应
 */
export interface WeatherAlertResponse {
    /** 元数据信息 */
    metadata: {
        /** 数据标签 */
        tag: string;
        /** true 表示请求成功但无数据返回（例如查询地点无预警） */
        zeroResult?: boolean;
        /** 数据来源或声明，开发者必须将此内容与当前数据一起展示 */
        attributions?: string[];
    };
    /** 预警信息列表，可能为空数组 */
    alerts: AlertItem[];
}

/**
 * 单条预警信息条目
 */
export interface AlertItem {
    /** 本条预警信息的唯一标识 */
    id: string;
    /** 预警发布机构的名称，可能为空 */
    senderName: string | null;
    /** 原始预警信息生成的时间，实际发布或接收时间会略有延迟 */
    issuedTime: string;
    /** 预警信息性质 */
    messageType: MessageType;
    /** 预警事件类型 */
    eventType: {
        /** 预警事件类型的名称 */
        name: string;
        /** 预警事件类型的代码 */
        code: string;
    };
    /** 预警信息的紧迫程度，可能为空 */
    urgency: string | null;
    /** 预警信息的严重程度 */
    severity: string;
    /** 预警信息的确定性或可信度，可能为空 */
    certainty: string | null;
    /** 预警对应的图标代码 */
    icon: string;
    /** 预警信息的颜色 */
    color: {
        /** 预警颜色的颜色代码 */
        code: string;
        /** 预警颜色的红色分量值（RGBA），范围 0–255 */
        red: number;
        /** 预警颜色的绿色分量值（RGBA），范围 0–255 */
        green: number;
        /** 预警颜色的蓝色分量值（RGBA），范围 0–255 */
        blue: number;
        /** 预警颜色的透明度分量值（RGBA），范围 0-1 */
        alpha: number;
    };
    /** 预警信息的生效时间，可能为空 */
    effectiveTime: string | null;
    /** 预警事件预计开始的时间，可能为空 */
    onsetTime: string | null;
    /** 预警信息的失效时间 */
    expireTime: string;
    /** 预警信息的简要描述或标题 */
    headline: string;
    /** 预警信息的详细描述 */
    description: string;
    /** 当前预警信息的触发标准或条件，仅供参考，可能滞后于官方标准，可能为空 */
    criteria: string | null;
    /** 对当前预警的防御指南或行动指导，可能为空 */
    instruction: string | null;
    /** 对当前预警的应对方式的类型代码，可能为空 */
    responseTypes: string[];
}

/**
 * 预警信息性质
 */
export interface MessageType {
    /** 预警信息性质的代码，开发者可了解当前预警是新发布、更新或取消 */
    code: string;
    /** 当前预警取代或取消的后续预警 ID 列表，仅在 code 为 update 或 cancel 时返回 */
    supersedes: string[];
}

/**
 * 逐小时天气预报根响应
 */
export type HourlyApi = QWeatherResponse<HourlyItem[], "hourly">;

/**
 * 逐小时天气预报条目
 */
export interface HourlyItem {
    /** 预报时间 */
    fxTime: string;
    /** 温度，默认单位：摄氏度 */
    temp: string;
    /** 天气状况的图标代码，另请参考天气图标项目 */
    icon: string;
    /** 天气状况的文字描述，包括阴晴雨雪等天气状态的描述 */
    text: string;
    /** 风向 360° 角度 */
    wind360: string;
    /** 风向 */
    windDir: string;
    /** 风力等级 */
    windScale: string;
    /** 风速，公里/小时 */
    windSpeed: string;
    /** 相对湿度，百分比数值 */
    humidity: string;
    /** 当前小时累计降水量，默认单位：毫米 */
    precip: string;
    /** 逐小时预报降水概率，百分比数值，可能为空 */
    pop: string;
    /** 大气压强，默认单位：百帕 */
    pressure: string;
    /** 云量，百分比数值，可能为空 */
    cloud: string;
    /** 露点温度，可能为空 */
    dew: string;
}

export enum HourlyType {
    current_12h = 1,
    current_24h = 2
}

/**
 * 城市搜索根响应
 */
export type LocationSearchResponse = QWeatherResponse<LocationItem[], "location">;

/**
 * 单个城市/区域条目
 */
export interface LocationItem {
    /** 地区/城市名称 */
    name: string;
    /** 地区/城市ID */
    id: string;
    /** 地区/城市纬度 */
    lat: string;
    /** 地区/城市经度 */
    lon: string;
    /** 地区/城市的上级行政区划名称 */
    adm2: string;
    /** 地区/城市所属一级行政区域 */
    adm1: string;
    /** 地区/城市所属国家名称 */
    country: string;
    /** 地区/城市所在时区 */
    tz: string;
    /** 地区/城市目前与UTC时间偏移的小时数，参考详细说明 */
    utcOffset: string;
    /** 地区/城市是否当前处于夏令时。1 表示当前处于夏令时，0 表示当前不是夏令时。 */
    isDst: string;
    /** 地区/城市的属性 */
    type: string;
    /** 地区评分 */
    rank: string;
    /** 该地区的天气预报网页链接，便于嵌入你的网站或应用 */
    fxLink: string;
}

/**
 * 数据引用与版权信息
 */
export interface Refer {
    /** 原始数据来源，或数据源说明，可能为空 */
    sources: string[];
    /** 数据许可或版权声明，可能为空 */
    license: string[];
}

/**
 * 空气质量数据根响应
 */
export interface AirQualityResponse {
    /** 数据标签 */
    metadata: {
        /** 数据标签 */
        tag: string;
    };
    /** 空气质量指数列表 */
    indexes: {
        /** 空气质量指数 Code */
        code: string;
        /** 空气质量指数的名字 */
        name: string;
        /** 空气质量指数的值 */
        aqi: number;
        /** 空气质量指数的值的文本显示 */
        aqiDisplay: string;
        /** 空气质量指数等级，可能为空 */
        level: string;
        /** 空气质量指数类别，可能为空 */
        category: string;
        /** 空气质量指数的颜色（RGBA） */
        color: {
            /** RGBA 中的 red */
            red: number;
            /** RGBA 中的 green */
            green: number;
            /** RGBA 中的 blue */
            blue: number;
            /** RGBA 中的 alpha */
            alpha: number;
        };
        /** 首要污染物信息，可能为空 */
        primaryPollutant: {
            /** 污染物的 Code */
            code: string;
            /** 污染物的名字 */
            name: string;
            /** 污染物的全称 */
            fullName: string;
        };
        /** 健康影响与建议信息，可能为空 */
        health: HealthInfo;
    }[];
    /** 污染物列表 */
    pollutants: {
        /** 污染物的 Code */
        code: string;
        /** 污染物的名字 */
        name: string;
        /** 污染物的全称 */
        fullName: string;
        /** 污染物浓度信息 */
        concentration: {
            /** 污染物的浓度值 */
            value: number;
            /** 污染物的浓度值的单位 */
            unit: string;
        };
        /** 污染物分指数列表 */
        subIndexes: {
            /** 污染物的分指数的 Code，可能为空 */
            code: string;
            /** 污染物的分指数的数值，可能为空 */
            aqi: number;
            /** 污染物的分指数数值的显示名称 */
            aqiDisplay: string;
        }[];
    }[];
    /** AQI 相关联的监测站列表 */
    stations: {
        /** AQI 相关联的监测站 Location ID，可能为空 */
        id: string;
        /** AQI 相关联的监测站名称 */
        name: string;
    }[];
}

/**
 * 健康影响与建议信息
 */
export interface HealthInfo {
    /** 空气质量对健康的影响，可能为空 */
    effect: string;
    /** 健康指导意见，可能为空 */
    advice: {
        /** 对一般人群的健康指导意见，可能为空 */
        generalPopulation: string;
        /** 对敏感人群的健康指导意见，可能为空 */
        sensitivePopulation: string;
    };
}
