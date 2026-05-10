// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { KillCriterionResolution } from './KillCriterionResolution';

figma.connect(
  KillCriterionResolution,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-44',
  {
    props: {
      dueDate: figma.string('Due Date'),
      resolution: figma.string('Resolution'),
    },
    example: ({ dueDate, resolution }) => (
      <KillCriterionResolution
        status="clear"
        dueDate={dueDate}
        resolution={resolution}
      />
    ),
  },
);
