import type {ComponentProps} from 'react';
import MDXComponents from '@theme-original/MDXComponents';

import RepoLink from '@site/src/components/RepoLink';

export default function MDXComponentsWrapper(
  props: ComponentProps<typeof MDXComponents>,
): JSX.Element {
  return (
    <MDXComponents
      {...props}
      components={{
        ...props.components,
        RepoLink,
      }}
    />
  );
}
