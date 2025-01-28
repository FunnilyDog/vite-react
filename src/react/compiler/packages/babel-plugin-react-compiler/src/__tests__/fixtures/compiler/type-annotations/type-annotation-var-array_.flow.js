//       @enableUseTypeAnnotations
import {identity} from 'shared-runtime';

function Component(props              ) {
  const x                = makeArray(props.id);
  const y = x.at(0);
  return y;
}

function makeArray   (x   )           {
  return [x];
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{id: 42}],
};
