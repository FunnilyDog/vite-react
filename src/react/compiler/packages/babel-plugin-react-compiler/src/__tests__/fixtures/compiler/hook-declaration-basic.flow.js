//       @compilationMode(infer)
export default hook useFoo(bar        ) {
  return [bar];
}

export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [42],
};
