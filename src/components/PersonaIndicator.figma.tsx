// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { PersonaIndicator } from './PersonaIndicator';

figma.connect(
  PersonaIndicator,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=11-11',
  {
    example: () => <PersonaIndicator />,
  },
);
