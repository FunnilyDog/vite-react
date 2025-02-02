/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

import {createAsyncHook, executionAsyncId} from './ReactFlightServerConfig';
import {enableAsyncDebugInfo} from 'shared/ReactFeatureFlags';

// Initialize the tracing of async operations.
// We do this globally since the async work can potentially eagerly
// start before the first request and once requests start they can interleave.
// In theory we could enable and disable using a ref count of active requests
// but given that typically this is just a live server, it doesn't really matter.
export function initAsyncDebugInfo()       {
  if (__DEV__ && enableAsyncDebugInfo) {
    createAsyncHook({
      init(asyncId        , type        , triggerAsyncId        )       {
        // TODO
      },
      promiseResolve(asyncId        )       {
        // TODO
        executionAsyncId();
      },
      destroy(asyncId        )       {
        // TODO
      },
    }).enable();
  }
}
