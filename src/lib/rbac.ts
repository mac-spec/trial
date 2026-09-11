export type RoleId = 'mospi' | 'state_nodal' | 'district_authority' | 'implementing_agency' | 'mp_office';

export interface RoleDefinition {
  id: RoleId;
  label: string;
  shortLabel: string;
  scope: string;
  description: string;
  actions: string[];
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'mospi',
    label: 'MoSPI / Ministry Audit Officer',
    shortLabel: 'MoSPI Officer',
    scope: 'National / ministry oversight',
    description: 'Cross-jurisdiction oversight, risk prioritisation and escalation.',
    actions: ['View all jurisdictions', 'Review risk alerts', 'Freeze / release funds', 'Escalate cases', 'View audit trail'],
  },
  {
    id: 'state_nodal',
    label: 'State Nodal Authority',
    shortLabel: 'State Nodal',
    scope: 'State-level monitoring',
    description: 'Monitor sanctioned works, utilisation, progress and district exceptions.',
    actions: ['View state portfolio', 'Review risk alerts', 'Request corrective action', 'View audit trail'],
  },
  {
    id: 'district_authority',
    label: 'District Authority',
    shortLabel: 'District Authority',
    scope: 'District-level execution oversight',
    description: 'Track sanctions, execution, payments, delays and field evidence.',
    actions: ['Review assigned works', 'Validate progress', 'Flag exceptions', 'View field evidence'],
  },
  {
    id: 'implementing_agency',
    label: 'Implementing Agency',
    shortLabel: 'Implementing Agency',
    scope: 'Assigned work execution',
    description: 'Update execution evidence and respond to audit observations for assigned works.',
    actions: ['View assigned works', 'Submit progress evidence', 'Respond to observations', 'View own audit status'],
  },
  {
    id: 'mp_office',
    label: 'MP / Constituency Office',
    shortLabel: 'MP Office',
    scope: 'Constituency portfolio',
    description: 'Portfolio transparency, recommendations and constituency-level insights.',
    actions: ['View constituency portfolio', 'View project status', 'View risk summary', 'Track recommendations'],
  },
];

export const getRole = (id: string): RoleDefinition =>
  ROLE_DEFINITIONS.find((role) => role.id === id) || ROLE_DEFINITIONS[2];

export const ROLE_VIEW_ACCESS: Record<RoleId, string[]> = {
  mospi: ['overview', 'digitaltwin', 'governance', 'map', 'deepdive', 'fieldintel'],
  state_nodal: ['overview', 'digitaltwin', 'governance', 'map', 'deepdive', 'fieldintel'],
  district_authority: ['overview', 'digitaltwin', 'governance', 'map', 'deepdive', 'fieldintel'],
  implementing_agency: ['overview', 'digitaltwin', 'map', 'fieldintel'],
  mp_office: ['overview', 'digitaltwin', 'map', 'fieldintel'],
};

export function canAccessView(roleId: RoleId, view: string) {
  return ROLE_VIEW_ACCESS[roleId].includes(view);
}

export function canPerformAction(roleId: RoleId, action: string) {
  return getRole(roleId).actions.includes(action);
}
