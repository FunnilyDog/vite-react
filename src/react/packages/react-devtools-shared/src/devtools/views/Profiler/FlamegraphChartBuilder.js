/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

import {formatDuration} from './utils';
import ProfilerStore from 'react-devtools-shared/src/devtools/ProfilerStore';

                                        

                         
                         
                     
             
                
               
                 
                       
                           
  

                         
                       
                
                                    
                          
                               
                                
  

const cachedChartData                         = new Map();

export function getChartData({
  commitIndex,
  commitTree,
  profilerStore,
  rootID,
}   
                      
                         
                               
                 
 )            {
  const commitDatum = profilerStore.getCommitData(rootID, commitIndex);

  const {fiberActualDurations, fiberSelfDurations} = commitDatum;
  const {nodes} = commitTree;

  const chartDataKey = `${rootID}-${commitIndex}`;
  if (cachedChartData.has(chartDataKey)) {
    return ((cachedChartData.get(chartDataKey)     )           );
  }

  const idToDepthMap                      = new Map();
  const renderPathNodes              = new Set();
  const rows                          = [];

  let maxDepth = 0;
  let maxSelfDuration = 0;

  // Generate flame graph structure using tree base durations.
  const walkTree = (
    id        ,
    rightOffset        ,
    currentDepth        ,
  )            => {
    idToDepthMap.set(id, currentDepth);

    const node = nodes.get(id);
    if (node == null) {
      throw Error(`Could not find node with id "${id}" in commit tree`);
    }

    const {
      children,
      displayName,
      hocDisplayNames,
      key,
      treeBaseDuration,
      compiledWithForget,
    } = node;

    const actualDuration = fiberActualDurations.get(id) || 0;
    const selfDuration = fiberSelfDurations.get(id) || 0;
    const didRender = fiberActualDurations.has(id);

    const name = displayName || 'Anonymous';
    const maybeKey = key !== null ? ` key="${key}"` : '';

    let maybeBadge = '';
    const maybeForgetBadge = compiledWithForget ? '✨ ' : '';

    if (hocDisplayNames !== null && hocDisplayNames.length > 0) {
      maybeBadge = ` (${hocDisplayNames[0]})`;
    }

    let label = `${maybeForgetBadge}${name}${maybeBadge}${maybeKey}`;
    if (didRender) {
      label += ` (${formatDuration(selfDuration)}ms of ${formatDuration(
        actualDuration,
      )}ms)`;
    }

    maxDepth = Math.max(maxDepth, currentDepth);
    maxSelfDuration = Math.max(maxSelfDuration, selfDuration);

    const chartNode            = {
      actualDuration,
      didRender,
      id,
      label,
      name,
      offset: rightOffset - treeBaseDuration,
      selfDuration,
      treeBaseDuration,
    };

    if (currentDepth > rows.length) {
      rows.push([chartNode]);
    } else {
      rows[currentDepth - 1].push(chartNode);
    }

    for (let i = children.length - 1; i >= 0; i--) {
      const childID = children[i];
      const childChartNode             = walkTree(
        childID,
        rightOffset,
        currentDepth + 1,
      );
      rightOffset -= childChartNode.treeBaseDuration;
    }

    return chartNode;
  };

  let baseDuration = 0;

  // Special case to handle unmounted roots.
  if (nodes.size > 0) {
    // Skip over the root; we don't want to show it in the flamegraph.
    const root = nodes.get(rootID);
    if (root == null) {
      throw Error(
        `Could not find root node with id "${rootID}" in commit tree`,
      );
    }

    // Don't assume a single root.
    // Component filters or Fragments might lead to multiple "roots" in a flame graph.
    for (let i = root.children.length - 1; i >= 0; i--) {
      const id = root.children[i];
      const node = nodes.get(id);
      if (node == null) {
        throw Error(`Could not find node with id "${id}" in commit tree`);
      }
      baseDuration += node.treeBaseDuration;
      walkTree(id, baseDuration, 1);
    }

    fiberActualDurations.forEach((duration, id) => {
      let node = nodes.get(id);
      if (node != null) {
        let currentID = node.parentID;
        while (currentID !== 0) {
          if (renderPathNodes.has(currentID)) {
            // We've already walked this path; we can skip it.
            break;
          } else {
            renderPathNodes.add(currentID);
          }

          node = nodes.get(currentID);
          currentID = node != null ? node.parentID : 0;
        }
      }
    });
  }

  const chartData = {
    baseDuration,
    depth: maxDepth,
    idToDepthMap,
    maxSelfDuration,
    renderPathNodes,
    rows,
  };

  cachedChartData.set(chartDataKey, chartData);

  return chartData;
}

export function invalidateChartData()       {
  cachedChartData.clear();
}
