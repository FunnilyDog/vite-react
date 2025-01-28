//       @enableUseTypeAnnotations
import {identity} from 'shared-runtime';

function Component(props              ) {
  const x = identity(props.id);
  const y = (x        );
  return y;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{id: 42}],
};
