/* Sample data for the Groups page. Replace with data from your API.
   Person names are fictional (example.com); technical accounts match the Business Studio sample system. */
window.GROUP_DATA = {
  users: [
    'AgentService', 'anna.becker@example.com', 'ArchiveService', 'BPM1', 'ben.hartmann@example.com',
    'carla.nunes@example.com', 'chris.wagner@example.com', 'DARWinUser', 'david.klein@example.com', 'DescriptionUser',
    'DoxisWebApplication', 'elena.fischer@example.com', 'EmptyPassword', 'felix.braun@example.com', 'greta.vogel@example.com',
    'hannah.schulz@example.com', 'ImportService', 'ivan.petrov@example.com', 'julia.koch@example.com', 'karl.meyer@example.com',
    'lena.wolf@example.com', 'marco.rossi@example.com', 'nina.hoffmann@example.com', 'oliver.lang@example.com',
    'ReplicationUser', 'sofia.richter@example.com', 'tom.weber@example.com', 'ute.krause@example.com', 'wanda.zimmer@example.com'
  ],
  roles: [
    'Administrator', 'Archive manager', 'Auditor', 'Contract manager', 'Document reader', 'fdsfasd',
    'HR clerk', 'Legal counsel', 'Records manager', 'Workflow designer'
  ],
  units: ['bbb', 'Finance', 'Human Resources', 'IT Operations', 'Legal', 'Procurement', 'Sales', 'Service'],

  /* [name, referenced by application, members as [name, 'user' | 'role' | 'unit']] */
  groups: [
    ['aaa', 'TB1', [['AgentService', 'user'], ['bbb', 'unit'], ['fdsfasd', 'role']]],
    ['BusinessPartnerCore FullAccess', 'BusinessPartnerCore', [['Administrator', 'role'], ['anna.becker@example.com', 'user'], ['Sales', 'unit']]],
    ['BusinessPartnerCore Standard', 'BusinessPartnerCore', [['Sales', 'unit'], ['Service', 'unit'], ['ben.hartmann@example.com', 'user']]],
    ['BusinessPartnerCore ViewOnly', 'BusinessPartnerCore', [['Document reader', 'role'], ['Auditor', 'role']]],
    ['CollaborativeWS FullAccess', 'CollaborativeWS', [['Administrator', 'role'], ['carla.nunes@example.com', 'user'], ['DoxisWebApplication', 'user']]],
    ['CollaborativeWS Standard', 'CollaborativeWS', [['IT Operations', 'unit'], ['chris.wagner@example.com', 'user'], ['david.klein@example.com', 'user'], ['elena.fischer@example.com', 'user']]],
    ['CollaborativeWS ViewOnly', 'CollaborativeWS', [['Document reader', 'role']]],
    ['ComTemplates', 'ComTemplates', [['Workflow designer', 'role'], ['felix.braun@example.com', 'user']]],
    ['Contract_InternalAudit', 'Contract', [['Auditor', 'role'], ['greta.vogel@example.com', 'user']]],
    ['Contract_Legal', 'Contract', [['Legal', 'unit'], ['Legal counsel', 'role'], ['hannah.schulz@example.com', 'user']]],
    ['Contract_Management', 'Contract', [['Contract manager', 'role'], ['Procurement', 'unit'], ['ivan.petrov@example.com', 'user'], ['julia.koch@example.com', 'user']]],
    ['Contract_ProfAdmins', 'Contract', [['Administrator', 'role'], ['karl.meyer@example.com', 'user']]],
    ['Contract_Professionals', 'Contract', [['Procurement', 'unit'], ['Finance', 'unit'], ['lena.wolf@example.com', 'user']]],
    ['Contract_RestrictedConfidential', 'Contract', [['Legal counsel', 'role'], ['marco.rossi@example.com', 'user']]],
    ['Contract_StrictlyConfidential', 'Contract', [['nina.hoffmann@example.com', 'user']]],
    ['Contract_TechAdmins', 'Contract', [['IT Operations', 'unit'], ['AgentService', 'user'], ['ArchiveService', 'user']]],
    ['CustomerWS FullAccess', 'CustomerWS', [['Administrator', 'role'], ['oliver.lang@example.com', 'user']]],
    ['CustomerWS Standard', 'CustomerWS', [['Service', 'unit'], ['Sales', 'unit'], ['sofia.richter@example.com', 'user']]],
    ['CustomerWS ViewOnly', 'CustomerWS', []]
  ]
};
