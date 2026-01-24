import axios from "axios";
import type { Config } from ".";
import type {
    AirQualityResponse,
    DailyApi,
    HourlyApi,
    LocationItem,
    LocationSearchResponse,
    RealtimeWeatherResponse,
    WeatherAlertResponse
} from "./model";
import { getJwtToken, type JwtConfig } from "./utils";

export class ConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConfigError";
    }
}

export class CityNotFoundError extends Error {
    constructor() {
        super("City not found");
        this.name = "CityNotFoundError";
    }
}

export class APIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "APIError";
    }
}

export class Weather {
    private config: Config;
    public cityData: LocationItem | null = null;
    public now: RealtimeWeatherResponse | null = null;
    public daily: DailyApi | null = null;
    public air: AirQualityResponse | null = null;
    public warning: WeatherAlertResponse | null = null;
    public hourly: HourlyApi | null = null;
    constructor(
        public cityName: string,
        config: Config
    ) {
        this.config = config;
        this._validateForecastDays();
    }

    private _validateForecastDays() {
        if (
            this.config.qweather_apitype === 0 &&
            (this.config.qweather_forecast_days < 3 || this.config.qweather_forecast_days > 7)
        ) {
            throw new ConfigError("When apiType=0 (free subscription), forecast days must be 3≤x≤7");
        }
    }

    private async _getCityData(): Promise<LocationItem> {
        const url = `${this.config.qweather_apihost}/geo/v2/city/lookup`;
        const params = { location: this.cityName, number: 1 };
        try {
            const response: LocationSearchResponse = await this._request(url, params);
            if (response.code === "404" || !response.location[0]) {
                throw new CityNotFoundError();
            }

            if (response.code !== "200") {
                throw new APIError(
                    `Error code: ${response.code} - Refer to: https://dev.qweather.com/docs/start/status-code/`
                );
            }

            this.cityName = response.location[0].name;
            return response.location[0];
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                throw new CityNotFoundError();
            }
            throw new APIError(`Failed to get city ID: ${(error as Error).message}`);
        }
    }

    private async _request(url: string, params: any) {
        const headers: any = {};

        if (this.config.qweather_apikey) {
            headers["X-QW-Api-Key"] = this.config.qweather_apikey;
        } else if (this.config.qweather_use_jwt) {
            const jwtConfig: JwtConfig = {
                qweather_jwt_sub: this.config.qweather_jwt_sub!,
                qweather_jwt_kid: this.config.qweather_jwt_kid!,
                qweather_jwt_private_key: this.config.qweather_jwt_private_key!
            };
            const token = await getJwtToken(jwtConfig);
            headers.Authorization = `Bearer ${token}`;
        } else {
            throw new ConfigError("Please configure API Key or JWT");
        }

        const response = await axios.get(url, {
            params,
            headers
        });
        return response.data;
    }

    public async load(): Promise<void> {
        const cityData = await this._getCityData();

        const [nowData, dailyData, airData, warningData, hourlyData] = await Promise.all([
            this._getNow(cityData.id),
            this._getDaily(cityData.id),
            this._getAir(cityData.lat, cityData.lon),
            this._getWarning(cityData.lat, cityData.lon),
            this._getHourly(cityData.id)
        ]);

        this.cityData = cityData;
        this.now = nowData;
        this.daily = dailyData;
        this.air = airData;
        this.warning = warningData;
        this.hourly = hourlyData;

        this._validateData();
    }

    private async _getNow(cityID: string): Promise<RealtimeWeatherResponse> {
        const url = `${this.config.qweather_apihost}/v7/weather/now`;
        const params = { location: cityID };
        const data: RealtimeWeatherResponse = await this._request(url, params);
        return data;
    }

    private async _getDaily(cityID: string): Promise<DailyApi> {
        const days = this.config.qweather_forecast_days;
        const url = `${this.config.qweather_apihost}/v7/weather/${days}d`;
        const params = { location: cityID };
        const data: DailyApi = await this._request(url, params);
        return data;
    }

    private async _getAir(latitude: string, longitude: string): Promise<AirQualityResponse> {
        const url = `${this.config.qweather_apihost}/airquality/v1/current/${latitude}/${longitude}`;
        const data: AirQualityResponse = await this._request(url, {
            lang: "zh-hans"
        });
        return data;
    }

    private async _getWarning(latitude: string, longitude: string): Promise<WeatherAlertResponse> {
        const url = `${this.config.qweather_apihost}/weatheralert/v1/current/${latitude}/${longitude}`;
        const data: WeatherAlertResponse = await this._request(url, {
            lang: "zh-hans"
        });

        return data;
    }

    private async _getHourly(cityID: string): Promise<HourlyApi> {
        const url = `${this.config.qweather_apihost}/v7/weather/24h`;
        const params = { location: cityID };
        const data: HourlyApi = await this._request(url, params);
        return data;
    }

    private _validateData() {
        const errors: string[] = [];

        if (!this.now) {
            errors.push(`Now: ${this.now}`);
        }
        if (!this.daily) {
            errors.push(`Daily: ${this.daily}`);
        }
        if (!this.air) {
            errors.push(`Air: ${this.air}`);
        }
        if (!this.warning) {
            errors.push(`Warning: ${this.warning}`);
        }
        if (!this.hourly) {
            errors.push(`Hourly: ${this.hourly}`);
        }

        if (errors.length > 0) {
            throw new APIError(
                `API validation failed: ${errors.join(
                    ", "
                )}\nRefer to: https://dev.qweather.com/docs/start/status-code/`
            );
        }
    }
}
