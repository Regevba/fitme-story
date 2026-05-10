// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { PersonaLens } from './PersonaLens';

figma.connect(
  PersonaLens,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=11-15',
  {
    example: () => <PersonaLens show="all">Lensed content</PersonaLens>,
  },
);
