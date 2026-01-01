"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeolocationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let GeolocationService = class GeolocationService {
    async getTimezoneFromIp(ip) {
        try {
            const url = ip && ip !== '::1' && ip !== '127.0.0.1'
                ? `https://ipapi.co/${ip}/json/`
                : 'https://ipapi.co/json/';
            const response = await axios_1.default.get(url);
            const data = response.data;
            if (data.error) {
                throw new Error(data.reason || 'IP API error');
            }
            return {
                timezone: data.timezone || 'UTC',
                location: data.city ? `${data.city}, ${data.country_name}` : 'Unknown',
                country: data.country_name || 'Unknown',
                city: data.city || 'Unknown',
            };
        }
        catch (error) {
            console.error('[Geolocation] detection failed:', error.message);
            return {
                timezone: 'UTC',
                location: 'Unknown',
                country: 'Unknown',
                city: 'Unknown'
            };
        }
    }
};
exports.GeolocationService = GeolocationService;
exports.GeolocationService = GeolocationService = __decorate([
    (0, common_1.Injectable)()
], GeolocationService);
//# sourceMappingURL=geolocation.service.js.map