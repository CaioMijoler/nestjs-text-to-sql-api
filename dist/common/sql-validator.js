"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlValidator = void 0;
class SqlValidator {
    static isValidSelectQuery(sql) {
        if (!sql)
            return false;
        const normalizedSql = sql.trim().replace(/\s+/g, ' ').toUpperCase();
        if (normalizedSql.includes(';')) {
            return false;
        }
        if (!normalizedSql.startsWith('SELECT')) {
            return false;
        }
        if (!normalizedSql.includes(' FROM ')) {
            return false;
        }
        if (/SELECT\s+\*\s+FROM/i.test(normalizedSql)) {
            return false;
        }
        const forbiddenKeywords = [
            'UPDATE ', 'DELETE ', 'INSERT ', 'DROP ', 'ALTER ',
            'TRUNCATE ', 'REPLACE ', 'GRANT ', 'REVOKE ', 'CREATE ',
        ];
        for (const keyword of forbiddenKeywords) {
            if (normalizedSql.includes(keyword)) {
                return false;
            }
        }
        return true;
    }
}
exports.SqlValidator = SqlValidator;
//# sourceMappingURL=sql-validator.js.map