//       @validateRefAccessDuringRender @validatePreserveExistingMemoizationGuarantees

import {useRef} from 'react';

component Foo(cond         , cond2         ) {
  const ref = useRef();

  const s = () => {
    return ref.current;
  };

  if (cond) return [s];
  else if (cond2) return {s};
  else return {s: [s]};
}

export const FIXTURE_ENTRYPOINT = {
  fn: Foo,
  params: [{cond: false, cond2: false}],
};
