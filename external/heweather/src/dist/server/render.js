import { renderToString } from "@vue/server-renderer";
import { createApp, createSSRApp, mergeProps, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
var _sfc_main = {
	__name: "App",
	__ssrInlineRender: true,
	props: {
		theme: {
			type: String,
			default: "light"
		},
		city: {
			type: String,
			default: ""
		},
		now: {
			type: Object,
			default: () => null
		},
		days: {
			type: Array,
			default: () => []
		},
		hours: {
			type: Array,
			default: () => []
		},
		warning: {
			type: Object,
			default: () => null
		},
		airQualityData: {
			type: Object,
			default: () => null
		},
		airPollutantData: {
			type: Object,
			default: () => null
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: `theme-${__props.theme} weather-container` }, _attrs))}>`);
			if (__props.now && __props.days && __props.days[0]) {
				_push(`<div class="main-weather"><div class="location"><h1>${ssrInterpolate(__props.city)}</h1>`);
				if (__props.now.obsTime) _push(`<p class="update-time">${ssrInterpolate(__props.now.obsTime.split("T")[1].substring(0, 5))} 更新</p>`);
				else _push(`<!---->`);
				_push(`</div><div class="current-temp"><div class="temp-display">${ssrInterpolate(__props.now.temp)}°</div><div class="weather-desc"><em class="${ssrRenderClass(`qi-${__props.now.icon} weather-icon-large`)}"></em><span>${ssrInterpolate(__props.now.text)}</span></div></div><div class="temp-range"><span>最高 ${ssrInterpolate(__props.days[0].tempMax)}°</span><span class="separator">|</span><span>最低 ${ssrInterpolate(__props.days[0].tempMin)}°</span></div></div>`);
			} else _push(`<div class="loading-state"><p>加载天气数据中...</p></div>`);
			if (__props.warning && __props.warning.alerts && __props.warning.alerts.length > 0) {
				_push(`<div class="weather-alerts"><!--[-->`);
				ssrRenderList(__props.warning.alerts, (w) => {
					_push(`<div class="alert-card"><div class="alert-header"><em class="${ssrRenderClass(`qi-${w.icon} alert-icon`)}"></em><div class="alert-title"><h3>${ssrInterpolate(w.headline)}</h3><p class="alert-time">${ssrInterpolate(w.issuedTime)}</p></div></div><p class="alert-description">${ssrInterpolate(w.description)}</p></div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			if (__props.now) {
				_push(`<div class="compact-row">`);
				if (__props.airQualityData) {
					_push(`<div class="glass-card air-quality-compact"><div class="card-header-compact"><h2>空气质量</h2><div class="aqi-badge" style="${ssrRenderStyle({ backgroundColor: __props.airQualityData.air_color })}">${ssrInterpolate(__props.airQualityData.aqi)}</div></div><div class="aqi-category">${ssrInterpolate(__props.airQualityData.category)}</div>`);
					if (__props.airPollutantData) _push(`<div class="pollutants-compact"><div class="pollutant-mini"><span>PM2.5</span><strong>${ssrInterpolate(__props.airPollutantData.pm2p5 !== void 0 ? __props.airPollutantData.pm2p5 : "-")}</strong></div><div class="pollutant-mini"><span>PM10</span><strong>${ssrInterpolate(__props.airPollutantData.pm10 !== void 0 ? __props.airPollutantData.pm10 : "-")}</strong></div><div class="pollutant-mini"><span>O₃</span><strong>${ssrInterpolate(__props.airPollutantData.o3 !== void 0 ? __props.airPollutantData.o3 : "-")}</strong></div></div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`<div class="glass-card quick-info"><div class="quick-item"><svg class="quick-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M29.316 8.051l-18-6a1 1 0 0 0-.916.149L4 7V2H2v28h2V11l6.4 4.8a1 1 0 0 0 .916.149l18-6a1 1 0 0 0 0-1.897zM10 13L4.667 9L10 5zm4-.054l-2 .667V4.387l2 .667zm4-1.333l-2 .666V5.721l2 .666zm2-.667V7.054L25.838 9z" fill="currentColor"></path><path d="M20 22a4 4 0 0 0-8 0h2a2 2 0 1 1 2 2H8v2h8a4.005 4.005 0 0 0 4-4z" fill="currentColor"></path><path d="M26 22a4.005 4.005 0 0 0-4 4h2a2 2 0 1 1 2 2H12v2h14a4 4 0 0 0 0-8z" fill="currentColor"></path></svg><div class="quick-data"><strong>${ssrInterpolate(__props.now.windSpeed || 0)} km/h</strong><span>${ssrInterpolate(__props.now.windDir || "-")}</span></div></div><div class="quick-item"><svg class="quick-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M23.476 13.993L16.847 3.437a1.04 1.04 0 0 0-1.694 0L8.494 14.043A9.986 9.986 0 0 0 7 19a9 9 0 0 0 18 0a10.063 10.063 0 0 0-1.524-5.007zM16 26a7.009 7.009 0 0 1-7-7a7.978 7.978 0 0 1 1.218-3.943l.935-1.49l10.074 10.074A6.977 6.977 0 0 1 16 26.001z" fill="currentColor"></path></svg><div class="quick-data"><strong>${ssrInterpolate(__props.now.humidity || 0)}%</strong><span>湿度</span></div></div><div class="quick-item"><svg class="quick-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z" fill="currentColor"></path></svg><div class="quick-data"><strong>${ssrInterpolate(__props.now.vis || 0)} km</strong><span>能见度</span></div></div><div class="quick-item"><svg class="quick-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M26 30h-4a2.006 2.006 0 0 1-2-2v-7a2.006 2.006 0 0 1-2-2v-6a2.946 2.946 0 0 1 3-3h6a2.946 2.946 0 0 1 3 3v6a2.006 2.006 0 0 1-2 2v7a2.006 2.006 0 0 1-2 2zm-5-18a.945.945 0 0 0-1 1v6h2v9h4v-9h2v-6a.945.945 0 0 0-1-1z" fill="currentColor"></path><path d="M24 9a4 4 0 1 1 4-4a4.012 4.012 0 0 1-4 4zm0-6a2 2 0 1 0 2 2a2.006 2.006 0 0 0-2-2z" fill="currentColor"></path><path d="M10 20.184V12H8v8.184a3 3 0 1 0 2 0z" fill="currentColor"></path><path d="M9 30a6.993 6.993 0 0 1-5-11.89V7a5 5 0 0 1 10 0v11.11A6.993 6.993 0 0 1 9 30zM9 4a3.003 3.003 0 0 0-3 3v11.983l-.332.299a5 5 0 1 0 6.664 0L12 18.983V7a3.003 3.003 0 0 0-3-3z" fill="currentColor"></path></svg><div class="quick-data"><strong>${ssrInterpolate(__props.now.feelsLike || 0)}°</strong><span>体感</span></div></div></div></div>`);
			} else _push(`<!---->`);
			if (__props.hours && __props.hours.length > 0) {
				_push(`<div class="glass-card hourly-forecast"><h2 class="card-header-compact">未来24小时</h2><div class="hourly-scroll"><!--[-->`);
				ssrRenderList(__props.hours, (hour, index) => {
					_push(`<div class="${ssrRenderClass(["hour-item", index === 0 ? "current" : ""])}"><div class="hour-time">${ssrInterpolate(index === 0 ? "现在" : hour.hour)}</div><em class="${ssrRenderClass(`qi-${hour.icon} hour-icon`)}"></em><div class="hour-temp">${ssrInterpolate(hour.temp)}°</div></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			if (__props.days && __props.days.length > 0) {
				_push(`<div class="glass-card daily-forecast"><h2 class="card-header-compact">未来天气</h2><div class="daily-list"><!--[-->`);
				ssrRenderList(__props.days, (day) => {
					_push(`<div class="day-item"><div class="day-info"><span class="day-name">${ssrInterpolate(day.week)}</span><span class="day-date">${ssrInterpolate(day.date)}</span></div><div class="day-weather"><div class="day-icons"><em class="${ssrRenderClass(`qi-${day.iconDay} day-icon`)}"></em><em class="${ssrRenderClass(`qi-${day.iconNight} night-icon`)}"></em></div><div class="day-description"><span>${ssrInterpolate(day.textDay)}</span><span class="day-night-text">${ssrInterpolate(day.textNight)}</span></div><div class="temp-bar"><span class="temp-min">${ssrInterpolate(day.tempMin)}°</span><div class="temp-line"></div><span class="temp-max">${ssrInterpolate(day.tempMax)}°</span></div></div></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			if (__props.days && __props.days[0] && __props.now) _push(`<div class="compact-row"><div class="glass-card detail-group"><h3>天文信息</h3><div class="detail-compact"><div class="detail-mini"><svg class="detail-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h1m16 0h1M5.6 10.6l.7.7m12.1-.7l-.7.7M8 17a4 4 0 0 1 8 0"></path><path d="M3 21h18"></path><path d="M12 9V3l3 3M9 6l3-3"></path></g></svg></svg><div><span class="detail-label">日出</span><strong>${ssrInterpolate(__props.days[0].sunrise || "-")}</strong></div></div><div class="detail-mini"><div class="detail-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h1m16 0h1M5.6 10.6l.7.7m12.1-.7l-.7.7M8 17a4 4 0 0 1 8 0"></path><path d="M3 21h18"></path><path d="M12 3v6l3-3M9 6l3 3"></path></g></svg></div><div><span class="detail-label">日落</span><strong>${ssrInterpolate(__props.days[0].sunset || "-")}</strong></div></div><div class="detail-mini"><span class="detail-icon"><em class="${ssrRenderClass(`qi-${__props.days[0].moonPhaseIcon}`)}"></em></span><div><span class="detail-label">月相</span><strong>${ssrInterpolate(__props.days[0].moonPhase || "-")}</strong></div></div></div></div><div class="glass-card detail-group"><h3>气象数据</h3><div class="detail-compact"><div class="detail-mini"><span class="detail-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M17.505 16l8.16-7.253A1 1 0 0 0 25 7h-3V2h-2v7h2.37L16 14.662L9.63 9H12V2h-2v5H7a1 1 0 0 0-.665 1.747L14.495 16l-8.16 7.253A1 1 0 0 0 7 25h3v5h2v-7H9.63L16 17.338L22.37 23H20v7h2v-5h3a1 1 0 0 0 .664-1.747z" fill="currentColor"></path></svg></span><div><span class="detail-label">气压</span><strong>${ssrInterpolate(__props.now.pressure || 0)} hPa</strong></div></div><div class="detail-mini"><span class="detail-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M16 7a7.66 7.66 0 0 1 1.51.15a8 8 0 0 1 6.35 6.34l.26 1.35l1.35.24a5.5 5.5 0 0 1-1 10.92H7.5a5.5 5.5 0 0 1-1-10.92l1.34-.24l.26-1.35A8 8 0 0 1 16 7m0-2a10 10 0 0 0-9.83 8.12A7.5 7.5 0 0 0 7.49 28h17a7.5 7.5 0 0 0 1.32-14.88a10 10 0 0 0-7.94-7.94A10.27 10.27 0 0 0 16 5z" fill="currentColor"></path></svg></span><div><span class="detail-label">云量</span><strong>${ssrInterpolate(__props.now.cloud || 0)}%</strong></div></div><div class="detail-mini"><span class="detail-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h8.5a2.5 2.5 0 1 0-2.34-3.24"></path><path d="M3 12h15.5a2.5 2.5 0 1 1-2.34 3.24"></path><path d="M4 16h5.5a2.5 2.5 0 1 1-2.34 3.24"></path></g></svg></span><div><span class="detail-label">风级</span><strong>${ssrInterpolate(__props.now.windScale || 0)}级</strong></div></div></div></div></div>`);
			else _push(`<!---->`);
			if (__props.airQualityData && __props.airPollutantData) _push(`<div class="glass-card air-pollutants"><h2 class="card-header-compact">污染物详情</h2><div class="pollutants-grid-detailed"><div class="pollutant-detail"><span class="pollutant-label">PM2.5</span><span class="pollutant-value">${ssrInterpolate(__props.airPollutantData.pm2p5 !== void 0 ? __props.airPollutantData.pm2p5 : "-")}</span><div class="pollutant-bar"><div class="pollutant-fill" style="${ssrRenderStyle({ width: (__props.airPollutantData.pm2p5 !== void 0 ? Math.min(__props.airPollutantData.pm2p5 / 150 * 100, 100) : 0) + "%" })}"></div></div></div><div class="pollutant-detail"><span class="pollutant-label">PM10</span><span class="pollutant-value">${ssrInterpolate(__props.airPollutantData.pm10 !== void 0 ? __props.airPollutantData.pm10 : "-")}</span><div class="pollutant-bar"><div class="pollutant-fill" style="${ssrRenderStyle({ width: (__props.airPollutantData.pm10 !== void 0 ? Math.min(__props.airPollutantData.pm10 / 250 * 100, 100) : 0) + "%" })}"></div></div></div><div class="pollutant-detail"><span class="pollutant-label">O₃</span><span class="pollutant-value">${ssrInterpolate(__props.airPollutantData.o3 !== void 0 ? __props.airPollutantData.o3 : "-")}</span><div class="pollutant-bar"><div class="pollutant-fill" style="${ssrRenderStyle({ width: (__props.airPollutantData.o3 !== void 0 ? Math.min(__props.airPollutantData.o3 / 200 * 100, 100) : 0) + "%" })}"></div></div></div><div class="pollutant-detail"><span class="pollutant-label">NO₂</span><span class="pollutant-value">${ssrInterpolate(__props.airPollutantData.no2 !== void 0 ? __props.airPollutantData.no2 : "-")}</span><div class="pollutant-bar"><div class="pollutant-fill" style="${ssrRenderStyle({ width: (__props.airPollutantData.no2 !== void 0 ? Math.min(__props.airPollutantData.no2 / 100 * 100, 100) : 0) + "%" })}"></div></div></div><div class="pollutant-detail"><span class="pollutant-label">SO₂</span><span class="pollutant-value">${ssrInterpolate(__props.airPollutantData.so2 !== void 0 ? __props.airPollutantData.so2 : "-")}</span><div class="pollutant-bar"><div class="pollutant-fill" style="${ssrRenderStyle({ width: (__props.airPollutantData.so2 !== void 0 ? Math.min(__props.airPollutantData.so2 / 150 * 100, 100) : 0) + "%" })}"></div></div></div><div class="pollutant-detail"><span class="pollutant-label">CO</span><span class="pollutant-value">${ssrInterpolate(__props.airPollutantData.co !== void 0 ? __props.airPollutantData.co : "-")}</span><div class="pollutant-bar"><div class="pollutant-fill" style="${ssrRenderStyle({ width: (__props.airPollutantData.co !== void 0 ? Math.min(__props.airPollutantData.co / 4 * 100, 100) : 0) + "%" })}"></div></div></div></div></div>`);
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("templates/App.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var App_default = _sfc_main;
function createApp$1(props, isSSR = false) {
	return { app: isSSR ? createSSRApp(App_default, props) : createApp(App_default, props) };
}
async function render(props) {
	const { app } = createApp$1(props, true);
	return { html: await renderToString(app, {}) };
}
export { render };
