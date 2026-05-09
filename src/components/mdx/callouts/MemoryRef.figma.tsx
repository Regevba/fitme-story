// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { MemoryRef } from './MemoryRef';

figma.connect(
  MemoryRef,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-32',
  {
    props: {
      slug: figma.string('Slug'),
      title: figma.string('Title'),
      note: figma.string('Note'),
    },
    example: ({ slug, title, note }) => (
      <MemoryRef slug={slug} title={title} note={note} />
    ),
  },
);
