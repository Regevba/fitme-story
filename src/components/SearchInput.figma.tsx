// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { SearchInput } from './SearchInput';

figma.connect(
  SearchInput,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-65',
  {
    example: () => <SearchInput variant="compact" />,
  },
);

figma.connect(
  SearchInput,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-67',
  {
    example: () => <SearchInput variant="expandable" />,
  },
);
