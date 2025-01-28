//     

const foo = undefined;

component C(...{scope = foo ?? null}     ) {
  return scope;
}

export const FIXTURE_ENTRYPOINT = {
  fn: C,
  params: [{scope: undefined}],
};
