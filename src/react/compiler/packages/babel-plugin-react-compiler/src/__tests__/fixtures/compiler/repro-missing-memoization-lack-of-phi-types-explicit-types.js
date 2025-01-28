//       @validatePreserveExistingMemoizationGuarantees @enableUseTypeAnnotations
import {useMemo} from 'react';
import {useFragment} from 'shared-runtime';

// This is a version of error.todo-repro-missing-memoization-lack-of-phi-types
// with explicit type annotations and using enableUseTypeAnnotations to demonstrate
// that type information is sufficient to preserve memoization in this example
function Component() {
  const data = useFragment();
  const nodes             = data.nodes ?? [];
  const flatMap             = nodes.flatMap(node => node.items);
  const filtered             = flatMap.filter(item => item != null);
  const map             = useMemo(() => filtered.map(), [filtered]);
  const index             = filtered.findIndex(x => x === null);

  return (
    <div>
      {map}
      {index}
    </div>
  );
}
