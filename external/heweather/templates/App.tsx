import "./css/weather.css";
import "./css/qweather-icons.css";

import type { AlertItem, WeatherAppProps } from "../src/model";
import { Cloud, Droplets, Eye, Gauge, Sunrise, Sunset, ThermometerSun, Wind } from "lucide-react";

export type AppProps = WeatherAppProps;

export default function App({
  theme = "light",
  city = "",
  now = null,
  days = [],
  hours = [],
  warning = null,
  airQualityData = null,
  airPollutantData = null
}: AppProps) {
  const day0 = days[0];

  return (
    <div className={`theme-${theme} weather-container`}>
      {/* 主要天气信息 */}
      {now && day0 ? (
        <div className="main-weather">
          <div className="location">
            <h1>{city}</h1>
            {now.obsTime && <p className="update-time">{now.obsTime.split("T")[1]?.substring(0, 5)} 更新</p>}
          </div>
          <div className="current-temp">
            <div className="temp-display">{now.temp}°</div>
            <div className="weather-desc">
              <em className={`qi-${now.icon} weather-icon-large`} />
              <span>{now.text}</span>
            </div>
          </div>
          <div className="temp-range">
            <span>最高 {day0.tempMax}°</span>
            <span className="separator">|</span>
            <span>最低 {day0.tempMin}°</span>
          </div>
        </div>
      ) : (
        <div className="loading-state">
          <p>加载天气数据中...</p>
        </div>
      )}

      {/* 天气预警 */}
      {warning?.alerts && warning.alerts.length > 0 && (
        <div className="weather-alerts">
          {warning.alerts.map((w: AlertItem) => (
            <div key={w.headline} className="alert-card">
              <div className="alert-header">
                <em className={`qi-${w.icon} alert-icon`} />
                <div className="alert-title">
                  <h3>{w.headline}</h3>
                  <p className="alert-time">{w.issuedTime}</p>
                </div>
              </div>
              <p className="alert-description">{w.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* 空气质量与快速数据 */}
      {now && (
        <div className="compact-row">
          {airQualityData && (
            <div className="glass-card air-quality-compact">
              <div className="card-header-compact">
                <h2>空气质量</h2>
                <div className="aqi-badge" style={{ backgroundColor: airQualityData.air_color }}>
                  {airQualityData.aqi}
                </div>
              </div>
              <div className="aqi-category">{airQualityData.category}</div>
              {airPollutantData && (
                <div className="pollutants-compact">
                  <div className="pollutant-mini">
                    <span>PM2.5</span>
                    <strong>{airPollutantData.pm2p5 !== undefined ? airPollutantData.pm2p5 : "-"}</strong>
                  </div>
                  <div className="pollutant-mini">
                    <span>PM10</span>
                    <strong>{airPollutantData.pm10 !== undefined ? airPollutantData.pm10 : "-"}</strong>
                  </div>
                  <div className="pollutant-mini">
                    <span>O₃</span>
                    <strong>{airPollutantData.o3 !== undefined ? airPollutantData.o3 : "-"}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* 快速信息 */}
          <div className="glass-card quick-info">
            <div className="quick-item">
              <Wind className="quick-icon" />
              <div className="quick-data">
                <strong>{now.windSpeed || 0} km/h</strong>
                <span>{now.windDir || "-"}</span>
              </div>
            </div>
            <div className="quick-item">
              <Droplets className="quick-icon" />
              <div className="quick-data">
                <strong>{now.humidity || 0}%</strong>
                <span>湿度</span>
              </div>
            </div>
            <div className="quick-item">
              <Eye className="quick-icon" />
              <div className="quick-data">
                <strong>{now.vis || 0} km</strong>
                <span>能见度</span>
              </div>
            </div>
            <div className="quick-item">
              <ThermometerSun className="quick-icon" />
              <div className="quick-data">
                <strong>{now.feelsLike || 0}°</strong>
                <span>体感</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 逐小时天气 */}
      {hours.length > 0 && (
        <div className="glass-card hourly-forecast">
          <h2 className="card-header-compact">未来24小时</h2>
          <div className="hourly-scroll">
            {hours.map((hour, index) => (
              <div key={hour.hour + index} className={`hour-item ${index === 0 ? "current" : ""}`}>
                <div className="hour-time">{index === 0 ? "现在" : hour.hour}</div>
                <em className={`qi-${hour.icon} hour-icon`} />
                <div className="hour-temp">{hour.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 未来几天天气 */}
      {days.length > 0 && (
        <div className="glass-card daily-forecast">
          <h2 className="card-header-compact">未来天气</h2>
          <div className="daily-list">
            {days.map((day) => (
              <div key={day.date} className="day-item">
                <div className="day-info">
                  <span className="day-name">{day.week}</span>
                  <span className="day-date">{day.date}</span>
                </div>
                <div className="day-weather">
                  <div className="day-icons">
                    <em className={`qi-${day.iconDay} day-icon`} />
                    <em className={`qi-${day.iconNight} night-icon`} />
                  </div>
                  <div className="day-description">
                    <span>{day.textDay}</span>
                    <span className="day-night-text">{day.textNight}</span>
                  </div>
                  <div className="temp-bar">
                    <span className="temp-min">{day.tempMin}°</span>
                    <div className="temp-line" />
                    <span className="temp-max">{day.tempMax}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 详细信息 */}
      {day0 && now && (
        <div className="compact-row">
          <div className="glass-card detail-group">
            <h3>天文信息</h3>
            <div className="detail-compact">
              <div className="detail-mini">
                <Sunrise className="detail-icon" />
                <div>
                  <span className="detail-label">日出</span>
                  <strong>{day0.sunrise || "-"}</strong>
                </div>
              </div>
              <div className="detail-mini">
                <Sunset className="detail-icon" />
                <div>
                  <span className="detail-label">日落</span>
                  <strong>{day0.sunset || "-"}</strong>
                </div>
              </div>
              <div className="detail-mini">
                <span className="detail-icon">
                  <em className={`qi-${day0.moonPhaseIcon}`} />
                </span>
                <div>
                  <span className="detail-label">月相</span>
                  <strong>{day0.moonPhase || "-"}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card detail-group">
            <h3>气象数据</h3>
            <div className="detail-compact">
              <div className="detail-mini">
                <Gauge className="detail-icon" />
                <div>
                  <span className="detail-label">气压</span>
                  <strong>{now.pressure || 0} hPa</strong>
                </div>
              </div>
              <div className="detail-mini">
                <Cloud className="detail-icon" />
                <div>
                  <span className="detail-label">云量</span>
                  <strong>{now.cloud || 0}%</strong>
                </div>
              </div>
              <div className="detail-mini">
                <Wind className="detail-icon" />
                <div>
                  <span className="detail-label">风级</span>
                  <strong>{now.windScale || 0}级</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {airQualityData && airPollutantData && (
        <div className="glass-card air-pollutants">
          <h2 className="card-header-compact">污染物详情</h2>
          <div className="pollutants-grid-detailed">
            {(
              [
                ["PM2.5", "pm2p5", 150],
                ["PM10", "pm10", 250],
                ["O₃", "o3", 200],
                ["NO₂", "no2", 100],
                ["SO₂", "so2", 150],
                ["CO", "co", 4]
              ] as const
            ).map(([label, key, max]) => {
              const value = airPollutantData[key];
              return (
                <div key={key} className="pollutant-detail">
                  <span className="pollutant-label">{label}</span>
                  <span className="pollutant-value">{value !== undefined ? value : "-"}</span>
                  <div className="pollutant-bar">
                    <div
                      className="pollutant-fill"
                      style={{ width: `${value !== undefined ? Math.min((value / max) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
