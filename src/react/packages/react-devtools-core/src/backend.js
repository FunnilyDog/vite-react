/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

import Agent from 'react-devtools-shared/src/backend/agent';
import Bridge from 'react-devtools-shared/src/bridge';
import {installHook} from 'react-devtools-shared/src/hook';
import {initBackend} from 'react-devtools-shared/src/backend';
import {__DEBUG__} from 'react-devtools-shared/src/constants';
import setupNativeStyleEditor from 'react-devtools-shared/src/backend/NativeStyleEditor/setupNativeStyleEditor';
import {
  getDefaultComponentFilters,
  getIsReloadAndProfileSupported,
} from 'react-devtools-shared/src/utils';

                                                                    
             
                  
       
                                                  
             
               
                       
                    
                                                 
                                                                                                                   

                       
                
                                                            
                
                     
                                      
                                
                              
                         
                                                                          
                                        
                        
                                                                   
                                            
  

let savedComponentFilters                         =
  getDefaultComponentFilters();

function debug(methodName        , ...args              ) {
  if (__DEBUG__) {
    console.log(
      `%c[core/backend] %c${methodName}`,
      'color: teal; font-weight: bold;',
      'font-weight: bold;',
      ...args,
    );
  }
}

export function initialize(
  maybeSettingsOrSettingsPromise  
                          
                                   ,
  shouldStartProfilingNow          = false,
  profilingSettings                    ,
) {
  installHook(
    window,
    maybeSettingsOrSettingsPromise,
    shouldStartProfilingNow,
    profilingSettings,
  );
}

export function connectToDevTools(options                 ) {
  const hook                = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook == null) {
    // DevTools didn't get injected into this page (maybe b'c of the contentType).
    return;
  }

  const {
    host = 'localhost',
    nativeStyleEditorValidAttributes,
    useHttps = false,
    port = 8097,
    websocket,
    resolveRNStyle = (null            ),
    retryConnectionDelay = 2000,
    isAppActive = () => true,
    onSettingsUpdated,
    isReloadAndProfileSupported = getIsReloadAndProfileSupported(),
    isProfiling,
    onReloadAndProfile,
    onReloadAndProfileFlagsReset,
  } = options || {};

  const protocol = useHttps ? 'wss' : 'ws';
  let retryTimeoutID                   = null;

  function scheduleRetry() {
    if (retryTimeoutID === null) {
      // Two seconds because RN had issues with quick retries.
      retryTimeoutID = setTimeout(
        () => connectToDevTools(options),
        retryConnectionDelay,
      );
    }
  }

  if (!isAppActive()) {
    // If the app is in background, maybe retry later.
    // Don't actually attempt to connect until we're in foreground.
    scheduleRetry();
    return;
  }

  let bridge                       = null;

  const messageListeners = [];
  const uri = protocol + '://' + host + ':' + port;

  // If existing websocket is passed, use it.
  // This is necessary to support our custom integrations.
  // See D6251744.
  const ws = websocket ? websocket : new window.WebSocket(uri);
  ws.onclose = handleClose;
  ws.onerror = handleFailed;
  ws.onmessage = handleMessage;
  ws.onopen = function () {
    bridge = new Bridge({
      listen(fn) {
        messageListeners.push(fn);
        return () => {
          const index = messageListeners.indexOf(fn);
          if (index >= 0) {
            messageListeners.splice(index, 1);
          }
        };
      },
      send(event        , payload     , transferable             ) {
        if (ws.readyState === ws.OPEN) {
          if (__DEBUG__) {
            debug('wall.send()', event, payload);
          }

          ws.send(JSON.stringify({event, payload}));
        } else {
          if (__DEBUG__) {
            debug(
              'wall.send()',
              'Shutting down bridge because of closed WebSocket connection',
            );
          }

          if (bridge !== null) {
            bridge.shutdown();
          }

          scheduleRetry();
        }
      },
    });
    bridge.addListener(
      'updateComponentFilters',
      (componentFilters                        ) => {
        // Save filter changes in memory, in case DevTools is reloaded.
        // In that case, the renderer will already be using the updated values.
        // We'll lose these in between backend reloads but that can't be helped.
        savedComponentFilters = componentFilters;
      },
    );

    // The renderer interface doesn't read saved component filters directly,
    // because they are generally stored in localStorage within the context of the extension.
    // Because of this it relies on the extension to pass filters.
    // In the case of the standalone DevTools being used with a website,
    // saved filters are injected along with the backend script tag so we shouldn't override them here.
    // This injection strategy doesn't work for React Native though.
    // Ideally the backend would save the filters itself, but RN doesn't provide a sync storage solution.
    // So for now we just fall back to using the default filters...
    if (window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ == null) {
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      bridge.send('overrideComponentFilters', savedComponentFilters);
    }

    // TODO (npm-packages) Warn if "isBackendStorageAPISupported"
    // $FlowFixMe[incompatible-call] found when upgrading Flow
    const agent = new Agent(bridge, isProfiling, onReloadAndProfile);
    if (typeof onReloadAndProfileFlagsReset === 'function') {
      onReloadAndProfileFlagsReset();
    }

    if (onSettingsUpdated != null) {
      agent.addListener('updateHookSettings', onSettingsUpdated);
    }
    agent.addListener('shutdown', () => {
      if (onSettingsUpdated != null) {
        agent.removeListener('updateHookSettings', onSettingsUpdated);
      }

      // If we received 'shutdown' from `agent`, we assume the `bridge` is already shutting down,
      // and that caused the 'shutdown' event on the `agent`, so we don't need to call `bridge.shutdown()` here.
      hook.emit('shutdown');
    });

    initBackend(hook, agent, window, isReloadAndProfileSupported);

    // Setup React Native style editor if the environment supports it.
    if (resolveRNStyle != null || hook.resolveRNStyle != null) {
      setupNativeStyleEditor(
        // $FlowFixMe[incompatible-call] found when upgrading Flow
        bridge,
        agent,
        ((resolveRNStyle || hook.resolveRNStyle     )                    ),
        nativeStyleEditorValidAttributes ||
          hook.nativeStyleEditorValidAttributes ||
          null,
      );
    } else {
      // Otherwise listen to detect if the environment later supports it.
      // For example, Flipper does not eagerly inject these values.
      // Instead it relies on the React Native Inspector to lazily inject them.
      let lazyResolveRNStyle;
      let lazyNativeStyleEditorValidAttributes;

      const initAfterTick = () => {
        if (bridge !== null) {
          setupNativeStyleEditor(
            bridge,
            agent,
            lazyResolveRNStyle,
            lazyNativeStyleEditorValidAttributes,
          );
        }
      };

      if (!hook.hasOwnProperty('resolveRNStyle')) {
        Object.defineProperty(
          hook,
          'resolveRNStyle',
          ({
            enumerable: false,
            get() {
              return lazyResolveRNStyle;
            },
            set(value            ) {
              lazyResolveRNStyle = value;
              initAfterTick();
            },
          }        ),
        );
      }
      if (!hook.hasOwnProperty('nativeStyleEditorValidAttributes')) {
        Object.defineProperty(
          hook,
          'nativeStyleEditorValidAttributes',
          ({
            enumerable: false,
            get() {
              return lazyNativeStyleEditorValidAttributes;
            },
            set(value            ) {
              lazyNativeStyleEditorValidAttributes = value;
              initAfterTick();
            },
          }        ),
        );
      }
    }
  };

  function handleClose() {
    if (__DEBUG__) {
      debug('WebSocket.onclose');
    }

    if (bridge !== null) {
      bridge.emit('shutdown');
    }

    scheduleRetry();
  }

  function handleFailed() {
    if (__DEBUG__) {
      debug('WebSocket.onerror');
    }

    scheduleRetry();
  }

  function handleMessage(event              ) {
    let data;
    try {
      if (typeof event.data === 'string') {
        data = JSON.parse(event.data);
        if (__DEBUG__) {
          debug('WebSocket.onmessage', data);
        }
      } else {
        throw Error();
      }
    } catch (e) {
      console.error(
        '[React DevTools] Failed to parse JSON: ' + (event.data     ),
      );
      return;
    }
    messageListeners.forEach(fn => {
      try {
        fn(data);
      } catch (error) {
        // jsc doesn't play so well with tracebacks that go into eval'd code,
        // so the stack trace here will stop at the `eval()` call. Getting the
        // message that caused the error is the best we can do for now.
        console.log('[React DevTools] Error calling listener', data);
        console.log('error:', error);
        throw error;
      }
    });
  }
}

                                          
                                      
                                        
                                                   
                                                            
                                      
                                                                          
                                        
                        
                                                                   
                                            
  

export function connectWithCustomMessagingProtocol({
  onSubscribe,
  onUnsubscribe,
  onMessage,
  nativeStyleEditorValidAttributes,
  resolveRNStyle,
  onSettingsUpdated,
  isReloadAndProfileSupported = getIsReloadAndProfileSupported(),
  isProfiling,
  onReloadAndProfile,
  onReloadAndProfileFlagsReset,
}                                   )           {
  const hook                = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook == null) {
    // DevTools didn't get injected into this page (maybe b'c of the contentType).
    return;
  }

  const wall       = {
    listen(fn          ) {
      onSubscribe(fn);

      return () => {
        onUnsubscribe(fn);
      };
    },
    send(event        , payload     ) {
      onMessage(event, payload);
    },
  };

  const bridge                = new Bridge(wall);

  bridge.addListener(
    'updateComponentFilters',
    (componentFilters                        ) => {
      // Save filter changes in memory, in case DevTools is reloaded.
      // In that case, the renderer will already be using the updated values.
      // We'll lose these in between backend reloads but that can't be helped.
      savedComponentFilters = componentFilters;
    },
  );

  if (window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ == null) {
    bridge.send('overrideComponentFilters', savedComponentFilters);
  }

  const agent = new Agent(bridge, isProfiling, onReloadAndProfile);
  if (typeof onReloadAndProfileFlagsReset === 'function') {
    onReloadAndProfileFlagsReset();
  }

  if (onSettingsUpdated != null) {
    agent.addListener('updateHookSettings', onSettingsUpdated);
  }
  agent.addListener('shutdown', () => {
    if (onSettingsUpdated != null) {
      agent.removeListener('updateHookSettings', onSettingsUpdated);
    }

    // If we received 'shutdown' from `agent`, we assume the `bridge` is already shutting down,
    // and that caused the 'shutdown' event on the `agent`, so we don't need to call `bridge.shutdown()` here.
    hook.emit('shutdown');
  });

  const unsubscribeBackend = initBackend(
    hook,
    agent,
    window,
    isReloadAndProfileSupported,
  );

  const nativeStyleResolver                            =
    resolveRNStyle || hook.resolveRNStyle;

  if (nativeStyleResolver != null) {
    const validAttributes =
      nativeStyleEditorValidAttributes ||
      hook.nativeStyleEditorValidAttributes ||
      null;

    setupNativeStyleEditor(bridge, agent, nativeStyleResolver, validAttributes);
  }

  return unsubscribeBackend;
}
