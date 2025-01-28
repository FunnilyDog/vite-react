/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                                    
                                                                      

import isArray from 'shared/isArray';
import {REACT_CONTEXT_TYPE} from 'shared/ReactSymbols';
import {
  DefaultEventPriority,
  NoEventPriority,
                     
} from 'react-reconciler/src/ReactEventPriorities';

export {default as rendererVersion} from 'shared/ReactVersion'; // TODO: Consider exporting the react-native version.
export const rendererPackageName = 'react-test-renderer';
export const extraDevToolsConfig = null;

                          
                           
                         
                                           
                           
                   
  
                        
               
                
                    
                                           
                                 
                                   
                  
  
                            
               
                    
              
  
                                                         
                                                     
                                 
                                   
                             // Unused
                                      
                           
                                 

                                                     
                                     

export * from 'react-reconciler/src/ReactFiberConfigWithNoPersistence';
export * from 'react-reconciler/src/ReactFiberConfigWithNoHydration';
export * from 'react-reconciler/src/ReactFiberConfigWithNoTestSelectors';
export * from 'react-reconciler/src/ReactFiberConfigWithNoMicrotasks';
export * from 'react-reconciler/src/ReactFiberConfigWithNoResources';
export * from 'react-reconciler/src/ReactFiberConfigWithNoSingletons';

const NO_CONTEXT = {};
const nodeToInstanceMap = new WeakMap               ();

if (__DEV__) {
  Object.freeze(NO_CONTEXT);
}

export function getPublicInstance(inst                         )             {
  switch (inst.tag) {
    case 'INSTANCE':
      const createNodeMock = inst.rootContainerInstance.createNodeMock;
      const mockNode = createNodeMock({
        type: inst.type,
        props: inst.props,
      });
      if (typeof mockNode === 'object' && mockNode !== null) {
        nodeToInstanceMap.set(mockNode, inst);
      }
      return mockNode;
    default:
      return inst;
  }
}

export function appendChild(
  parentInstance                      ,
  child                         ,
)       {
  if (__DEV__) {
    if (!isArray(parentInstance.children)) {
      console.error(
        'An invalid container has been provided. ' +
          'This may indicate that another renderer is being used in addition to the test renderer. ' +
          '(For example, ReactDOM.createPortal inside of a ReactTestRenderer tree.) ' +
          'This is not supported.',
      );
    }
  }
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }
  parentInstance.children.push(child);
}

export function insertBefore(
  parentInstance                      ,
  child                         ,
  beforeChild                         ,
)       {
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }
  const beforeIndex = parentInstance.children.indexOf(beforeChild);
  parentInstance.children.splice(beforeIndex, 0, child);
}

export function removeChild(
  parentInstance                      ,
  child                         ,
)       {
  const index = parentInstance.children.indexOf(child);
  parentInstance.children.splice(index, 1);
}

export function clearContainer(container           )       {
  container.children.splice(0);
}

export function getRootHostContext(
  rootContainerInstance           ,
)              {
  return NO_CONTEXT;
}

export function getChildHostContext(
  parentHostContext             ,
  type        ,
)              {
  return NO_CONTEXT;
}

export function prepareForCommit(containerInfo           )                {
  // noop
  return null;
}

export function resetAfterCommit(containerInfo           )       {
  // noop
}

export function createInstance(
  type        ,
  props       ,
  rootContainerInstance           ,
  hostContext        ,
  internalInstanceHandle        ,
)           {
  return {
    type,
    props,
    isHidden: false,
    children: [],
    internalInstanceHandle,
    rootContainerInstance,
    tag: 'INSTANCE',
  };
}

export function appendInitialChild(
  parentInstance          ,
  child                         ,
)       {
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }
  parentInstance.children.push(child);
}

export function finalizeInitialChildren(
  testElement          ,
  type        ,
  props       ,
  rootContainerInstance           ,
  hostContext        ,
)          {
  return false;
}

export function shouldSetTextContent(type        , props       )          {
  return false;
}

export function createTextInstance(
  text        ,
  rootContainerInstance           ,
  hostContext        ,
  internalInstanceHandle        ,
)               {
  return {
    text,
    isHidden: false,
    tag: 'TEXT',
  };
}

let currentUpdatePriority                = NoEventPriority;
export function setCurrentUpdatePriority(newPriority               )       {
  currentUpdatePriority = newPriority;
}

export function getCurrentUpdatePriority()                {
  return currentUpdatePriority;
}

export function resolveUpdatePriority()                {
  if (currentUpdatePriority !== NoEventPriority) {
    return currentUpdatePriority;
  }
  return DefaultEventPriority;
}

export function trackSchedulerEvent()       {}
export function resolveEventType()                {
  return null;
}
export function resolveEventTimeStamp()         {
  return -1.1;
}
export function shouldAttemptEagerTransition()          {
  return false;
}

export const isPrimaryRenderer = false;
export const warnsIfNotActing = true;

export const scheduleTimeout = setTimeout;
export const cancelTimeout = clearTimeout;

export const noTimeout = -1;

// -------------------
//     Mutation
// -------------------

export const supportsMutation = true;

export function commitUpdate(
  instance          ,
  type        ,
  oldProps       ,
  newProps       ,
  internalInstanceHandle        ,
)       {
  instance.type = type;
  instance.props = newProps;
}

export function commitMount(
  instance          ,
  type        ,
  newProps       ,
  internalInstanceHandle        ,
)       {
  // noop
}

export function commitTextUpdate(
  textInstance              ,
  oldText        ,
  newText        ,
)       {
  textInstance.text = newText;
}

export function resetTextContent(testElement          )       {
  // noop
}

export const appendChildToContainer = appendChild;
export const insertInContainerBefore = insertBefore;
export const removeChildFromContainer = removeChild;

export function hideInstance(instance          )       {
  instance.isHidden = true;
}

export function hideTextInstance(textInstance              )       {
  textInstance.isHidden = true;
}

export function unhideInstance(instance          , props       )       {
  instance.isHidden = false;
}

export function unhideTextInstance(
  textInstance              ,
  text        ,
)       {
  textInstance.isHidden = false;
}

export function applyViewTransitionName(
  instance          ,
  name        ,
  className         ,
)       {
  // Noop
}

export function restoreViewTransitionName(
  instance          ,
  props       ,
)       {
  // Noop
}

export function cancelViewTransitionName(
  instance          ,
  name        ,
  props       ,
)       {
  // Noop
}

export function cancelRootViewTransitionName(rootContainer           )       {
  // Noop
}

export function restoreRootViewTransitionName(rootContainer           )       {
  // Noop
}

                                       

export function measureInstance(instance          )                      {
  return null;
}

export function wasInstanceInViewport(
  measurement                     ,
)          {
  return true;
}

export function hasInstanceChanged(
  oldMeasurement                     ,
  newMeasurement                     ,
)          {
  return false;
}

export function hasInstanceAffectedParent(
  oldMeasurement                     ,
  newMeasurement                     ,
)          {
  return false;
}

export function startViewTransition(
  rootContainer           ,
  transitionTypes                        ,
  mutationCallback            ,
  layoutCallback            ,
  afterMutationCallback            ,
  spawnedWorkCallback            ,
  passiveCallback             ,
)          {
  return false;
}

                                                                

export function createViewTransitionInstance(
  name        ,
)                         {
  return null;
}

export function getInstanceFromNode(mockNode        )                {
  const instance = nodeToInstanceMap.get(mockNode);
  if (instance !== undefined) {
    return instance.internalInstanceHandle;
  }
  return null;
}

export function beforeActiveInstanceBlur(internalInstanceHandle        ) {
  // noop
}

export function afterActiveInstanceBlur() {
  // noop
}

export function preparePortalMount(portalInstance          )       {
  // noop
}

export function prepareScopeUpdate(scopeInstance        , inst        )       {
  nodeToInstanceMap.set(scopeInstance, inst);
}

export function getInstanceFromScope(scopeInstance        )                {
  return nodeToInstanceMap.get(scopeInstance) || null;
}

export function detachDeletedInstance(node          )       {
  // noop
}

export function logRecoverableError(error       )       {
  // noop
}

export function requestPostPaintCallback(callback                        ) {
  // noop
}

export function maySuspendCommit(type      , props       )          {
  return false;
}

export function preloadInstance(type      , props       )          {
  // Return true to indicate it's already loaded
  return true;
}

export function startSuspendingCommit()       {}

export function suspendInstance(type      , props       )       {}

export function suspendOnActiveViewTransition(container           )       {}

export function waitForCommitToBeReady()       {
  return null;
}

export const NotPendingTransition                   = null;
export const HostTransitionContext                                 = {
  $$typeof: REACT_CONTEXT_TYPE,
  Provider: (null     ),
  Consumer: (null     ),
  _currentValue: NotPendingTransition,
  _currentValue2: NotPendingTransition,
  _threadCount: 0,
};

                                    
export function resetFormInstance(form          )       {}
