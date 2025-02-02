/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

/* global Bun */

                                                               
               
                                         
                            
                     
  
                                                      

                                      
                                  
                                           

export function scheduleWork(callback            ) {
  setTimeout(callback, 0);
}

export const scheduleMicrotask = queueMicrotask;

export function flushBuffered(destination             ) {
  // Bun direct streams provide a flush function.
  // If we don't have any more data to send right now.
  // Flush whatever is in the buffer to the wire.
  if (typeof destination.flush === 'function') {
    destination.flush();
  }
}

export function beginWriting(destination             ) {}

export function writeChunk(
  destination             ,
  chunk                                        ,
)       {
  if (chunk.length === 0) {
    return;
  }

  destination.write(chunk);
}

export function writeChunkAndReturn(
  destination             ,
  chunk                                        ,
)          {
  return !!destination.write(chunk);
}

export function completeWriting(destination             ) {}

export function close(destination             ) {
  destination.end();
}

export function stringToChunk(content        )        {
  return content;
}

export function stringToPrecomputedChunk(content        )                   {
  return content;
}

export function typedArrayToBinaryChunk(
  content                  ,
)              {
  // TODO: Does this needs to be cloned if it's transferred in enqueue()?
  return content;
}

export function byteLengthOfChunk(chunk                          )         {
  return Buffer.byteLength(chunk, 'utf8');
}

export function byteLengthOfBinaryChunk(chunk             )         {
  return chunk.byteLength;
}

export function closeWithError(destination             , error       )       {
  if (typeof destination.error === 'function') {
    // $FlowFixMe[incompatible-call]: This is an Error object or the destination accepts other types.
    destination.error(error);
  } else {
    // Earlier implementations doesn't support this method. In that environment you're
    // supposed to throw from a promise returned but we don't return a promise in our
    // approach. We could fork this implementation but this is environment is an edge
    // case to begin with. It's even less common to run this in an older environment.
    // Even then, this is not where errors are supposed to happen and they get reported
    // to a global callback in addition to this anyway. So it's fine just to close this.
    destination.close();
  }
}

export function createFastHash(input        )                  {
  return Bun.hash(input);
}
