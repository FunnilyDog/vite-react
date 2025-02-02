/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                  
                                   
                                              
                                     

import {isReactNativeEnvironment} from 'react-devtools-shared/src/backend/utils';

// Note these colors are in sync with DevTools Profiler chart colors.
const COLORS = [
  '#37afa9',
  '#63b19e',
  '#80b393',
  '#97b488',
  '#abb67d',
  '#beb771',
  '#cfb965',
  '#dfba57',
  '#efbb49',
  '#febc38',
];

let canvas                           = null;

function drawNative(nodeToData                         , agent       ) {
  const nodesToDraw = [];
  iterateNodes(nodeToData, ({color, node}) => {
    nodesToDraw.push({node, color});
  });

  agent.emit('drawTraceUpdates', nodesToDraw);

  const mergedNodes = groupAndSortNodes(nodeToData);
  agent.emit('drawGroupedTraceUpdatesWithNames', mergedNodes);
}

function drawWeb(nodeToData                         ) {
  if (canvas === null) {
    initialize();
  }

  const dpr = window.devicePixelRatio || 1;
  const canvasFlow                    = ((canvas     )                   );
  canvasFlow.width = window.innerWidth * dpr;
  canvasFlow.height = window.innerHeight * dpr;
  canvasFlow.style.width = `${window.innerWidth}px`;
  canvasFlow.style.height = `${window.innerHeight}px`;

  const context = canvasFlow.getContext('2d');
  context.scale(dpr, dpr);

  context.clearRect(0, 0, canvasFlow.width / dpr, canvasFlow.height / dpr);

  const mergedNodes = groupAndSortNodes(nodeToData);

  mergedNodes.forEach(group => {
    drawGroupBorders(context, group);
    drawGroupLabel(context, group);
  });
}

                  
             
                
                             
                
  

                        

export function groupAndSortNodes(
  nodeToData                         ,
)                          {
  const positionGroups                                = new Map();

  iterateNodes(nodeToData, ({rect, color, displayName, count}) => {
    if (!rect) return;
    const key = `${rect.left},${rect.top}`;
    if (!positionGroups.has(key)) positionGroups.set(key, []);
    positionGroups.get(key)?.push({rect, color, displayName, count});
  });

  return Array.from(positionGroups.values()).sort((groupA, groupB) => {
    const maxCountA = Math.max(...groupA.map(item => item.count));
    const maxCountB = Math.max(...groupB.map(item => item.count));
    return maxCountA - maxCountB;
  });
}

function drawGroupBorders(
  context                          ,
  group                  ,
) {
  group.forEach(({color, rect}) => {
    context.beginPath();
    context.strokeStyle = color;
    context.rect(rect.left, rect.top, rect.width - 1, rect.height - 1);
    context.stroke();
  });
}

function drawGroupLabel(
  context                          ,
  group                  ,
) {
  const mergedName = group
    .map(({displayName, count}) =>
      displayName ? `${displayName}${count > 1 ? ` x${count}` : ''}` : '',
    )
    .filter(Boolean)
    .join(', ');

  if (mergedName) {
    drawLabel(context, group[0].rect, mergedName, group[0].color);
  }
}

export function draw(nodeToData                         , agent       )       {
  return isReactNativeEnvironment()
    ? drawNative(nodeToData, agent)
    : drawWeb(nodeToData);
}

                             
          
                
                     
  

function iterateNodes(
  nodeToData                         ,
  execute                                      ,
) {
  nodeToData.forEach((data, node) => {
    const colorIndex = Math.min(COLORS.length - 1, data.count - 1);
    const color = COLORS[colorIndex];
    execute({
      color,
      node,
      count: data.count,
      displayName: data.displayName,
      expirationTime: data.expirationTime,
      lastMeasuredAt: data.lastMeasuredAt,
      rect: data.rect,
    });
  });
}

function drawLabel(
  context                          ,
  rect      ,
  text        ,
  color        ,
)       {
  const {left, top} = rect;
  context.font = '10px monospace';
  context.textBaseline = 'middle';
  context.textAlign = 'center';

  const padding = 2;
  const textHeight = 14;

  const metrics = context.measureText(text);
  const backgroundWidth = metrics.width + padding * 2;
  const backgroundHeight = textHeight;
  const labelX = left;
  const labelY = top - backgroundHeight;

  context.fillStyle = color;
  context.fillRect(labelX, labelY, backgroundWidth, backgroundHeight);

  context.fillStyle = '#000000';
  context.fillText(
    text,
    labelX + backgroundWidth / 2,
    labelY + backgroundHeight / 2,
  );
}

function destroyNative(agent       ) {
  agent.emit('disableTraceUpdates');
}

function destroyWeb() {
  if (canvas !== null) {
    if (canvas.parentNode != null) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas = null;
  }
}

export function destroy(agent       )       {
  return isReactNativeEnvironment() ? destroyNative(agent) : destroyWeb();
}

function initialize()       {
  canvas = window.document.createElement('canvas');
  canvas.style.cssText = `
    xx-background-color: red;
    xx-opacity: 0.5;
    bottom: 0;
    left: 0;
    pointer-events: none;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 1000000000;
  `;

  const root = window.document.documentElement;
  root.insertBefore(canvas, root.firstChild);
}
