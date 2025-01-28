//       @enableAssumeHooksFollowRulesOfReact @enableTransitivelyFreezeFunctionExpressions
                  
function TypeAliasUsedAsAnnotation() {
                 
  const fun = f => {
    let g      = f;
    console.log(g);
  };
  fun('hello, world');
}

export const FIXTURE_ENTRYPOINT = {
  fn: TypeAliasUsedAsAnnotation,
  params: [],
};
