/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                                        
                                     

import memoize from 'memoize-one';

import {View} from './View';
import {zeroPoint} from './geometry';
import {DPR} from '../content-views/constants';

                        
                          
                           
  

// hidpi canvas: https://web.dev/articles/canvas-hidipi
function configureRetinaCanvas(
  canvas                   ,
  height        ,
  width        ,
) {
  canvas.width = width * DPR;
  canvas.height = height * DPR;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

const getCanvasContext = memoize(
  (
    canvas                   ,
    height        ,
    width        ,
    scaleCanvas          = true,
  )                           => {
    const context = canvas.getContext('2d', {alpha: false});
    if (scaleCanvas) {
      configureRetinaCanvas(canvas, height, width);

      // Scale all drawing operations by the dpr, so you don't have to worry about the difference.
      context.scale(DPR, DPR);
    }
    return context;
  },
);

                                      

/**
 * Represents the canvas surface and a view heirarchy. A surface is also the
 * place where all interactions enter the view heirarchy.
 */
export class Surface {
  rootView       ;

  _context                           ;
  _canvasSize       ;

  _resetHoveredEvent                     ;

  _viewRefs           = {
    activeView: null,
    hoveredView: null,
  };

  constructor(resetHoveredEvent                     ) {
    this._resetHoveredEvent = resetHoveredEvent;
  }

  hasActiveView()          {
    return this._viewRefs.activeView !== null;
  }

  setCanvas(canvas                   , canvasSize      ) {
    this._context = getCanvasContext(
      canvas,
      canvasSize.height,
      canvasSize.width,
    );
    this._canvasSize = canvasSize;

    if (this.rootView) {
      this.rootView.setNeedsDisplay();
    }
  }

  displayIfNeeded() {
    const {rootView, _canvasSize, _context} = this;
    if (!rootView || !_context || !_canvasSize) {
      return;
    }
    rootView.setFrame({
      origin: zeroPoint,
      size: _canvasSize,
    });
    rootView.setVisibleArea({
      origin: zeroPoint,
      size: _canvasSize,
    });
    rootView.displayIfNeeded(_context, this._viewRefs);
  }

  getCurrentCursor()                {
    const {activeView, hoveredView} = this._viewRefs;
    if (activeView !== null) {
      return activeView.currentCursor;
    } else if (hoveredView !== null) {
      return hoveredView.currentCursor;
    } else {
      return null;
    }
  }

  handleInteraction(interaction             ) {
    const rootView = this.rootView;
    if (rootView != null) {
      const viewRefs = this._viewRefs;
      switch (interaction.type) {
        case 'mousemove':
        case 'wheel-control':
        case 'wheel-meta':
        case 'wheel-plain':
        case 'wheel-shift':
          // Clean out the hovered view before processing this type of interaction.
          const hoveredView = viewRefs.hoveredView;
          viewRefs.hoveredView = null;

          rootView.handleInteractionAndPropagateToSubviews(
            interaction,
            viewRefs,
          );

          // If a previously hovered view is no longer hovered, update the outer state.
          if (hoveredView !== null && viewRefs.hoveredView === null) {
            this._resetHoveredEvent();
          }
          break;
        default:
          rootView.handleInteractionAndPropagateToSubviews(
            interaction,
            viewRefs,
          );
          break;
      }
    }
  }
}
