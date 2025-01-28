//       @compilationMode(infer)
export default component Foo(bar        ) {
  return <Bar bar={bar} />;
}

component Bar(bar        ) {
  return <div>{bar}</div>;
}

function shouldNotCompile() {}

export const FIXTURE_ENTRYPOINT = {
  fn: Foo,
  params: [{bar: 42}],
};
