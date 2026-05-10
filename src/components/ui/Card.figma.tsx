// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { Card } from './Card';

figma.connect(
  Card,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=17-7',
  {
    example: () => <Card variant="flat">Flat card content</Card>,
  },
);

figma.connect(
  Card,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=17-11',
  {
    example: () => <Card variant="tinted">Tinted card content</Card>,
  },
);
