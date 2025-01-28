/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

import {useState, useEffect} from 'react';
                                                                     

// Events that are prefixed with `extension` will only be emitted for the browser extension implementation.
// For other implementations, this hook will just return constant `true` value.
export function useExtensionComponentsPanelVisibility(
  bridge                ,
)          {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    function onPanelShown() {
      setIsVisible(true);
    }
    function onPanelHidden() {
      setIsVisible(false);
    }

    bridge.addListener('extensionComponentsPanelShown', onPanelShown);
    bridge.addListener('extensionComponentsPanelHidden', onPanelHidden);

    return () => {
      bridge.removeListener('extensionComponentsPanelShown', onPanelShown);
      bridge.removeListener('extensionComponentsPanelHidden', onPanelHidden);
    };
  }, [bridge]);

  return isVisible;
}
