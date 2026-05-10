// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { MobileNav } from './MobileNav';

figma.connect(
  MobileNav,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=10-7',
  {
    example: () => <MobileNav dark={false} onToggleDark={() => undefined} />,
  },
);
