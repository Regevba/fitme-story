// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { KillCriterionResolution } from './KillCriterionResolution';

figma.connect(
  KillCriterionResolution,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-44',
  {
    example: () => (
      <KillCriterionResolution
        status="clear"
        dueDate="2026-05-15"
        resolution="0 of 2 kill criteria fired in week 1"
      />
    ),
  },
);
