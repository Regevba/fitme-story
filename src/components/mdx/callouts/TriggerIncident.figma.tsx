// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { TriggerIncident } from './TriggerIncident';

figma.connect(
  TriggerIncident,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-26',
  {
    props: {
      date: figma.string('Date'),
      title: figma.string('Title'),
      children: figma.string('Body'),
    },
    example: ({ date, title, children }) => (
      <TriggerIncident
        date={date}
        title={title}
        failureModes={['example-mode-1', 'example-mode-2']}
      >
        {children}
      </TriggerIncident>
    ),
  },
);
