//       @enableAssumeHooksFollowRulesOfReact @enableTransitivelyFreezeFunctionExpressions
                  
function TypeAliasUsedAsAnnotation() {
                 
  const fun = (f     ) => {
    console.log(f);
  };
  fun('hello, world');
}

export const FIXTURE_ENTRYPOINT = {
  fn: TypeAliasUsedAsAnnotation,
  params: [],
};
