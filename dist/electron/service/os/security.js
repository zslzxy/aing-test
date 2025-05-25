"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityService = exports.SecurityService = void 0;
const log_1 = require("ee-core/log");
const electron_1 = require("electron");
/**
 * SecurityService class for handling security-related operations
 */
class SecurityService {
    /**
     * Create and configure the security service
     */
    create() {
        log_1.logger.info('[security] load');
        const runWithDebug = process.argv.find((e) => {
            const isHasDebug = e.includes('--inspect') || e.includes('--inspect-brk') || e.includes('--remote-debugging-port');
            return isHasDebug;
        });
        // Do not allow remote debugging
        if (runWithDebug) {
            log_1.logger.error('[error] Remote debugging is not allowed, runWithDebug:', runWithDebug);
            electron_1.app.quit();
        }
    }
}
exports.SecurityService = SecurityService;
SecurityService.toString = () => '[class SecurityService]';
const securityService = new SecurityService();
exports.securityService = securityService;
//# sourceMappingURL=security.js.map