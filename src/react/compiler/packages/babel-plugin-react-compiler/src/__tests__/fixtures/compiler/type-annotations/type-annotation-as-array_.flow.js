//       @enableUseTypeAnnotations
import {identity, makeArray} from 'shared-runtime';

function Component(props              ) {
  const x = (makeArray(props.id)               );
  const y = x.at(0);
  return y;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{id: 42}],
};
