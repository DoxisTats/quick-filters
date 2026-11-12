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

/* Job IDs, one per SEED row (same order). */
window.JOB_IDS = [
  '2b4335b9-ad32-42d0-8d8a-d51cfd399579', '9a82dfc4-36a0-4a83-828f-ee270fbe2468', 'f51be6e0-4d1b-479a-9c04-5d18b8022a38',
  '1d21f26c-c640-4cc5-8d9c-222b88d5fc16', 'db1f6137-58cd-4381-b235-e1c1ec4a598b', 'fdc5ed07-2368-4133-83ce-08f0c41a295d',
  'b4d1f4ea-0686-4171-a4db-46b6959affef', '1aa31e75-a229-4821-a872-9787c60219f7', '268b36aa-3809-4611-818a-8419fc000f66',
  '4a5de3f4-0987-4e55-be8b-1d6e9402608d', 'bd5608c1-9eb9-4402-9506-fd9df11edf18', '2ccc80ae-805f-42c2-97ac-4e3a4b5d111e',
  '5ff8d0d1-461b-4a1c-ab5d-0450c1bbef4f', '3bd884c6-4fae-4c0f-b38a-01be32882d1c', 'f4c98bc4-ee67-4694-b591-b8784fa490f4',
  '7c1e2a90-3b5d-4f61-9e2a-6d0f8b4c1a73', 'a93f05d2-71c8-4b0e-8f14-2e6b9d07c5e1', 'c0d47e61-9a2b-4e3f-b5c8-71f2a6d9e084',
  'e5b82f17-04c9-4d6a-a3e1-9f7c2b8d5a60', '6f3a9c04-b81e-47d2-9c5f-0a1e8d3b7f29', '8d2e6b13-5f07-4a9c-b4e2-c39f1a6d0e85',
  '0b7f4a28-c6e3-4d15-8a9b-5e2d7c1f3b46', '3e9c1d75-2a84-4f0b-b6d3-8c5a0e7f2d19', '95a0e3c8-7d16-4b2f-a8e5-1f4c9b6d3a07'
];

/* Table columns, in the order of the current Business Studio screen.
   [key, label, width px, align, kind ('badge' | 'sort' | 'check')] */
window.JOB_COLUMNS = [
  ['status', 'Status', 120, 'left', 'badge'], ['type', 'Agent job type', 150], ['def', 'Agent definition', 290],
  ['created', 'Creation date', 190, 'left', 'sort'], ['started', 'Start date', 190], ['ended', 'End date', 190],
  ['runtime', 'Run time [ms]', 140, 'right'], ['restarts', 'Automatic restarts', 170, 'right'], ['execs', 'Execution count', 150, 'right'],
  ['sync', 'Synchronous', 130, 'center', 'check'], ['group', 'Group', 100], ['seq', 'Sequence number', 160, 'right'],
  ['prio', 'Priority', 100, 'right'], ['parent', 'Parent completed', 160, 'center', 'check'], ['client', 'AGENT_EVENT_OBJECT_CLIENT_ID', 300],
  ['msg', 'Execution message', 320], ['trigger', 'Trigger', 240], ['ret', 'Return value', 130, 'right'],
  ['restartable', 'Restartable', 130, 'center', 'check'], ['service', 'Agent Runtime Service', 230], ['pclass', 'Process class', 150],
  ['task', 'Task', 120], ['id', 'ID', 360]
];

window.NAV = [
  { title: '', items: [['Home', 'home-line', ''], ['Library', 'book-open-01', ''], ['Applications', 'grid-01', ''], ['Integrations', 'intersect-square', 'chevron-down'], ['AI Studio', 'cpu-chip-01', 'chevron-down']] },
  { title: 'Configuration', items: [['General', 'tool-02', 'chevron-down'], ['Data model', 'database-02', 'chevron-down'], ['Search', 'search-sm', 'chevron-down'], ['Automation', 'zap', 'chevron-down'], ['Templates', 'file-02', 'link-external-02']] },
  { title: 'Security', items: [['Users', 'user-01', ''], ['Groups', 'users-01', ''], ['Units & roles', 'layers-two-01', ''], ['Access rules', 'lock-01', '']] },
  { title: 'Compliance', items: [['Retention rules', 'shield-01', '']] },
  { title: 'Administration', items: [['Jobs', 'clock-fast-forward', 'chevron-up'], ['>Agents'], ['>File import (FIPS)'], ['>Fulltext'], ['>Replication'], ['>Deletion']] }
];
