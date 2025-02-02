/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

             
          
                   
                                            
                                                                              
                                   
                                     
                                                                
             
                 
                    
                                                        

import {Readable} from 'stream';
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
  reportGlobalError,
  close,
  resolveField,
  resolveFileInfo,
  resolveFileChunk,
  resolveFileComplete,
  getRoot,
} from 'react-server/src/ReactFlightReplyServer';

import {
  decodeAction as decodeActionImpl,
  decodeFormState as decodeFormStateImpl,
} from 'react-server/src/ReactFlightActionServer';
import {
  preloadModule,
  requireModule,
  resolveServerReference,
} from '../client/ReactFlightClientConfigBundlerParcel';

export {
  createClientReference,
  registerServerReference,
} from '../ReactFlightParcelReferences';

                                                                                                 

export {createTemporaryReferenceSet} from 'react-server/src/ReactFlightServerTemporaryReferences';
                                    

function createDrainHandler(destination             , request         ) {
  return () => startFlowing(request, destination);
}

function createCancelHandler(request         , reason        ) {
  return () => {
    stopFlowing(request);
    abort(request, new Error(reason));
  };
}

                
                                            
                                                                    
                                   
                                        
                            
                                              
  

                       
                             
                                       
  

export function renderToPipeableStream(
  model                  ,
  options          ,
)                 {
  const request = createRequest(
    model,
    null,
    options ? options.onError : undefined,
    options ? options.identifierPrefix : undefined,
    options ? options.onPostpone : undefined,
    options ? options.temporaryReferences : undefined,
    __DEV__ && options ? options.environmentName : undefined,
    __DEV__ && options ? options.filterStackFrame : undefined,
  );
  let hasStartedFlowing = false;
  startWork(request);
  return {
    pipe             (destination   )    {
      if (hasStartedFlowing) {
        throw new Error(
          'React currently only supports piping to one writable stream.',
        );
      }
      hasStartedFlowing = true;
      startFlowing(request, destination);
      destination.on('drain', createDrainHandler(destination, request));
      destination.on(
        'error',
        createCancelHandler(
          request,
          'The destination stream errored while writing data.',
        ),
      );
      destination.on(
        'close',
        createCancelHandler(request, 'The destination stream closed early.'),
      );
      return destination;
    },
    abort(reason       ) {
      abort(request, reason);
    },
  };
}

function createFakeWritable(readable     )           {
  // The current host config expects a Writable so we create
  // a fake writable for now to push into the Readable.
  return ({
    write(chunk) {
      return readable.push(chunk);
    },
    end() {
      readable.push(null);
    },
    destroy(error) {
      readable.destroy(error);
    },
  }     );
}

                         
                                            
                                                                    
                                   
                                        
                            
                                              
                       
  

                     
                    
  

export function prerenderToNodeStream(
  model                  ,
  options                   ,
)                        {
  return new Promise((resolve, reject) => {
    const onFatalError = reject;
    function onAllReady() {
      const readable           = new Readable({
        read() {
          startFlowing(request, writable);
        },
      });
      const writable = createFakeWritable(readable);
      resolve({prelude: readable});
    }

    const request = createPrerenderRequest(
      model,
      null,
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

let serverManifest = {};
export function registerServerActions(manifest                ) {
  // This function is called by the bundler to register the manifest.
  serverManifest = manifest;
}

export function decodeReplyFromBusboy   (
  busboyStream        ,
  options                                                ,
)              {
  const response = createResponse(
    serverManifest,
    '',
    options ? options.temporaryReferences : undefined,
  );
  let pendingFiles = 0;
  const queuedFields                = [];
  busboyStream.on('field', (name, value) => {
    if (pendingFiles > 0) {
      // Because the 'end' event fires two microtasks after the next 'field'
      // we would resolve files and fields out of order. To handle this properly
      // we queue any fields we receive until the previous file is done.
      queuedFields.push(name, value);
    } else {
      resolveField(response, name, value);
    }
  });
  busboyStream.on('file', (name, value, {filename, encoding, mimeType}) => {
    if (encoding.toLowerCase() === 'base64') {
      throw new Error(
        "React doesn't accept base64 encoded file uploads because we don't expect " +
          "form data passed from a browser to ever encode data that way. If that's " +
          'the wrong assumption, we can easily fix it.',
      );
    }
    pendingFiles++;
    const file = resolveFileInfo(response, name, filename, mimeType);
    value.on('data', chunk => {
      resolveFileChunk(response, file, chunk);
    });
    value.on('end', () => {
      resolveFileComplete(response, name, file);
      pendingFiles--;
      if (pendingFiles === 0) {
        // Release any queued fields
        for (let i = 0; i < queuedFields.length; i += 2) {
          resolveField(response, queuedFields[i], queuedFields[i + 1]);
        }
        queuedFields.length = 0;
      }
    });
  });
  busboyStream.on('finish', () => {
    close(response);
  });
  busboyStream.on('error', err => {
    reportGlobalError(
      response,
      // $FlowFixMe[incompatible-call] types Error and mixed are incompatible
      err,
    );
  });
  return getRoot(response);
}

export function decodeReply   (
  body                   ,
  options                                                ,
)              {
  if (typeof body === 'string') {
    const form = new FormData();
    form.append('0', body);
    body = form;
  }
  const response = createResponse(
    serverManifest,
    '',
    options ? options.temporaryReferences : undefined,
    body,
  );
  const root = getRoot   (response);
  close(response);
  return root;
}

export function decodeAction   (body          )                          {
  return decodeActionImpl(body, serverManifest);
}

export function decodeFormState   (
  actionResult   ,
  body          ,
)                                                       {
  return decodeFormStateImpl(actionResult, body, serverManifest);
}

export function loadServerAction                      (id        )             {
  const reference = resolveServerReference     (serverManifest, id);
  return Promise.resolve(reference)
    .then(() => preloadModule(reference))
    .then(() => {
      const fn = requireModule(reference);
      if (typeof fn !== 'function') {
        throw new Error('Server actions must be functions');
      }
      return fn;
    });
}
