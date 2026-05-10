// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { Button } from './Button';

figma.connect(
  Button,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-4',
  {
    example: () => <Button variant="primary">Primary</Button>,
  },
);

figma.connect(
  Button,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-6',
  {
    example: () => <Button variant="secondary">Secondary</Button>,
  },
);

figma.connect(
  Button,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-8',
  {
    example: () => <Button variant="ghost">Ghost</Button>,
  },
);
