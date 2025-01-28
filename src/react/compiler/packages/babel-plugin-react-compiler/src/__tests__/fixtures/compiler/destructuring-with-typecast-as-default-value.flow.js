//      
function Component(props) {
  const [x = ([]               )] = props.y;
  return x;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{y: []}],
};
