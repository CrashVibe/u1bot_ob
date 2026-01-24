import { importPKCS8, SignJWT } from "jose";
import moent from "moment-timezone";
import { type AirQualityResponse, type DailyItem, type HourlyItem, HourlyType } from "./model";
import { ConfigError } from "./services";

export interface JwtConfig {
    qweather_jwt_sub: string;
    qweather_jwt_kid: string;
    qweather_jwt_private_key: string;
}

export async function getJwtToken(config: JwtConfig): Promise<string> {
    const { qweather_jwt_sub, qweather_jwt_kid, qweather_jwt_private_key } = config;

    if (!qweather_jwt_sub || !qweather_jwt_kid || !qweather_jwt_private_key) {
        throw new ConfigError("Missing required JWT configuration parameters");
    }

    const payload = {
        iat: Math.floor(Date.now() / 1000) - 30,
        exp: Math.floor(Date.now() / 1000) + 900,
        sub: qweather_jwt_sub
    };

    const key = await importPKCS8(qweather_jwt_private_key, "EdDSA");

    return await new SignJWT({})
        .setProtectedHeader({ alg: "EdDSA", kid: qweather_jwt_kid })
        .setIssuedAt(payload.iat)
        .setExpirationTime(payload.exp)
        .setSubject(payload.sub)
        .sign(key);
}

export function convert_color_to_hex(air: AirQualityResponse["indexes"][0]["color"]): string {
    const r = air.red.toString(16).padStart(2, "0");
    const g = air.green.toString(16).padStart(2, "0");
    const b = air.blue.toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
}
export function add_hour_data(
    hourly: HourlyItem[],
    hourlyType: HourlyType,
    timezone: string
): (HourlyItem & {
    hour: string;
    temp_percent: string;
})[] {
    if (!hourly || hourly.length === 0) {
        return [];
    }
    const result: (HourlyItem & { hour: string; temp_percent: string })[] = [];
    const temps = hourly.map((hour) => parseInt(hour.temp, 10));
    const min_temp = Math.min(...temps);
    const high = Math.max(...temps);
    const low = min_temp - (high - min_temp);

    for (const hour of hourly) {
        const date_time = moent(hour.fxTime).tz(timezone);
        const hourNum = date_time.hour();
        let hourStr = (hourNum % 12 === 0 ? 12 : hourNum % 12).toString();
        hourStr += hourNum < 12 ? "AM" : "PM";
        let temp_percent = "";
        if (high === low) {
            temp_percent = "100px";
        } else {
            temp_percent = `${Math.round(((parseInt(hour.temp, 10) - low) / (high - low)) * 100)}px`;
        }
        result.push({
            ...hour,
            hour: hourStr,
            temp_percent: temp_percent
        });
    }
    if (hourlyType === HourlyType.current_12h) {
        return result.slice(0, 12);
    }
    if (hourlyType === HourlyType.current_24h) {
        return result.filter((_, idx) => idx % 2 === 0);
    }
    return result;
}
export function add_date(daily: DailyItem[]): (DailyItem & {
    week: string;
    date: string;
})[] {
    const week_map = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const result: (DailyItem & { week: string; date: string })[] = [];

    daily.map((day, idx) => {
        const fxDate = day.fxDate ?? "";
        const date = fxDate.split("-");
        const _year = parseInt(date[0] ?? "0", 10);
        const _month = parseInt(date[1] ?? "0", 10);
        const _day = parseInt(date[2] ?? "0", 10);
        const week = new Date(_year, _month - 1, _day).getDay();
        result.push({
            ...day,
            week: idx === 0 ? "今日" : (week_map[week] ?? ""),
            date: `${_month}月${_day}日`
        });
    });

    return result;
}
