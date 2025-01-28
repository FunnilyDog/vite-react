//      
                         
function Component(props) {
  const x = {bar: props.bar};
  const y = (x     );
  y.bar = 'hello';
  const z = (y     );
  return z;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ['TodoAdd'],
  isComponent: 'TodoAdd',
};
