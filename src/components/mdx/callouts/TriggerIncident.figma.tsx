// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { TriggerIncident } from './TriggerIncident';

figma.connect(
  TriggerIncident,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-26',
  {
    example: () => (
      <TriggerIncident
        date="2026-04-30"
        title="Incident 1 — Example trigger"
        failureModes={['example-mode-1', 'example-mode-2']}
      >
        Brief description of what triggered this incident.
      </TriggerIncident>
    ),
  },
);
