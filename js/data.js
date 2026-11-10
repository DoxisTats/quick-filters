/* Sample data for the Agent jobs prototype.
   Replace SEED with data from your API. Columns:
   [status, agentDefinition, created, started, ended, runTimeMs, automaticRestarts, executionCount] */
window.SEED = [
  ['failed', 'HRDeleteRejectedDocument', '2026-11-09T00:40:00', '2026-11-09T00:50:15', '2026-11-09T00:50:15', 49, 10, 11],
  ['failed', 'HRChangeAddress', '2026-11-09T00:30:00', '2026-11-09T00:40:19', '2026-11-09T00:40:19', 51, 10, 11],
  ['failed', 'HRDocValidity', '2026-11-08T23:05:00', '2026-11-08T23:15:15', '2026-11-08T23:15:15', 92, 10, 11],
  ['failed', 'HRSetDocRetention', '2026-11-08T23:00:00', '2026-11-08T23:10:19', '2026-11-08T23:10:19', 52, 10, 11],
  ['failed', 'HRCheckWorkPermit', '2026-11-08T22:08:00', '2026-11-08T22:18:19', '2026-11-08T22:18:20', 79, 10, 11],
  ['failed', 'HRDeleteRejectedDocument', '2026-11-08T00:40:00', '2026-11-08T00:50:15', '2026-11-08T00:50:15', 47, 10, 11],
  ['failed', 'HRChangeAddress', '2026-11-08T00:30:00', '2026-11-08T00:40:19', '2026-11-08T00:40:19', 52, 10, 11],
  ['failed', 'HRDocValidity', '2026-11-07T23:05:00', '2026-11-07T23:15:15', '2026-11-07T23:15:15', 99, 10, 11],
  ['failed', 'HRSetDocRetention', '2026-11-07T23:00:00', '2026-11-07T23:10:19', '2026-11-07T23:10:19', 57, 10, 11],
  ['failed', 'HRCheckWorkPermit', '2026-11-07T22:08:00', '2026-11-07T22:18:20', '2026-11-07T22:18:20', 69, 10, 11],
  ['failed', 'HRDeleteRejectedDocument', '2026-11-07T00:40:02', '2026-11-07T00:50:22', '2026-11-07T00:50:22', 39, 10, 11],
  ['failed', 'HRChangeAddress', '2026-11-07T00:30:02', '2026-11-07T00:40:22', '2026-11-07T00:40:22', 45, 10, 11],
  ['failed', 'HRDocValidity', '2026-11-06T23:05:02', '2026-11-06T23:15:22', '2026-11-06T23:15:22', 84, 10, 11],
  ['failed', 'HRSetDocRetention', '2026-11-06T23:00:02', '2026-11-06T23:10:26', '2026-11-06T23:10:26', 55, 10, 11],
  ['failed', 'HRCheckWorkPermit', '2026-11-06T22:08:02', '2026-11-06T22:18:27', '2026-11-06T22:18:27', 62, 10, 11],
  ['running', 'HRCheckWorkPermit', '2026-11-09T08:45:00', '2026-11-09T08:45:01', null, null, 0, 1],
  ['running', 'HRSetDocRetention', '2026-11-09T08:40:00', '2026-11-09T08:40:02', null, null, 0, 1],
  ['success', 'HRDeleteRejectedDocument', '2026-11-06T00:40:00', '2026-11-06T00:40:01', '2026-11-06T00:40:01', 41, 0, 1],
  ['success', 'HRChangeAddress', '2026-11-06T00:30:00', '2026-11-06T00:30:01', '2026-11-06T00:30:01', 44, 0, 1],
  ['success', 'HRDocValidity', '2026-11-05T23:05:00', '2026-11-05T23:05:01', '2026-11-05T23:05:01', 88, 0, 1],
  ['success', 'HRSetDocRetention', '2026-11-05T23:00:00', '2026-11-05T23:00:01', '2026-11-05T23:00:01', 50, 0, 1],
  ['success', 'HRCheckWorkPermit', '2026-11-05T22:08:00', '2026-11-05T22:08:01', '2026-11-05T22:08:01', 71, 0, 1],
  ['success', 'HRDeleteRejectedDocument', '2026-11-05T00:40:00', '2026-11-05T00:40:01', '2026-11-05T00:40:01', 40, 0, 1],
  ['success', 'HRChangeAddress', '2026-11-05T00:30:00', '2026-11-05T00:30:01', '2026-11-05T00:30:01', 46, 0, 1]
];

window.NAV = [
  { title: '', items: [['Home', 'home-line', ''], ['Library', 'book-open-01', ''], ['Applications', 'grid-01', ''], ['Integrations', 'intersect-square', 'chevron-down'], ['AI Studio', 'cpu-chip-01', 'chevron-down']] },
  { title: 'Configuration', items: [['General', 'tool-02', 'chevron-down'], ['Data model', 'database-02', 'chevron-down'], ['Search', 'search-sm', 'chevron-down'], ['Automation', 'zap', 'chevron-down'], ['Templates', 'file-02', 'link-external-02']] },
  { title: 'Security', items: [['Users', 'user-01', ''], ['Groups', 'users-01', ''], ['Units & roles', 'layers-two-01', ''], ['Access rules', 'lock-01', '']] },
  { title: 'Compliance', items: [['Retention rules', 'shield-01', '']] },
  { title: 'Administration', items: [['Jobs', 'clock-fast-forward', 'chevron-up'], ['>Agents'], ['>File import (FIPS)'], ['>Fulltext'], ['>Replication'], ['>Deletion']] }
];
