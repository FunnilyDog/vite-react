//       @validateRefAccessDuringRender @validatePreserveExistingMemoizationGuarantees
import {useCallback, useRef} from 'react';

component Foo() {
  const ref = useRef();

  const s = useCallback(() => {
    return ref.current;
  });

  return <A r={s} />;
}

component A(r       ) {
  return <div />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Foo,
  params: [],
};
