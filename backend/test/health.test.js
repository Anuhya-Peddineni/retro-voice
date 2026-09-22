"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const app_1 = require("../src/app");
(0, vitest_1.describe)('GET /api/health', () => {
    (0, vitest_1.it)('returns ok status', async () => {
        const app = (0, app_1.createApp)({ FRONTEND_ORIGIN: 'http://localhost:5173' });
        const response = await (0, supertest_1.default)(app).get('/api/health');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toEqual({
            status: 'ok',
            service: 'retrovoice-backend',
        });
    });
});
