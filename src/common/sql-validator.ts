export class SqlValidator {
  static isValidSelectQuery(sql: string): boolean {
    if (!sql) return false;

    // Normalize all whitespace (newlines, tabs, multiple spaces) to single spaces
    const normalizedSql = sql.trim().replace(/\s+/g, ' ').toUpperCase();

    // Must not contain semicolons
    if (normalizedSql.includes(';')) {
      return false;
    }

    // Must start with SELECT
    if (!normalizedSql.startsWith('SELECT')) {
      return false;
    }

    // Must contain FROM clause
    if (!normalizedSql.includes(' FROM ')) {
      return false;
    }

    // Must not use SELECT *
    if (/SELECT\s+\*\s+FROM/i.test(normalizedSql)) {
      return false;
    }

    // Forbidden DML/DDL keywords
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
