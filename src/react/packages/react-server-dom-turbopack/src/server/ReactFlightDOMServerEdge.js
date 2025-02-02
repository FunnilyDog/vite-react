/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                                                         
                                                
                                                                              
                                                                             

import {ASYNC_ITERATOR} from 'shared/ReactSymbols';

import {
  createRequest,
  createPrerenderRequest,
  startWork,
  startFlowing,
  stopFlowing,
  abort,
} from 'react-server/src/ReactFlightServer';

import {
  createResponse,
  close,
  getRoot,
  reportGlobalError,
  resolveField,
  resolveFile,
} from 'react-server/src/ReactFlightReplyServer';

import {
  decodeAction,
  decodeFormState,
} from 'react-server/src/ReactFlightActionServer';

export {
  registerServerReference,
  registerClientReference,
  createClientModuleProxy,
} from '../ReactFlightTurbopackReferences';

                                                                                                 

export {createTemporaryReferenceSet} from 'react-server/src/ReactFlightServerTemporaryReferences';

                                    

                
                                            
                                                                    
                            
                       
                                              
                                   
                                        
  

function renderToReadableStream(
  model                  ,
  turbopackMap                ,
  options          ,
)                 {
  const request = createRequest(
    model,
    turbopackMap,
    options ? options.onError : undefined,
    options ? options.identifierPrefix : undefined,
    options ? options.onPostpone : undefined,
    options ? options.temporaryReferences : undefined,
    __DEV__ && options ? options.environmentName : undefined,
    __DEV__ && options ? options.filterStackFrame : undefined,
  );
  if (options && options.signal) {
    const signal = options.signal;
    if (signal.aborted) {
      abort(request, (signal     ).reason);
    } else {
      const listener = () => {
        abort(request, (signal     ).reason);
        signal.removeEventListener('abort', listener);
      };
      signal.addEventListener('abort', listener);
    }
  }
  const stream = new ReadableStream(
    {
      type: 'bytes',
      start: (controller)                 => {
        startWork(request);
      },
      pull: (controller)                 => {
        startFlowing(request, controller);
      },
      cancel: (reason)                 => {
        stopFlowing(request);
        abort(request, reason);
      },
    },
    // $FlowFixMe[prop-missing] size() methods are not allowed on byte streams.
    {highWaterMark: 0},
  );
  return stream;
}

                     
                          
  

function prerender(
  model                  ,
  turbopackMap                ,
  options          ,
)                        {
  return new Promise((resolve, reject) => {
    const onFatalError = reject;
    function onAllReady() {
      const stream = new ReadableStream(
        {
          type: 'bytes',
          start: (controller)                 => {
            startWork(request);
          },
          pull: (controller)                 => {
            startFlowing(request, controller);
          },
          cancel: (reason)                 => {
            stopFlowing(request);
            abort(request, reason);
          },
        },
        // $FlowFixMe[prop-missing] size() methods are not allowed on byte streams.
        {highWaterMark: 0},
      );
      resolve({prelude: stream});
    }
    const request = createPrerenderRequest(
      model,
      turbopackMap,
      onAllReady,
      onFatalError,
      options ? options.onError : undefined,
      options ? options.identifierPrefix : undefined,
      options ? options.onPostpone : undefined,
      options ? options.temporaryReferences : undefined,
      __DEV__ && options ? options.environmentName : undefined,
      __DEV__ && options ? options.filterStackFrame : undefined,
    );
    if (options && options.signal) {
      const signal = options.signal;
      if (signal.aborted) {
        const reason = (signal     ).reason;
        abort(request, reason);
      } else {
        const listener = () => {
          const reason = (signal     ).reason;
          abort(request, reason);
          signal.removeEventListener('abort', listener);
        };
        signal.addEventListener('abort', listener);
      }
    }
    startWork(request);
  });
}

function decodeReply   (
  body                   ,
  turbopackMap                ,
  options                                                ,
)              {
  if (typeof body === 'string') {
    const form = new FormData();
    form.append('0', body);
    body = form;
  }
  const response = createResponse(
    turbopackMap,
    '',
    options ? options.temporaryReferences : undefined,
    body,
  );
  const root = getRoot   (response);
  close(response);
  return root;
}

function decodeReplyFromAsyncIterable   (
  iterable                                        ,
  turbopackMap                ,
  options                                                ,
)              {
  const iterator                                         =
    iterable[ASYNC_ITERATOR]();

  const response = createResponse(
    turbopackMap,
    '',
    options ? options.temporaryReferences : undefined,
  );

  function progress(
    entry 
                                                           
                                       ,
  ) {
    if (entry.done) {
      close(response);
    } else {
      const [name, value] = entry.value;
      if (typeof value === 'string') {
        resolveField(response, name, value);
      } else {
        resolveFile(response, name, value);
      }
      iterator.next().then(progress, error);
    }
  }
  function error(reason       ) {
    reportGlobalError(response, reason);
    if (typeof (iterator     ).throw === 'function') {
      // The iterator protocol doesn't necessarily include this but a generator do.
      // $FlowFixMe should be able to pass mixed
      iterator.throw(reason).then(error, error);
    }
  }

  iterator.next().then(progress, error);

  return getRoot(response);
}

export {
  renderToReadableStream,
  prerender,
  decodeReply,
  decodeReplyFromAsyncIterable,
  decodeAction,
  decodeFormState,
};
