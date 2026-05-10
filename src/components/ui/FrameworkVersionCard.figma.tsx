// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { FrameworkVersionCard } from './FrameworkVersionCard';

figma.connect(
  FrameworkVersionCard,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-59',
  {
    example: () => (
      <FrameworkVersionCard
        href="/framework"
        version="7.8.1"
        date="2026-05-09"
        outcome="Cross-repo Code Connect bridge shipped"
      />
    ),
  },
);
