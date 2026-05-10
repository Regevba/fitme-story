// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { Tag } from './Tag';

figma.connect(
  Tag,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-12',
  {
    example: () => <Tag variant="flagship">Flagship</Tag>,
  },
);

figma.connect(
  Tag,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-14',
  {
    example: () => <Tag variant="standard">Standard</Tag>,
  },
);

figma.connect(
  Tag,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-16',
  {
    example: () => <Tag variant="tier_t1">T1</Tag>,
  },
);
