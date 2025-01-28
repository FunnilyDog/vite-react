//      
function Component(props) {
                             
  const user       = {name: props.name};
  return user;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{name: 'Mofei'}],
};
