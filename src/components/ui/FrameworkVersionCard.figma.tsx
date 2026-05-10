// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { FrameworkVersionCard } from './FrameworkVersionCard';

figma.connect(
  FrameworkVersionCard,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-59',
  {
    props: {
      version: figma.string('Version'),
      date: figma.string('Date'),
      outcome: figma.string('Outcome'),
    },
    example: ({ version, date, outcome }) => (
      <FrameworkVersionCard
        href="/framework"
        version={version}
        date={date}
        outcome={outcome}
      />
    ),
  },
);
