/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                                     

             
              
                 
                
                 
                
                                                          

import {pushStartInstance as pushStartInstanceImpl} from 'react-dom-bindings/src/server/ReactFizzConfigDOM';

             
              
        
                   
                                                  

                                                                                  

import {NotPending} from 'react-dom-bindings/src/shared/ReactDOMFormActions';

import hasOwnProperty from 'shared/hasOwnProperty';

// Allow embedding inside another Fizz render.
export const isPrimaryRenderer = false;

// Disable Client Hooks
export const supportsClientAPIs = false;

import {stringToChunk} from 'react-server/src/ReactServerStreamConfig';

             
              
                 
                 
                
                
                                                          

export {
  getChildFormatContext,
  makeId,
  pushEndInstance,
  pushFormStateMarkerIsMatching,
  pushFormStateMarkerIsNotMatching,
  writeStartSegment,
  writeEndSegment,
  writeCompletedSegmentInstruction,
  writeCompletedBoundaryInstruction,
  writeClientRenderBoundaryInstruction,
  writeStartPendingSuspenseBoundary,
  writeEndPendingSuspenseBoundary,
  writeHoistablesForBoundary,
  writePlaceholder,
  writeCompletedRoot,
  createRootFormatContext,
  createRenderState,
  createResumableState,
  createPreambleState,
  createHoistableState,
  writePreambleStart,
  writePreambleEnd,
  writeHoistables,
  writePostamble,
  hoistHoistables,
  resetResumableState,
  completeResumableState,
  emitEarlyPreloads,
  doctypeChunk,
  canHavePreamble,
  hoistPreambleState,
  isPreambleReady,
  isPreambleContext,
} from 'react-dom-bindings/src/server/ReactFizzConfigDOM';

import escapeTextForBrowser from 'react-dom-bindings/src/server/escapeTextForBrowser';

export function pushStartInstance(
  target                                 ,
  type        ,
  props        ,
  resumableState                ,
  renderState             ,
  preambleState                      ,
  hoistableState                       ,
  formatContext               ,
  textEmbedded         ,
  isFallback         ,
)                {
  for (const propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      const propValue = props[propKey];
      if (propKey === 'ref' && propValue != null) {
        throw new Error(
          'Cannot pass ref in renderToHTML because they will never be hydrated.',
        );
      }
      if (typeof propValue === 'function') {
        throw new Error(
          'Cannot pass event handlers (' +
            propKey +
            ') in renderToHTML because ' +
            'the HTML will never be hydrated so they can never get called.',
        );
      }
    }
  }

  return pushStartInstanceImpl(
    target,
    type,
    props,
    resumableState,
    renderState,
    preambleState,
    hoistableState,
    formatContext,
    textEmbedded,
    isFallback,
  );
}

export function pushTextInstance(
  target                                 ,
  text        ,
  renderState             ,
  textEmbedded         ,
)          {
  // Markup doesn't need any termination.
  target.push(stringToChunk(escapeTextForBrowser(text)));
  return false;
}

export function pushSegmentFinale(
  target                                 ,
  renderState             ,
  lastPushedText         ,
  textEmbedded         ,
)       {
  // Markup doesn't need any termination.
  return;
}

export function writeStartCompletedSuspenseBoundary(
  destination             ,
  renderState             ,
)          {
  // Markup doesn't have any instructions.
  return true;
}
export function writeStartClientRenderedSuspenseBoundary(
  destination             ,
  renderState             ,
  // flushing these error arguments are not currently supported in this legacy streaming format.
  errorDigest         ,
  errorMessage         ,
  errorStack         ,
  errorComponentStack         ,
)          {
  // Markup doesn't have any instructions.
  return true;
}

export function writeEndCompletedSuspenseBoundary(
  destination             ,
  renderState             ,
)          {
  // Markup doesn't have any instructions.
  return true;
}
export function writeEndClientRenderedSuspenseBoundary(
  destination             ,
  renderState             ,
)          {
  // Markup doesn't have any instructions.
  return true;
}

                                          
export const NotPendingTransition                   = NotPending;
