// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { Tag } from './Tag';

const FIGMA_BASE =
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System';

figma.connect(Tag, `${FIGMA_BASE}?node-id=5-12`, {
  props: {
    children: figma.string('Label'),
  },
  example: ({ children }) => <Tag variant="flagship">{children}</Tag>,
});

figma.connect(Tag, `${FIGMA_BASE}?node-id=5-14`, {
  props: {
    children: figma.string('Label'),
  },
  example: ({ children }) => <Tag variant="standard">{children}</Tag>,
});

figma.connect(Tag, `${FIGMA_BASE}?node-id=5-16`, {
  props: {
    children: figma.string('Label'),
  },
  example: ({ children }) => <Tag variant="tier_t1">{children}</Tag>,
});
