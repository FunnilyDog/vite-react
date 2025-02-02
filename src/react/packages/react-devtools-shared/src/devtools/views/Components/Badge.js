/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

import * as React from 'react';

import styles from './Badge.css';

              
                     
                       
  

export default function Badge({className = '', children}       )             {
  return <div className={`${styles.Badge} ${className}`}>{children}</div>;
}
