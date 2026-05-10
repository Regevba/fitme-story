// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { Button } from './Button';

const FIGMA_BASE =
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System';

figma.connect(Button, `${FIGMA_BASE}?node-id=5-4`, {
  props: {
    children: figma.string('Label'),
  },
  example: ({ children }) => <Button variant="primary">{children}</Button>,
});

figma.connect(Button, `${FIGMA_BASE}?node-id=5-6`, {
  props: {
    children: figma.string('Label'),
  },
  example: ({ children }) => <Button variant="secondary">{children}</Button>,
});

figma.connect(Button, `${FIGMA_BASE}?node-id=5-8`, {
  props: {
    children: figma.string('Label'),
  },
  example: ({ children }) => <Button variant="ghost">{children}</Button>,
});
