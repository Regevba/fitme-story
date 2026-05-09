// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { SearchInput } from './SearchInput';

const FIGMA_BASE =
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System';

figma.connect(SearchInput, `${FIGMA_BASE}?node-id=5-65`, {
  example: () => <SearchInput variant="compact" />,
});

figma.connect(SearchInput, `${FIGMA_BASE}?node-id=5-67`, {
  example: () => <SearchInput variant="expandable" />,
});
